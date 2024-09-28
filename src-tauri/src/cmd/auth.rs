use reqwest::StatusCode;
use tauri::command;
use vrchatapi::{
    apis::{
        authentication_api::{
            GetCurrentUserError, LogoutError, Verify2FaEmailCodeError, Verify2FaError,
        },
        configuration::Configuration,
        Error,
    },
    models::EitherUserOrTwoFactor,
};

use crate::{
    cookies::{cookies_clear, cookies_save},
    err::AppError,
    Arw,
};

use super::{auth_error, unknown_error};

#[command]
pub async fn vrchat_login(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
    username: String,
    password: String,
) -> Result<(), AppError> {
    let mut config = config.write().await;
    cookies_clear(&app)?;
    config.basic_auth = Some((username, Some(password)));
    Ok(())
}

#[command]
pub async fn vrchat_get_me(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
) -> Result<EitherUserOrTwoFactor, AppError> {
    let config = config.write().await;
    let me = vrchatapi::apis::authentication_api::get_current_user(&config).await;

    cookies_save(&app)?;

    me.map_err(|e| match &e {
        Error::ResponseError(e) => match e.status {
            StatusCode::TOO_MANY_REQUESTS => AppError::TooManyRequests,
            _ => e.entity.as_ref().map_or_else(
                || unknown_error(e),
                |entity| match entity {
                    GetCurrentUserError::Status401(e) => auth_error(e),
                    GetCurrentUserError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
            ),
        },
        e => AppError::UnknownError(e.to_string()),
    })
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

    cookies_save(&app)?;

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

    cookies_save(&app)?;

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_logout(
    app: tauri::AppHandle,
    config: tauri::State<'_, Arw<Configuration>>,
) -> Result<(), AppError> {
    cookies_clear(&app)?;
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
