use tauri::command;
use vrchatapi::{
    apis::files_api::{self, CreateFileError, CreateFileVersionError},
    models::{CreateFileRequest, CreateFileVersionRequest, File},
};

use crate::{err::AppError, stores::cookies::ConfigCookieMap};

use super::handle_api_error;

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
