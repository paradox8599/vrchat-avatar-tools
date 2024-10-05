use tauri::command;
use vrchatapi::{
    apis::avatars_api::{GetAvatarError, SearchAvatarsError},
    models::{self, Avatar, SortOption},
};

use crate::{cookies::ConfigCookieMap, err::AppError};

use super::handle_api_error;

#[command]
pub async fn vrchat_get_avatar_info(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    avatar_id: String,
) -> Result<Avatar, AppError> {
    let cc = ccmap.get_or_load(&username).await;
    let config = cc.config.write().await;
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

#[command]
pub async fn vrchat_get_own_avatars(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
) -> Result<Vec<Avatar>, AppError> {
    let cc = ccmap.get_or_load(&username).await;
    let config = cc.config.write().await;
    let mut avatars: Vec<Avatar> = vec![];
    let mut offset = 0;
    loop {
        let page = vrchatapi::apis::avatars_api::search_avatars(
            &config,                     //     configuration: &configuration::Configuration,
            None,                        //     featured: Option<bool>,
            Some(SortOption::CreatedAt), //     sort: Option<models::SortOption>,
            Some("me"),                  //     user: Option<&str>,
            None,                        //     user_id: Option<&str>,
            Some(100),                   //     n: Option<i32>,
            None,                        //     order: Option<models::OrderOption>,
            Some(offset),                //     offset: Option<i32>,
            None,                        //     tag: Option<&str>,
            None,                        //     notag: Option<&str>,
            None,                        //     release_status: Option<models::ReleaseStatus>,
            None,                        //     max_unity_version: Option<&str>,
            None,                        //     min_unity_version: Option<&str>,
            None,                        //     platform: Option<&str>,
        )
        .await
        .map_err(|e| {
            cc.save();
            handle_api_error(
                e,
                |e| match e {
                    SearchAvatarsError::Status401(_) => unreachable!(),
                    SearchAvatarsError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                },
                |_| {},
            )
        })?;

        if page.len() < 100 {
            break;
        }

        offset += 100;
        avatars.extend(page);
    }
    Ok(avatars)
}
