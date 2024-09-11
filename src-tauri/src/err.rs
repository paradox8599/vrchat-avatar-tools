use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppError {
    #[error("id not in whitelist: {0}")]
    NotInWhiteList(String),

    #[error("auth failed: {0}")]
    AuthFailed(String),

    #[error("verification failed: {0}")]
    VerificationFailed(String),


    #[error("unknown error {0}")]
    UnknownError(String),

    #[error("avatar is private: {0}")]
    AvatarIsPrivate(String),
}
