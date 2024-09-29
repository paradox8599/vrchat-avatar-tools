use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppError {
    #[error("Status {0}: {1}")]
    StatusError(u16, String),

    #[error("unknown error {0}")]
    UnknownError(String),
}
