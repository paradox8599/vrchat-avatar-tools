mod cmd;
mod cookies;
mod err;

#[cfg(desktop)]
mod tray;

use cookies::load_cookies;

use cmd::{
    vrchat_get_avatar_info, vrchat_get_me, vrchat_login, vrchat_logout, vrchat_verify_emailotp,
    vrchat_verify_otp,
};
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;
use vrchatapi::apis::configuration::Configuration;

pub type StdResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;
pub type Arw<T> = Arc<RwLock<T>>;

pub const UA: &str =  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
pub const BASE_URL: &str = "https://vrchat.com/api/1";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_window(app);
        }));
    }

    builder
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            vrchat_login,
            vrchat_verify_emailotp,
            vrchat_verify_otp,
            vrchat_get_me,
            vrchat_logout,
            vrchat_get_avatar_info,
        ])
        .setup(init)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn show_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.unminimize();
    }
}

pub fn init(app: &mut tauri::App) -> StdResult<()> {
    let cookies = load_cookies(app.handle())?;
    app.manage(cookies.clone());

    let config = Configuration {
        base_path: BASE_URL.to_owned(),
        user_agent: Some(UA.to_owned()),
        client: reqwest::Client::builder()
            .cookie_provider(cookies)
            .build()
            .unwrap(),
        basic_auth: None,
        oauth_access_token: None,
        bearer_access_token: None,
        api_key: None,
    };
    app.manage(Arc::new(RwLock::new(config)));

    #[cfg(desktop)]
    {
        let handle = app.handle();
        tray::create_tray(handle)?;
    }
    Ok(())
}
