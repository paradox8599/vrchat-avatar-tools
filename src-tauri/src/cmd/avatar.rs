use tauri::command;
use vrchatapi::{
    apis::{avatars_api::GetAvatarError, configuration::Configuration},
    models::Avatar,
};

use crate::{cookies::cookies_save, err::AppError, Arw};

use super::handle_api_error;

#[command]
pub async fn vrchat_get_avatar_info(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
    avatar_id: String,
) -> Result<Avatar, AppError> {
    let config = config.read().await;
    let avatar: Avatar = vrchatapi::apis::avatars_api::get_avatar(&config, &avatar_id)
        .await
        .map_err(|e| {
            let _ = cookies_save(&app);
            handle_api_error(
                e,
                |e| match e {
                    GetAvatarError::Status401(_) => unreachable!(),
                    GetAvatarError::Status404(_) => unreachable!(),
                    GetAvatarError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
                |_| {},
            )
        })?;

    Ok(avatar)
}
