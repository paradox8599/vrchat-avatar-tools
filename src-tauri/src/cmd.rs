use reqwest::StatusCode;
use tauri::command;
use vrchatapi::{
    apis::{
        authentication_api::{
            GetCurrentUserError, LogoutError, Verify2FaEmailCodeError, Verify2FaError,
        },
        avatars_api::GetAvatarError,
        configuration::Configuration,
        Error, ResponseContent,
    },
    models::{Avatar, EitherUserOrTwoFactor},
};

use crate::{
    cookies::{clear_cookies, save_cookies},
    err::AppError,
    Arw,
};

const WHITELISTED: [&str; 3] = [
    // uu
    "usr_352b1ce8-bec0-4f64-a648-b611d23b0a6c",
    // Brntm
    "usr_1c4f1844-9467-4566-b8df-4fad78d647ba",
    // 小鹿 XiaoLu
    "usr_88f0206e-34fc-452b-a770-819d198bf7c1",
];

fn auth_error(e: &vrchatapi::models::error::Error) -> AppError {
    AppError::AuthFailed(
        e.clone()
            .error
            .map(|s| s.message)
            .unwrap_or(Some("".to_owned()))
            .unwrap_or("".to_owned()),
    )
}

fn unknown_error<T>(e: &ResponseContent<T>) -> AppError
where
    T: serde::Serialize,
{
    let json = serde_json::json!({ "status": e.status.to_string(), "content": e.content });
    AppError::UnknownError(json.to_string())
}

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
            Error::ResponseError(e) => match e.status {
                StatusCode::TOO_MANY_REQUESTS => AppError::TooManyRequests,
                _ => match &e.entity {
                    None => unknown_error(e),
                    Some(entity) => match entity {
                        GetCurrentUserError::Status401(e) => auth_error(e),
                        GetCurrentUserError::UnknownValue(v) => {
                            AppError::UnknownError(v.to_string())
                        }
                    },
                },
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
            None => unknown_error(e),
            Some(entity) => match entity {
                Verify2FaEmailCodeError::Status401(e) => auth_error(e),
                Verify2FaEmailCodeError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
            },
        },
        e => AppError::UnknownError(e.to_string()),
    })?;

    save_cookies(&app)?;

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_verify_otp(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
    code: String,
) -> Result<bool, AppError> {
    let config = config.read().await;
    let verify_result = vrchatapi::apis::authentication_api::verify2_fa(
        &config,
        vrchatapi::models::TwoFactorAuthCode { code },
    )
    .await;
    let verify_result = verify_result.map_err(|e| match &e {
        Error::ResponseError(e) => match &e.entity {
            None => unknown_error(e),
            Some(entity) => match entity {
                Verify2FaError::Status401(e) => auth_error(e),
                Verify2FaError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
            },
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
                None => unknown_error(e),
                Some(entity) => match entity {
                    LogoutError::Status401(e) => auth_error(e),
                    LogoutError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
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
                None => unknown_error(e),
                Some(entity) => match entity {
                    GetAvatarError::Status401(e) => auth_error(e),
                    GetAvatarError::Status404(e) => AppError::AvatarIsPrivate(format!("{:?}", e)),
                    GetAvatarError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
            },
            e => AppError::UnknownError(e.to_string()),
        })?;

    save_cookies(&app)?;

    Ok(avatar)
}
