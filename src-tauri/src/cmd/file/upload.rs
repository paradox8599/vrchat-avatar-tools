use std::path::PathBuf;

use base64::Engine;
use serde::{Deserialize, Serialize};
use tauri::command;
use vrchatapi::{
    apis::{
        configuration::Configuration,
        files_api::{self, FinishFileDataUploadError, StartFileDataUploadError},
        Error, ResponseContent,
    },
    models::{File, FileUploadUrl},
};

use crate::{err::AppError, files::AppFiles, stores::cookies::ConfigCookieMap};

use super::{handle_api_error, FileType};

async fn start_upload(
    config: &Configuration,
    file_id: &str,
    file_type: &str,
    version_id: i32,
) -> Result<FileUploadUrl, AppError> {
    let url = files_api::start_file_data_upload(config, file_id, version_id, file_type, None)
        .await
        .map_err(|e| {
            eprintln!("start_upload error: {e:?}");
            handle_api_error(
                e,
                |e| match e {
                    StartFileDataUploadError::Status400(e) => {
                        AppError::UnsuccessfulStatus(400, format!("{e:?}"))
                    }
                    StartFileDataUploadError::UnknownValue(e) => AppError::Unknown(e.to_string()),
                },
                |_| {},
            )
        })?;
    Ok(url)
}

pub async fn finish_file_data_upload(
    configuration: &Configuration,
    file_id: &str,
    version_id: i32,
    file_type: &str,
    finish_file_data_upload_request: Option<vrchatapi::models::FinishFileDataUploadRequest>,
) -> Result<File, Error<FinishFileDataUploadError>> {
    let local_var_configuration = configuration;

    let local_var_client = &local_var_configuration.client;

    let local_var_uri_str = format!(
        "{}/file/{fileId}/{versionId}/{fileType}/finish",
        local_var_configuration.base_path,
        fileId = vrchatapi::apis::urlencode(file_id),
        versionId = version_id,
        fileType = vrchatapi::apis::urlencode(file_type)
    );
    let mut local_var_req_builder =
        local_var_client.request(reqwest::Method::PUT, local_var_uri_str.as_str());

    if let Some(ref local_var_user_agent) = local_var_configuration.user_agent {
        local_var_req_builder =
            local_var_req_builder.header(reqwest::header::USER_AGENT, local_var_user_agent.clone());
    }

    if let Some(data) = finish_file_data_upload_request {
        local_var_req_builder = local_var_req_builder.json(&data);
    }

    let local_var_req = local_var_req_builder.build()?;
    let local_var_resp = local_var_client.execute(local_var_req).await?;

    let local_var_status = local_var_resp.status();
    let local_var_content = local_var_resp.text().await?;
    let local_var_content = local_var_content.replace("\"_id\"", "\"id\"");

    if !local_var_status.is_client_error() && !local_var_status.is_server_error() {
        serde_json::from_str(&local_var_content).map_err(Error::from)
    } else {
        let local_var_entity: Option<FinishFileDataUploadError> =
            serde_json::from_str(&local_var_content).ok();
        let local_var_error = ResponseContent {
            status: local_var_status,
            content: local_var_content,
            entity: local_var_entity,
        };
        Err(Error::ResponseError(local_var_error))
    }
}

async fn finish_upload(
    config: &Configuration,
    file_id: &str,
    file_type: &str,
    version_id: i32,
) -> Result<File, AppError> {
    let file = finish_file_data_upload(config, file_id, version_id, file_type, None)
        .await
        .map_err(|e| {
            eprintln!("finish_upload error: {e:?}");
            handle_api_error(
                e,
                |e| match e {
                    FinishFileDataUploadError::UnknownValue(e) => AppError::Unknown(e.to_string()),
                },
                |_| {},
            )
        })?;
    Ok(file)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UploadFileInfo {
    id: String,
    version: i32,
}

#[command]
pub async fn vrchat_upload_file(
    app: tauri::AppHandle,
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    mime_type: vrchatapi::models::MimeType,
    from: UploadFileInfo,
    to: UploadFileInfo,
) -> Result<(), AppError> {
    let path = PathBuf::from(&from.id).join(from.version.to_string());
    let cache = AppFiles::cache(&app, Some(path));

    let bytes_signature = cache.read(&FileType::Signagure.to_string())?;
    let bytes_file = cache.read(&FileType::File.to_string())?;

    if bytes_signature.is_none() || bytes_file.is_none() {
        return Err(AppError::UnsuccessfulStatus(
            404,
            "Source file not found".to_owned(),
        ));
    }

    let bytes_signature = bytes_signature.unwrap();
    let bytes_file = bytes_file.unwrap();

    let cc = ccmap.get(&username).await;
    let config = cc.config.write().await;

    // start upload

    let client = reqwest::Client::builder()
        .cookie_provider(cc.cookies.clone())
        .build()
        .expect("failed to create reqwest client");

    // upload signature
    {
        let file_type = FileType::Signagure.to_string();
        let url = start_upload(&config, &to.id, &file_type, to.version).await?;
        let digest = md5::compute(&bytes_signature);
        let hash = base64::engine::general_purpose::STANDARD.encode(digest.0);

        let resp = client
            .put(url.url)
            .header("content-type", "application/x-rsync-signature")
            .header("content-md5", hash)
            .body(bytes_signature)
            .send()
            .await;

        match resp {
            Ok(resp) => {
                if resp.status().is_success() {
                    finish_upload(&config, &to.id, &file_type, to.version).await?;
                } else {
                    return Err(AppError::UnsuccessfulStatus(
                        resp.status().as_u16(),
                        "".to_owned(),
                    ));
                }
            }
            Err(e) => {
                eprintln!("upload signature request error: {e:?}");
                return Err(AppError::UnsuccessfulStatus(555, "".to_owned()));
            }
        }
    }

    // upload file
    {
        let file_type = FileType::File.to_string();
        let url = start_upload(&config, &to.id, &file_type, to.version).await?;
        let digest = md5::compute(&bytes_file);
        let hash = base64::engine::general_purpose::STANDARD.encode(digest.0);

        let resp = client
            .put(url.url)
            .header("Content-Type", mime_type.to_string())
            .header("content-md5", hash)
            .header("user-agent", "VRC.Core.BestHTTP")
            .body(bytes_file)
            .send()
            .await;

        match resp {
            Ok(resp) => {
                if resp.status().is_success() {
                    finish_upload(&config, &to.id, &file_type, to.version).await?;
                } else {
                    return Err(AppError::UnsuccessfulStatus(
                        resp.status().as_u16(),
                        "".to_owned(),
                    ));
                }
            }
            Err(e) => {
                eprintln!("upload signature request error: {e:?}");
                return Err(AppError::UnsuccessfulStatus(555, "".to_owned()));
            }
        }
    }

    Ok(())
}
