pub mod auth;
pub mod avatar;

use reqwest::StatusCode;
use serde::Serialize;
use vrchatapi::apis::{Error, ResponseContent};

use crate::err::AppError;

fn unknown_response_err<T>(e: &ResponseContent<T>) -> AppError
where
    T: serde::Serialize,
{
    let json = serde_json::json!({ "status": e.status.to_string(), "content": e.content });
    AppError::UnknownError(json.to_string())
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
                StatusCode::TOO_MANY_REQUESTS => {
                    AppError::StatusError(e.status.as_u16(), "too many requests".to_owned())
                }
                StatusCode::NOT_FOUND => {
                    AppError::StatusError(e.status.as_u16(), e.content.to_string())
                }
                StatusCode::UNAUTHORIZED => {
                    AppError::StatusError(e.status.as_u16(), e.content.to_string())
                }

                _ => match e.entity.as_ref() {
                    None => unknown_response_err(e),
                    Some(entity) => on_api_error(entity),
                },
            }
        }
        e => AppError::UnknownError(e.to_string()),
    }
}
