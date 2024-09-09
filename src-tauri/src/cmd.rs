use tauri::command;
use vrchatapi::{
    apis::configuration::Configuration,
    models::{Avatar, EitherUserOrTwoFactor},
};

use crate::{err::AppError, Arw};

#[command]
pub async fn vrchat_login(
    config: tauri::State<'_, Arw<Configuration>>,
    username: String,
    password: String,
) -> Result<(), AppError> {
    let mut config = config.write().await;
    config.basic_auth = Some((username, Some(password)));
    Ok(())
}

#[command]
pub async fn vrchat_get_me(
    config: tauri::State<'_, Arw<Configuration>>,
) -> Result<EitherUserOrTwoFactor, AppError> {
    let config = config.write().await;
    let me = vrchatapi::apis::authentication_api::get_current_user(&config)
        .await
        .map_err(|_e| AppError::AuthFailed)?;
    Ok(me)
}

#[command]
pub async fn vrchat_verify_emailotp(
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
    Ok(verify_result.verified)
}

#[command]
pub async fn vrchat_logout(config: tauri::State<'_, Arw<Configuration>>) -> Result<(), AppError> {
    let config = config.write().await;
    vrchatapi::apis::authentication_api::logout(&config)
        .await
        .map_err(|_e| AppError::AuthFailed)?;
    Ok(())
}

#[command]
pub async fn vrchat_get_avatar_info(
    config: tauri::State<'_, Arw<Configuration>>,
    avatar_id: String,
) -> Result<Avatar, AppError> {
    let config = config.read().await;
    let avatar: Avatar = vrchatapi::apis::avatars_api::get_avatar(&config, &avatar_id)
        .await
        .map_err(|e| {
            println!("{}", e);
            AppError::AuthFailed
        })?;
    Ok(avatar)
}
