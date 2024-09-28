use reqwest::StatusCode;
use tauri::command;
use vrchatapi::{
    apis::{avatars_api::GetAvatarError, configuration::Configuration, Error},
    models::Avatar,
};

use crate::{cookies::cookies_save, err::AppError, Arw};

use super::{auth_error, unknown_error};

#[command]
pub async fn vrchat_get_avatar_info(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
    avatar_id: String,
) -> Result<Avatar, AppError> {
    let config = config.read().await;
    let avatar: Avatar = vrchatapi::apis::avatars_api::get_avatar(&config, &avatar_id)
        .await
        .map_err(|e| match &e {
            Error::ResponseError(e) => match e.status {
                StatusCode::NOT_FOUND => AppError::AvatarNotFound(format!("{:?}", e)),
                _ => match &e.entity {
                    None => unknown_error(e),
                    Some(entity) => match entity {
                        GetAvatarError::Status401(e) => {
                            let _ = cookies_save(&app);
                            auth_error(e)
                        }
                        // NOTE: Status404 does not work, check StatusCode from response instead
                        GetAvatarError::Status404(e) => {
                            AppError::AvatarNotFound(format!("{:?}", e))
                        }
                        GetAvatarError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                    },
                },
            },
            e => AppError::UnknownError(e.to_string()),
        })?;

    Ok(avatar)
}
