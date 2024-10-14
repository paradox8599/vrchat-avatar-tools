use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::command;
use vrchatapi::{
    apis::{
        configuration::Configuration,
        files_api::{
            self, CreateFileError, CreateFileVersionError, DeleteFileVersionError,
            DownloadFileVersionError, FinishFileDataUploadError, GetFileError, GetFilesError,
            StartFileDataUploadError,
        },
        Error, ResponseContent,
    },
    models::{CreateFileRequest, CreateFileVersionRequest, File, FileUploadUrl},
};

use crate::{err::AppError, files::AppFiles, stores::cookies::ConfigCookieMap};

use super::handle_api_error;

#[command]
pub async fn vrchat_get_files(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
) -> Result<Vec<File>, AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let mut files = vec![];
    let mut offset = 0;
    let n = 100;
    loop {
        let page = files_api::get_files(&config, None, None, Some(n), Some(offset))
            .await
            .map_err(|e| {
                cc.save();
                handle_api_error(
                    e,
                    |e| match e {
                        GetFilesError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                    },
                    |_| {},
                )
            })?;

        let len = page.len() as i32;

        files.extend(page);

        if len < n {
            break;
        }
        offset += len as i32;
    }
    Ok(files)
}

#[command]
pub async fn vrchat_show_file(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    file_id: String,
) -> Result<File, AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let file = files_api::get_file(&config, &file_id).await.map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                GetFileError::Status404(_) => {
                    AppError::UnsuccessfulStatus(404, "File not found".to_owned())
                }
                GetFileError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })?;
    cc.save();
    Ok(file)
}

#[command]
pub async fn vrchat_create_file(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    create_file_request: Option<CreateFileRequest>,
) -> Result<File, AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let file = files_api::create_file(&config, create_file_request)
        .await
        .map_err(|e| {
            cc.save();
            handle_api_error(
                e,
                |e| match e {
                    CreateFileError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                },
                |_| {},
            )
        })?;

    Ok(file)
}

#[derive(Serialize, Deserialize, Debug)]
pub enum FileType {
    #[serde(rename = "file")]
    File,
    #[serde(rename = "signature")]
    Signagure,
    #[serde(rename = "delta")]
    Delta,
}

impl std::fmt::Display for FileType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let name = match self {
            Self::File => "file",
            Self::Signagure => "signature",
            Self::Delta => "delta",
        };
        write!(f, "{name}")
    }
}

async fn download_file_version(
    configuration: &Configuration,
    file_id: &str,
    version_id: i32,
    file_type: &FileType,
) -> Result<bytes::Bytes, Error<DownloadFileVersionError>> {
    let local_var_configuration = configuration;

    let local_var_client = &local_var_configuration.client;

    let local_var_uri_str = format!(
        "{}/file/{fileId}/{versionId}/{fileType}",
        local_var_configuration.base_path,
        fileId = vrchatapi::apis::urlencode(file_id),
        versionId = version_id,
        fileType = file_type
    );
    let mut local_var_req_builder =
        local_var_client.request(reqwest::Method::GET, local_var_uri_str.as_str());

    if let Some(ref local_var_user_agent) = local_var_configuration.user_agent {
        local_var_req_builder =
            local_var_req_builder.header(reqwest::header::USER_AGENT, local_var_user_agent.clone());
    }

    let local_var_req = local_var_req_builder.build()?;
    let local_var_resp = local_var_client.execute(local_var_req).await?;

    let local_var_status = local_var_resp.status();

    if !local_var_status.is_client_error() && !local_var_status.is_server_error() {
        let bytes = local_var_resp.bytes().await?;
        Ok(bytes)
    } else {
        let local_var_content = local_var_resp.text().await?;
        let local_var_entity: Option<DownloadFileVersionError> =
            serde_json::from_str(&local_var_content).ok();
        let local_var_error = ResponseContent {
            status: local_var_status,
            content: local_var_content,
            entity: local_var_entity,
        };
        Err(Error::ResponseError(local_var_error))
    }
}

