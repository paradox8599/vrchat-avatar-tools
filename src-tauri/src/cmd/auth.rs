use serde_json::json;
use tauri::command;
use vrchatapi::{
    apis::authentication_api::{
        CheckUserExistsError, GetCurrentUserError, LogoutError, Verify2FaEmailCodeError,
        Verify2FaError,
    },
    models::EitherUserOrTwoFactor,
};

use crate::{cookies::ConfigCookieMap, err::AppError};

use super::handle_api_error;

#[command]
pub async fn vrchat_login(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    password: String,
) -> Result<(), AppError> {
    let cc = ccmap.get_or_load(&username).await;
    let mut config = cc.config.write().await;
    config.basic_auth = Some((username, Some(password)));
    cc.save();
    Ok(())
}

#[command]
pub async fn vrchat_is_reachable(
    ccmap: tauri::State<'_, ConfigCookieMap>,
) -> Result<bool, AppError> {
    let cc = ccmap.get_or_load("default").await;
    let config = cc.config.write().await;
    vrchatapi::apis::authentication_api::check_user_exists(
        &config,
        None,
        None,
        Some("username"),
        None,
    )
    .await
    .map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                CheckUserExistsError::Status400(_) => unreachable!(),
                CheckUserExistsError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })?;

    Ok(true)
}

#[command]
pub async fn vrchat_get_me(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
) -> Result<EitherUserOrTwoFactor, AppError> {
    let cc = ccmap.get_or_load(&username).await;
    let config = cc.config.write().await;
    let me = vrchatapi::apis::authentication_api::get_current_user(&config).await;

    cc.save();

    me.map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                GetCurrentUserError::Status401(_) => AppError::UnsuccessfulStatus(
                    401,
                    json!({ "error": { "status": 401, "message": "unauthorized" } }).to_string(),
                ),
                GetCurrentUserError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })
}

#[command]
pub async fn vrchat_verify_emailotp(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    code: String,
) -> Result<bool, AppError> {
    let cc = ccmap.get_or_load(&username).await;
    let config = cc.config.write().await;
    let verify_result = vrchatapi::apis::authentication_api::verify2_fa_email_code(
        &config,
        vrchatapi::models::TwoFactorEmailCode { code },
    )
    .await;
    cc.save();

    let verify_result = verify_result.map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                Verify2FaEmailCodeError::Status401(_) => AppError::UnsuccessfulStatus(
                    401,
                    json!({ "error": { "status": 401, "message": "unauthorized" } }).to_string(),
                ),
                Verify2FaEmailCodeError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })?;

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_verify_otp(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
    code: String,
) -> Result<bool, AppError> {
    let cc = ccmap.get_or_load(&username).await;
    let config = cc.config.write().await;
    let verify_result = vrchatapi::apis::authentication_api::verify2_fa(
        &config,
        vrchatapi::models::TwoFactorAuthCode { code },
    )
    .await;

    cc.save();

    let verify_result = verify_result.map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                Verify2FaError::Status401(_) => AppError::UnsuccessfulStatus(
                    401,
                    json!({ "error": { "status": 401, "message": "unauthorized" } }).to_string(),
                ),
                Verify2FaError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })?;

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_logout(
    ccmap: tauri::State<'_, ConfigCookieMap>,
    username: String,
) -> Result<(), AppError> {
    let cc = ccmap.delete(&username).await;
    if let Some(cc) = cc {
        let config = cc.config.write().await;
        vrchatapi::apis::authentication_api::logout(&config)
            .await
            .map_err(|e| {
                handle_api_error(
                    e,
                    |e| match e {
                        LogoutError::Status401(_) => AppError::UnsuccessfulStatus(
                            401,
                            json!({ "error": { "status": 401, "message": "unauthorized" } })
                                .to_string(),
                        ),
                        LogoutError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                    },
                    |_| {},
                )
            })?;
        cc.save();
    }
    Ok(())
}
