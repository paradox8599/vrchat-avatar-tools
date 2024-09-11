use reqwest_cookie_store::{CookieStore, CookieStoreMutex};
use serde_json::Value;
use std::sync::{Arc, Mutex};
use tauri::Manager;

use crate::{err::AppError, StdResult, BASE_URL};

const REQWEST_STORE_KEY: &str = "store.reqwest";
const COOKIES_KEY: &str = "cookies";

pub fn load_cookies(app: &tauri::AppHandle) -> StdResult<Arc<CookieStoreMutex>> {
    let cookies: Arc<CookieStoreMutex> = Arc::new(CookieStoreMutex::new(CookieStore::new(None)));

    // read cookies from store
    let stored_cookies: Arc<Mutex<Option<Value>>> = Arc::new(Mutex::new(None));
    let stores = app
        .try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>()
        .ok_or("Store not found")?;
    let path = std::path::PathBuf::from(REQWEST_STORE_KEY);
    let stored_cookies_writer = stored_cookies.clone();
    tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
        let cookies_value_stored = store.get(COOKIES_KEY);
        if let Some(ck) = cookies_value_stored {
            stored_cookies_writer.lock().unwrap().replace(ck.to_owned());
        }
        Ok(())
    })?;

    // parse cookies if stored cookies exist
    let url = reqwest::Url::parse(BASE_URL)?;
    if let Some(value) = stored_cookies.lock().unwrap().as_ref() {
        if let Some(value) = value.as_array().unwrap().first() {
            cookies
                .lock()
                .unwrap()
                .parse(value.as_str().unwrap(), &url)?;
        }
    }

    // println!("load cookies: {:?}", cookies);

    Ok(cookies)
}

pub fn save_cookies(app: &tauri::AppHandle) -> Result<(), AppError> {
    let stores = app
        .try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>()
        .ok_or("Store not found")
        .unwrap();
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

    let path = std::path::PathBuf::from(REQWEST_STORE_KEY);
    tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
        store.insert(COOKIES_KEY.to_owned(), cookies_value)?;
        store.save()?;
        Ok(())
    })
    .unwrap();
    Ok(())
}

pub fn clear_cookies(app: &tauri::AppHandle) -> Result<(), AppError> {
    let path = std::path::PathBuf::from(REQWEST_STORE_KEY);
    let stores = app
        .try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>()
        .ok_or("Store not found")
        .unwrap();
    tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
        store.clear()?;
        store.save()?;
        Ok(())
    })
    .unwrap();
    Ok(())
}
