use tauri::command;
use vrchatapi::{
    apis::configuration::Configuration,
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
    let me = vrchatapi::apis::authentication_api::get_current_user(&config)
        .await
        .map_err(|_e| AppError::AuthFailed)?;

    if let EitherUserOrTwoFactor::CurrentUser(me) = &me {
        if !WHITELISTED.contains(&me.id.as_str()) {
            clear_cookies(&app)?;
            return Err(AppError::AuthFailed);
        }
    }

    save_cookies(&app)?;

    Ok(me)
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
    let verify_result = verify_result.map_err(|_e| AppError::VerificationFailed)?;

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
        .map_err(|_e| AppError::AuthFailed)?;

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
        .map_err(|e| match e {
            vrchatapi::apis::Error::ResponseError(e) => match e.status {
                reqwest::StatusCode::NOT_FOUND => AppError::AvatarIsPrivate,
                _ => AppError::AuthFailed,
            },
            _ => AppError::UnknownError,
        })?;

    save_cookies(&app)?;

    Ok(avatar)
}
