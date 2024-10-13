use tauri::command;
use vrchatapi::{
    apis::{
        configuration::Configuration,
        files_api::{self, CreateFileError, DownloadFileVersionError, GetFileError, GetFilesError},
        Error, ResponseContent,
    },
    models::{CreateFileRequest, File},
};

use crate::{err::AppError, stores::cookies::ConfigCookieMap};

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

pub async fn download_file_version(
    configuration: &Configuration,
    file_id: &str,
    version_id: i32,
) -> Result<bytes::Bytes, Error<DownloadFileVersionError>> {
    let local_var_configuration = configuration;

    let local_var_client = &local_var_configuration.client;

    let local_var_uri_str = format!(
        "{}/file/{fileId}/{versionId}",
        local_var_configuration.base_path,
        fileId = vrchatapi::apis::urlencode(file_id),
        versionId = version_id
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
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    file_id: String,
    version_id: i32,
) -> Result<(), AppError> {
    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;
    let _bytes = download_file_version(&config, &file_id, version_id)
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

    Ok(())
}
