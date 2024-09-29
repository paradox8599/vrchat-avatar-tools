use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppError {
    #[error("Status {0}: {1}")]
    UnsuccessfulStatus(u16, String),

    #[error("Connection error: {0}")]
    NoConnection(String),

    #[error("unknown error {0}")]
    Unknown(String),
}
