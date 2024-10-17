mod cmd;
mod constants;
mod err;
mod files;
mod stores;

#[cfg(desktop)]
mod tray;

use constants::{ENV_APTABASE_HOST, ENV_APTABASE_HOST_MATCH, ENV_APTABASE_KEY};

use cmd::{
    auth::{
        vrchat_get_me, vrchat_is_reachable, vrchat_login, vrchat_logout, vrchat_verify_emailotp,
        vrchat_verify_otp,
    },
    avatar::{
        vrchat_delete_avatar, vrchat_get_avatar_info, vrchat_get_own_avatars, vrchat_update_avatar,
    },
    file::{
        vrchat_create_file, vrchat_create_file_version, vrchat_delete_file,
        vrchat_delete_file_version, vrchat_download_file, vrchat_get_files, vrchat_show_file,
        vrchat_upload_file,
    },
};
use std::sync::Arc;
use stores::cookies::ConfigCookieMap;
use tauri::Manager;
use tauri_plugin_cli::CliExt;
use tokio::sync::RwLock;

pub type StdResult<T> = std::result::Result<T, Box<dyn std::error::Error>>;
pub type Arw<T> = Arc<RwLock<T>>;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut aptabase = tauri_plugin_aptabase::Builder::new(ENV_APTABASE_KEY);
    if !ENV_APTABASE_HOST.contains(ENV_APTABASE_HOST_MATCH) {
        aptabase = aptabase.with_options(tauri_plugin_aptabase::InitOptions {
            host: Some(ENV_APTABASE_HOST.to_owned()),
            flush_interval: None,
        });
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(aptabase.build())
        .plugin(prevent_default())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // auth
            vrchat_login,
            vrchat_is_reachable,
            vrchat_verify_emailotp,
            vrchat_verify_otp,
            vrchat_get_me,
            vrchat_logout,
            // avatars
            vrchat_get_avatar_info,
            vrchat_get_own_avatars,
            vrchat_update_avatar,
            vrchat_delete_avatar,
            // files
            vrchat_get_files,
            vrchat_show_file,
            vrchat_create_file,
            vrchat_delete_file,
            vrchat_download_file,
            vrchat_create_file_version,
            vrchat_delete_file_version,
            vrchat_upload_file
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
    let handle = app.handle();

    ConfigCookieMap::init(handle);

    #[cfg(desktop)]
    {
        // cli
        handle.plugin(tauri_plugin_cli::init())?;

        // auto start
        handle.plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--", "--hidden"]),
        ))?;

        // updateer
        handle.plugin(tauri_plugin_updater::Builder::new().build())?;

        // single instance
        handle.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            show_window(app);
        }))?;

        // system tray
        tray::create_tray(handle)?;
    }

    // parsing cli args

    if let Ok(cli_matches) = handle.cli().matches() {
        // hidden flag
        // [visible] in tauri.conf.json is set to false so app can start hidden at start
        // then if the --hidden flag is not set, show the window
        // if the --hidden flag is set, do nothing just like regular start
        let hidden = cli_matches
            .args
            .get("hidden")
            .map_or(false, |v| v.value.as_bool().unwrap_or_default());

        if !hidden {
            show_window(handle);
        }
    }

    Ok(())
}

fn prevent_default() -> tauri::plugin::TauriPlugin<tauri::Wry> {
    #[cfg(debug_assertions)]
    {
        use tauri_plugin_prevent_default::Flags;
        tauri_plugin_prevent_default::Builder::new()
            .with_flags(Flags::all().difference(Flags::DEV_TOOLS | Flags::RELOAD))
            .build()
    }
    #[cfg(not(debug_assertions))]
    tauri_plugin_prevent_default::init()
}
