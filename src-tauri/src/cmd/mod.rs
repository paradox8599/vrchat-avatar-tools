pub mod auth;
pub mod avatar;
pub mod file;

use reqwest::StatusCode;
use serde::Serialize;
use serde_json::json;
use vrchatapi::apis::{Error, ResponseContent};

use crate::err::AppError;

fn unknown_response_err<T>(e: &ResponseContent<T>) -> AppError
where
    T: serde::Serialize,
{
    let json = serde_json::json!({ "status": e.status.to_string(), "content": e.content });
    AppError::Unknown(json.to_string())
}

/**
handle api error on non 200 status code
*/
fn handle_api_error<E, FE, FS>(e: Error<E>, on_api_error: FE, on_status: FS) -> AppError
where
    E: Serialize + std::fmt::Debug,
    FE: Fn(&E) -> AppError,
    FS: FnOnce(StatusCode),
{
    match &e {
        Error::ResponseError(e) => {
            on_status(e.status);
            match e.status {
                StatusCode::TOO_MANY_REQUESTS => AppError::UnsuccessfulStatus(
                    e.status.as_u16(),
                    json!({ "error": { "status": 429, "message": "对 VRChat 请求过于频繁，请稍后再试" } })
                        .to_string(),
                ),
                StatusCode::NOT_FOUND => {
                    AppError::UnsuccessfulStatus(e.status.as_u16(), e.content.to_string())
                }
                StatusCode::UNAUTHORIZED => {
                    AppError::UnsuccessfulStatus(e.status.as_u16(), e.content.to_string())
                }

                _ => {
                    eprintln!("e: {e:?}");
                    match e.entity.as_ref() {
                        None => unknown_response_err(e),
                        Some(entity) => on_api_error(entity),
                    }
                }
            }
        }
        Error::Reqwest(error) => {
            eprintln!("unknown error in handler: {:?}", e);
            AppError::NoConnection(error.to_string())
        }
        Error::Serde(e) => {
            let msg = e.to_string();
            if msg.starts_with("missing field `created_at`") {
                return AppError::FalsePositive(e.to_string());
            }
            AppError::Unknown(e.to_string())
        }
        // Error::Io(error) => todo!(),
        e => AppError::Unknown(e.to_string()),
    }
}
