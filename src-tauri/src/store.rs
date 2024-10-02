use serde_json::Value;
use tauri::Manager;

use crate::StdResult;

pub struct Store {
    app: tauri::AppHandle,
}

#[macro_export]
macro_rules! get_store {
    ($app:tt) => {
        $app.try_state::<Store>().ok_or("Store not found").unwrap()
    };
}

impl Store {
    pub fn init(app: &tauri::AppHandle) -> StdResult<()> {
        let store = Store::new(app.clone());
        app.manage(store);
        Ok(())
    }

    pub fn new(app: tauri::AppHandle) -> Self {
        Self { app }
    }

    pub fn read(&self, store: &str, key: &str) -> Option<Value> {
        let mut result: Option<Value> = None;
        let app = &self.app;
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

    pub fn write(&self, store: &str, key: &str, value: &Value) {
        let app = &self.app;
        if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
            let path = std::path::PathBuf::from(store);
            let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
                store.insert(key.to_owned(), value.to_owned())?;
                store.save()?;
                Ok(())
            });
        }
    }

    pub fn clear(&self, store: &str) {
        let app = &self.app;
        if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
            let path = std::path::PathBuf::from(store);
            let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
                store.clear()?;
                store.save()?;
                Ok(())
            });
        }
    }
}

// pub fn read_store(app: &tauri::AppHandle, store: &str, key: &str) -> Option<Value> {
//     let mut result: Option<Value> = None;
//     if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
//         let path = std::path::PathBuf::from(store);
//         let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
//             if let Some(value) = store.get(key) {
//                 result = Some(value.to_owned());
//             }
//             Ok(())
//         });
//     }
//     result
// }
//
// pub fn write_store(app: &tauri::AppHandle, store: &str, key: &str, value: &Value) {
//     if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
//         let path = std::path::PathBuf::from(store);
//         let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
//             store.insert(key.to_owned(), value.to_owned())?;
//             store.save()?;
//             Ok(())
//         });
//     }
// }
//
// pub fn clear_store(app: &tauri::AppHandle, store: &str) {
//     if let Some(stores) = app.try_state::<tauri_plugin_store::StoreCollection<tauri::Wry>>() {
//         let path = std::path::PathBuf::from(store);
//         let _ = tauri_plugin_store::with_store(app.clone(), stores, path, |store| {
//             store.clear()?;
//             store.save()?;
//             Ok(())
//         });
//     }
// }
