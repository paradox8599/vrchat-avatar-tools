use crate::{
    err::AppError,
    store::{clear_store, read_store, write_store},
    StdResult, BASE_URL,
};
use reqwest_cookie_store::{CookieStore, CookieStoreMutex};
use std::sync::Arc;
use tauri::Manager;

const REQWEST_STORE_KEY: &str = "store.reqwest";
const COOKIES_KEY: &str = "cookies";

pub fn load_cookies(app: &tauri::AppHandle) -> StdResult<CookieStoreMutex> {
    let cookies: CookieStoreMutex = CookieStoreMutex::new(CookieStore::new(None));

    if let Some(value) = read_store(app, REQWEST_STORE_KEY, COOKIES_KEY) {
        if let Some(value) = value.as_array().unwrap().first() {
            let url = reqwest::Url::parse(BASE_URL)?;
            cookies
                .lock()
                .unwrap()
                .parse(value.as_str().unwrap(), &url)?;
        }
    }

    Ok(cookies)
}

pub fn save_cookies(app: &tauri::AppHandle) -> Result<(), AppError> {
    let cookies = app
        .try_state::<Arc<reqwest_cookie_store::CookieStoreMutex>>()
        .ok_or("Store not found")
        .unwrap();

    let cookies = cookies.lock().unwrap();
    let cookies_str = cookies
        .iter_any()
        .map(|c| format!("{}={}", c.name(), c.value()))
        .collect::<Vec<String>>();
    let cookies_value = serde_json::json!(cookies_str);

    // println!("save cookies value: {:?}", cookies_value);
    write_store(app, REQWEST_STORE_KEY, COOKIES_KEY, &cookies_value);
    Ok(())
}

pub fn clear_cookies(app: &tauri::AppHandle) -> Result<(), AppError> {
    clear_store(app, REQWEST_STORE_KEY);
    Ok(())
}
