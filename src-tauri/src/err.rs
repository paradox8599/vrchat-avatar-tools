use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppError {
    #[error("auth failed")]
    AuthFailed,

    #[error("verification failed")]
    VerificationFailed,

    #[error("unknown error")]
    UnknownError,

    #[error("avatar is private")]
    AvatarIsPrivate,
}
