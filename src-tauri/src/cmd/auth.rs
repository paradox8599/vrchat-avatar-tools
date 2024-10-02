use tauri::command;
use vrchatapi::{
    apis::authentication_api::{
        CheckUserExistsError, GetCurrentUserError, LogoutError, Verify2FaEmailCodeError,
        Verify2FaError,
    },
    models::EitherUserOrTwoFactor,
};

use crate::{cookies::ConfigCookies, err::AppError};

use super::handle_api_error;

#[command]
pub async fn vrchat_login(
    cc: tauri::State<'_, ConfigCookies>,
    username: String,
    password: String,
) -> Result<(), AppError> {
    cc.clear();
    let mut config = cc.config.write().await;
    config.basic_auth = Some((username, Some(password)));
    Ok(())
}

#[command]
pub async fn vrchat_is_reachable(cc: tauri::State<'_, ConfigCookies>) -> Result<bool, AppError> {
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
    cc: tauri::State<'_, ConfigCookies>,
) -> Result<EitherUserOrTwoFactor, AppError> {
    let config = cc.config.write().await;
    let me = vrchatapi::apis::authentication_api::get_current_user(&config).await;

    cc.save();

    me.map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                GetCurrentUserError::Status401(_) => unreachable!(),
                GetCurrentUserError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })
}

#[command]
pub async fn vrchat_verify_emailotp(
    cc: tauri::State<'_, ConfigCookies>,
    code: String,
) -> Result<bool, AppError> {
    let config = cc.config.read().await;
    let verify_result = vrchatapi::apis::authentication_api::verify2_fa_email_code(
        &config,
        vrchatapi::models::TwoFactorEmailCode { code },
    )
    .await;

    let verify_result = verify_result.map_err(|e| {
        cc.save();
        handle_api_error(
            e,
            |e| match e {
                Verify2FaEmailCodeError::Status401(_) => unreachable!(),
                Verify2FaEmailCodeError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })?;

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_verify_otp(
    cc: tauri::State<'_, ConfigCookies>,
    code: String,
) -> Result<bool, AppError> {
    let config = cc.config.read().await;
    let verify_result = vrchatapi::apis::authentication_api::verify2_fa(
        &config,
        vrchatapi::models::TwoFactorAuthCode { code },
    )
    .await;

    let verify_result = verify_result.map_err(|e| {
        handle_api_error(
            e,
            |e| match e {
                Verify2FaError::Status401(_) => unreachable!(),
                Verify2FaError::UnknownValue(v) => AppError::Unknown(v.to_string()),
            },
            |_| {},
        )
    })?;

    cc.save();

    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_logout(cc: tauri::State<'_, ConfigCookies>) -> Result<(), AppError> {
    let config = cc.config.write().await;
    cc.clear();
    vrchatapi::apis::authentication_api::logout(&config)
        .await
        .map_err(|e| {
            handle_api_error(
                e,
                |e| match e {
                    LogoutError::Status401(_) => unreachable!(),
                    LogoutError::UnknownValue(v) => AppError::Unknown(v.to_string()),
                },
                |_| {},
            )
        })?;
    Ok(())
}
