use tauri::command;
use vrchatapi::{apis::avatars_api::GetAvatarError, models::Avatar};

use crate::{cookies::ConfigCookies, err::AppError};

use super::handle_api_error;

#[command]
pub async fn vrchat_get_avatar_info(
    cc: tauri::State<'_, ConfigCookies>,
    avatar_id: String,
) -> Result<Avatar, AppError> {
    let config = cc.config.read().await;
    let avatar: Avatar = vrchatapi::apis::avatars_api::get_avatar(&config, &avatar_id)
        .await
        .map_err(|e| {
            cc.save();
            handle_api_error(
                e,
                |e| match e {
                    GetAvatarError::Status401(_) => unreachable!(),
                    GetAvatarError::Status404(_) => unreachable!(),
                    GetAvatarError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                },
                |_| {},
            )
        })?;

    Ok(avatar)
}