#[command]
pub async fn vrchat_download_file(
    app: tauri::AppHandle,
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    file_id: String,
    version_id: i32,
    file_type: FileType,
) -> Result<(), AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let bytes = download_file_version(&config, &file_id, version_id, &file_type)
        .await
        .map_err(|e| {
            cc.save();
            handle_api_error(
                e,
                |e| {
                    println!("{e:?}");
                    match e {
                        DownloadFileVersionError::Status404(_) => {
                            AppError::UnsuccessfulStatus(404, "File version not found".to_owned())
                        }
                        DownloadFileVersionError::UnknownValue(v) => {
                            AppError::Unknown(v.to_string())
                        }
                    }
                },
                |_| {},
            )
        })?;

    let path = PathBuf::from(&file_type.to_string());
    AppFiles::cache(&app, Some(path)).write(&file_id, bytes)?;

    Ok(())
}

#[command]
pub async fn vrchat_create_file_version(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    file_id: String,
    create_file_version_request: Option<CreateFileVersionRequest>,
) -> Result<File, AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let file = files_api::create_file_version(&config, &file_id, create_file_version_request)
        .await
        .map_err(|e| {
            cc.save();
            handle_api_error(
                e,
                |e| {
                    println!("{e:?}");
                    match e {
                        CreateFileVersionError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                    }
                },
                |_| {},
            )
        })?;
    Ok(file)
}

#[command]
pub async fn vrchat_delete_file_version(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    file_id: String,
    version_id: i32,
) -> Result<File, AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let file = files_api::delete_file_version(&config, &file_id, version_id)
        .await
        .map_err(|e| {
            cc.save();
            handle_api_error(
                e,
                |e| {
                    println!("{e:?}");
                    match e {
                        DeleteFileVersionError::Status400(e) => {
                            AppError::UnsuccessfulStatus(400, format!("{e:?}"))
                        }
                        DeleteFileVersionError::Status500(e) => {
                            AppError::UnsuccessfulStatus(500, format!("{e:?}"))
                        }
                        DeleteFileVersionError::UnknownValue(e) => AppError::Unknown(e.to_string()),
                    }
                },
                |_| {},
            )
        })?;
    Ok(file)
}

async fn start_upload(
    config: &Configuration,
    file_id: &str,
    file_type: &str,
    version_id: i32,
) -> Result<FileUploadUrl, AppError> {
    let url = files_api::start_file_data_upload(config, file_id, version_id, file_type, None)
        .await
        .map_err(|e| {
            handle_api_error(
                e,
                |e| {
                    println!("{e:?}");
                    match e {
                        StartFileDataUploadError::Status400(e) => {
                            AppError::UnsuccessfulStatus(400, format!("{e:?}"))
                        }
                        StartFileDataUploadError::UnknownValue(e) => {
                            AppError::Unknown(e.to_string())
                        }
                    }
                },
                |_| {},
            )
        })?;
    Ok(url)
}

async fn finish_upload(
    config: &Configuration,
    file_id: &str,
    file_type: &str,
    version_id: i32,
) -> Result<File, AppError> {
    let file = files_api::finish_file_data_upload(config, file_id, version_id, file_type, None)
        .await
        .map_err(|e| {
            handle_api_error(
                e,
                |e| {
                    println!("{e:?}");
                    match e {
                        FinishFileDataUploadError::UnknownValue(e) => {
                            AppError::Unknown(e.to_string())
                        }
                    }
                },
                |_| {},
            )
        })?;
    Ok(file)
}

#[command]
pub async fn vrchat_upload_file(
    app: tauri::AppHandle,
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    file_id: String,
    file_type: String,
    content_type: String,
    version_id: i32,
) -> Result<(), AppError> {
    // TODO: read file and signature
    let cache = AppFiles::cache(&app, None);
    let bytes = cache.read(&file_id)?;
    if bytes.is_none() {
        let app_err = AppError::UnsuccessfulStatus(404, "File not found".to_owned());
        return Err(app_err);
    }
    let bytes = bytes.unwrap();

    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;

    // start upload

    let url = start_upload(&config, &file_id, &file_type, version_id).await?;

    let client = reqwest::Client::builder()
        .cookie_provider(cc.cookies.clone())
        .build()
        .expect("failed to create reqwest client");

    let resp = client
        .put(url.url)
        .header("Content-Type", content_type)
        .body(bytes)
        .send()
        .await;

    match resp {
        Ok(_) => {
            finish_upload(&config, &file_id, &file_type, version_id).await?;
        }
        Err(e) => {
            eprintln!("{e:?}");
            // TODO: handle error
        }
    }

    Ok(())
}
