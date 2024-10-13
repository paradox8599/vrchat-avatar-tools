use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppError {
    #[error("status {0}: {1}")]
    UnsuccessfulStatus(u16, String),

    #[error("connection error: {0}")]
    NoConnection(String),

    #[error("unknown error {0}")]
    Unknown(String),

    #[error("false positive: {0}")]
    FalsePositive(String),

    #[error("request error: {0}")]
    Request(String),

    #[error("app file error: {0}")]
    File(#[from] AppFileError),
}

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum AppFileError {
    #[error("file path error {0}")]
    Path(String),

    #[error("open file error {0}")]
    Open(String),

    #[error("read file error {0}")]
    Read(String),

    #[error("create file error {0}")]
    Create(String),

    #[error("delete {0}")]
    Delete(String),

    #[error("write {0}")]
    Write(String),
}
