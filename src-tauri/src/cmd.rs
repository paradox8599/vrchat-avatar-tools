use tauri::command;
use vrchatapi::{
    apis::{
        authentication_api::{GetCurrentUserError, LogoutError, Verify2FaEmailCodeError},
        avatars_api::GetAvatarError,
        configuration::Configuration,
        Error,
    },
    models::{Avatar, EitherUserOrTwoFactor},
};

use crate::{
    cookies::{clear_cookies, save_cookies},
    err::AppError,
    Arw,
};

const WHITELISTED: [&str; 2] = [
    // uu
    "usr_352b1ce8-bec0-4f64-a648-b611d23b0a6c",
    // Brntm
    "usr_1c4f1844-9467-4566-b8df-4fad78d647ba",
];

#[command]
pub async fn vrchat_login(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
    username: String,
    password: String,
) -> Result<(), AppError> {
    let mut config = config.write().await;
    clear_cookies(&app)?;
    config.basic_auth = Some((username, Some(password)));
    save_cookies(&app)?;
    Ok(())
}

#[command]
pub async fn vrchat_get_me(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
) -> Result<EitherUserOrTwoFactor, AppError> {
    let config = config.write().await;
    let me = vrchatapi::apis::authentication_api::get_current_user(&config).await;

    save_cookies(&app)?;

    match me {
        Ok(me) => {
            if let EitherUserOrTwoFactor::CurrentUser(me) = &me {
                if !WHITELISTED.contains(&me.id.as_str()) {
                    eprintln!("{} not in whitelist", me.id);
                    clear_cookies(&app)?;
                    return Err(AppError::NotInWhiteList(me.id.to_owned()));
                }
            }
            Ok(me)
        }
        Err(e) => Err(match &e {
            Error::ResponseError(e) => match &e.entity {
                Some(entity) => match entity {
                    GetCurrentUserError::Status401(e) => AppError::AuthFailed(format!("{:?}", e)),
                    GetCurrentUserError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
                None => AppError::UnknownError(
                    serde_json::json!({
                        "status": e.status.to_string(), "content": e.content
                    })
                    .to_string(),
                ),
            },
            e => AppError::UnknownError(e.to_string()),
        }),
    }
}

#[command]
pub async fn vrchat_verify_emailotp(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
    code: String,
) -> Result<bool, AppError> {
    let config = config.read().await;
    let verify_result = vrchatapi::apis::authentication_api::verify2_fa_email_code(
        &config,
        vrchatapi::models::TwoFactorEmailCode { code },
    )
    .await;
    let verify_result = verify_result.map_err(|e| match &e {
        Error::ResponseError(e) => match &e.entity {
            Some(entity) => match entity {
                //
                // TODO: make auth error more specific for email verification?
                //
                Verify2FaEmailCodeError::Status401(e) => AppError::AuthFailed(format!("{:?}", e)),
                Verify2FaEmailCodeError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
            },
            None => AppError::UnknownError(
                serde_json::json!({
                    "status": e.status.to_string(), "content": e.content
                })
                .to_string(),
            ),
        },
        e => AppError::UnknownError(e.to_string()),
    })?;

    save_cookies(&app)?;

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_logout(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
) -> Result<(), AppError> {
    clear_cookies(&app)?;
    let config = config.write().await;
    vrchatapi::apis::authentication_api::logout(&config)
        .await
        .map_err(|e| match &e {
            Error::ResponseError(e) => match &e.entity {
                Some(entity) => match entity {
                    LogoutError::Status401(e) => AppError::AuthFailed(format!("{:?}", e)),
                    LogoutError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
                None => AppError::UnknownError(
                    serde_json::json!({
                        "status": e.status.to_string(), "content": e.content
                    })
                    .to_string(),
                ),
            },
            e => AppError::UnknownError(e.to_string()),
        })?;
    Ok(())
}

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
            Error::ResponseError(e) => match &e.entity {
                Some(entity) => match entity {
                    GetAvatarError::Status401(e) => AppError::AuthFailed(format!("{:?}", e)),
                    GetAvatarError::Status404(e) => AppError::AvatarIsPrivate(format!("{:?}", e)),
                    GetAvatarError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
                None => AppError::UnknownError(
                    serde_json::json!({
                        "status": e.status.to_string(), "content": e.content
                    })
                    .to_string(),
                ),
            },
            e => AppError::UnknownError(e.to_string()),
        })?;

    save_cookies(&app)?;

    Ok(avatar)
}
