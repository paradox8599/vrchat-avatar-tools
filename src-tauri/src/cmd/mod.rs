pub mod auth;
pub mod avatar;

use vrchatapi::apis::ResponseContent;

use crate::err::AppError;
fn auth_error(e: &vrchatapi::models::error::Error) -> AppError {
    AppError::AuthFailed(
        e.clone()
            .error
            .map(|s| s.message)
            .unwrap_or(Some("".to_owned()))
            .unwrap_or("".to_owned()),
    )
}

fn unknown_error<T>(e: &ResponseContent<T>) -> AppError
where
    T: serde::Serialize,
{
    let json = serde_json::json!({ "status": e.status.to_string(), "content": e.content });
    AppError::UnknownError(json.to_string())
}
