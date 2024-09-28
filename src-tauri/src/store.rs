use serde_json::Value;
use tauri::Manager;

pub fn read_store(app: &tauri::AppHandle, store: &str, key: &str) -> Option<Value> {
    let mut result: Option<Value> = None;
    if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
        let path = std::path::PathBuf::from(store);
        let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
            if let Some(value) = store.get(key) {
                result = Some(value.to_owned());
            }
            Ok(())
        });
    }
    result
}

pub fn write_store(app: &tauri::AppHandle, store: &str, key: &str, value: &Value) {
    if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
        let path = std::path::PathBuf::from(store);
        let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
            store.insert(key.to_owned(), value.to_owned())?;
            store.save()?;
            Ok(())
        });
    }
}

pub fn clear_store(app: &tauri::AppHandle, store: &str) {
    if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
        let path = std::path::PathBuf::from(store);
        let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
            store.clear()?;
            store.save()?;
            Ok(())
        });
    }
}
