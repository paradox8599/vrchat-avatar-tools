use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppError {
    #[error("too many requests")]
    TooManyRequests,

    #[error("auth failed: {0}")]
    AuthFailed(String),

    #[error("unknown error {0}")]
    UnknownError(String),

    #[error("avatar not found: {0}")]
    AvatarNotFound(String),
}
