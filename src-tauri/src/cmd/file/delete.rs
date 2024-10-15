use tauri::command;
use vrchatapi::{
    apis::files_api::{self, DeleteFileVersionError},
    models::File,
};

use crate::{err::AppError, stores::cookies::ConfigCookieMap};

use super::handle_api_error;

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
