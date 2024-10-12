use tauri::command;
use vrchatapi::{
    apis::files_api::{self, GetFileError, GetFilesError},
    models::File,
};

use crate::{cookies::ConfigCookieMap, err::AppError};

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
