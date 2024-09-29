use tauri::command;
use vrchatapi::{
    apis::{
        authentication_api::{
            GetCurrentUserError, LogoutError, Verify2FaEmailCodeError, Verify2FaError,
        },
        configuration::Configuration,
    },
    models::EitherUserOrTwoFactor,
};

use crate::{
    cookies::{cookies_clear, cookies_save},
    err::AppError,
    Arw,
};

use super::handle_api_error;

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

    me.map_err(|e| {
        let _ = cookies_save(&app);
        handle_api_error(
            e,
            |e| match e {
                GetCurrentUserError::Status401(_) => unreachable!(),
                GetCurrentUserError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
            },
            |_| {},
        )
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

    let verify_result = verify_result.map_err(|e| {
        let _ = cookies_save(&app);
        handle_api_error(
            e,
            |e| match e {
                Verify2FaEmailCodeError::Status401(_) => unreachable!(),
                Verify2FaEmailCodeError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
            },
            |_| {},
        )
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

    let verify_result = verify_result.map_err(|e| {
        let _ = cookies_save(&app);
        handle_api_error(
            e,
            |e| match e {
                Verify2FaError::Status401(_) => unreachable!(),
                Verify2FaError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
            },
            |_| {},
        )
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
        .map_err(|e| {
            let _ = cookies_save(&app);
            handle_api_error(
                e,
                |e| match e {
                    LogoutError::Status401(_) => unreachable!(),
                    LogoutError::UnknownValue(v) => AppError::UnknownError(v.to_string()),
                },
                |_| {},
            )
        })?;
    Ok(())
}
