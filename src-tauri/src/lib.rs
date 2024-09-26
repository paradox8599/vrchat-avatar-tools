mod cmd;
mod cookies;
mod err;
mod whitelist;

#[cfg(desktop)]
mod tray;

use cookies::load_cookies;

use cmd::{
    vrchat_get_avatar_info, vrchat_get_me, vrchat_login, vrchat_logout, vrchat_verify_emailotp,
    vrchat_verify_otp,
};
use std::sync::Arc;
use tauri::Manager;
use tauri_plugin_cli::CliExt;
use tokio::sync::RwLock;
use vrchatapi::apis::configuration::Configuration;

pub type StdResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;
pub type Arw<T> = Arc<RwLock<T>>;

pub const UA: &str =  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
pub const BASE_URL: &str = "https://vrchat.com/api/1";

const ENV_APTABASE_KEY: &str = "{{APTABASE_KEY}}";
const ENV_APTABASE_HOST: &str = "{{APTABASE_HOST}}";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_window(app);
        }));
    }

    let mut aptabase = tauri_plugin_aptabase::Builder::new(ENV_APTABASE_KEY);
    let host = ENV_APTABASE_HOST;
    println!("APTABASE_HOST: {}", host);
    if !host.contains("APTABASE_HOST") {
        aptabase = aptabase.with_options(tauri_plugin_aptabase::InitOptions {
            host: Some(host.to_owned()),
            flush_interval: None,
        });
    }

    builder
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(aptabase.build())
        .plugin(prevent_default())
        .invoke_handler(tauri::generate_handler![
            vrchat_login,
            vrchat_verify_emailotp,
            vrchat_verify_otp,
            vrchat_get_me,
            vrchat_logout,
            vrchat_get_avatar_info,
        ])
        .setup(init)
        // close to hide
        .on_window_event(|app, event| {
            if let Some(window) = app.get_webview_window("main") {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window.hide();
                }
            }
        })
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
    // cookies
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
        // cli
        let _ = app.handle().plugin(tauri_plugin_cli::init());

        // system tray
        tray::create_tray(app.handle())?;

        // auto start
        let _ = app.handle().plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--", "--hidden"]),
        ));

        // updateer
        let _ = app
            .handle()
            .plugin(tauri_plugin_updater::Builder::new().build());
    }

    if let Ok(matches) = app.cli().matches() {
        // hidden flag
        // [visible] in tauri.conf.json is set to false so app can start hidden at the very start
        // then if the --hidden flag is not set, show the window
        // if the --hidden flag is set, do nothing just like regular start
        let hidden = match matches.args.get("hidden") {
            Some(hidden) => hidden.value.as_bool().unwrap(),
            None => false,
        };

        if !hidden {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = window.unminimize();
            }
        }
    }

    Ok(())
}

#[cfg(debug_assertions)]
fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    use tauri_plugin_prevent_default::Flags;

    tauri_plugin_prevent_default::Builder::new()
        .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
        .build()
}

#[cfg(not(debug_assertions))]
fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    tauri_plugin_prevent_default::init()
}
