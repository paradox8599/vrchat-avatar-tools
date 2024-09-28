use crate::{
    constants::{BASE_URL, STORE_COOKIES_KEY, STORE_REQWEST_KEY, UA},
    err::AppError,
    store::{clear_store, read_store, write_store},
    StdResult,
};
use reqwest_cookie_store::{CookieStore, CookieStoreMutex};
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;
use vrchatapi::apis::configuration::Configuration;

pub fn cookies_init(app: &tauri::AppHandle) -> StdResult<()> {
    let handle = app.app_handle();
    let cookies = cookies_load(handle)?;
    let cookies = Arc::new(cookies);
    let config = Configuration {
        base_path: BASE_URL.to_owned(),
        user_agent: Some(UA.to_owned()),
        client: reqwest::Client::builder()
            .cookie_provider(cookies.clone())
            .build()
            .unwrap(),
        basic_auth: None,
        oauth_access_token: None,
        bearer_access_token: None,
        api_key: None,
    };
    handle.manage(cookies);
    handle.manage(Arc::new(RwLock::new(config)));
    Ok(())
}

pub fn cookies_load(app: &tauri::AppHandle) -> StdResult<CookieStoreMutex> {
    let cookies: CookieStoreMutex = CookieStoreMutex::new(CookieStore::new(None));

    if let Some(value) = read_store(app, STORE_REQWEST_KEY, STORE_COOKIES_KEY) {
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

pub fn cookies_save(app: &tauri::AppHandle) -> Result<(), AppError> {
    let cookies = app
        .try_state::<Arc<reqwest_cookie_store::CookieStoreMutex>>()
        .ok_or("Cookies not found")
        .unwrap();

    let cookies = cookies.lock().unwrap();
    let cookies_str = cookies
        .iter_any()
        .map(|c| format!("{}={}", c.name(), c.value()))
        .collect::<Vec<String>>();
    let cookies_value = serde_json::json!(cookies_str);

    // println!("save cookies value: {:?}", cookies_value);
    write_store(app, STORE_REQWEST_KEY, STORE_COOKIES_KEY, &cookies_value);
    Ok(())
}

pub fn cookies_clear(app: &tauri::AppHandle) -> Result<(), AppError> {
    clear_store(app, STORE_REQWEST_KEY);
    Ok(())
}
