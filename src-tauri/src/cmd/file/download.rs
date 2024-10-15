use std::path::PathBuf;

use tauri::command;
use vrchatapi::apis::{
    configuration::Configuration, files_api::DownloadFileVersionError, Error, ResponseContent,
};

use crate::{err::AppError, files::AppFiles, stores::cookies::ConfigCookieMap};

use super::{handle_api_error, FileType};

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

async fn save_download_file(
    app: &tauri::AppHandle,
    config: &Configuration,
    file_id: &str,
    version_id: i32,
    file_type: FileType,
) -> Result<(), AppError> {
    let bytes = download_file_version(config, file_id, version_id, &file_type)
        .await
        .map_err(|e| {
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
    let path = PathBuf::from(&file_id).join(format!("{version_id}"));
    AppFiles::cache(app, Some(path)).write(&file_type.to_string(), bytes)?;
    Ok(())
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
    save_download_file(&app, &config, &file_id, version_id, file_type).await?;
    Ok(())
}
