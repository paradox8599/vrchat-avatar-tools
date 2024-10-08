use crate::{
    constants::{BASE_URL, STORE_COOKIES_KEY, UA},
    Arw,
};
use reqwest_cookie_store::{CookieStore, CookieStoreMutex};
use std::sync::Arc;
use tauri::{Manager, Wry};
use tauri_plugin_store::{Store, StoreExt};
use tokio::sync::RwLock;
use vrchatapi::apis::configuration::Configuration;

pub struct ConfigCookie {
    pub name: String,
    pub config: Arw<Configuration>,
    pub cookies: Arc<CookieStoreMutex>,
    store: Arc<Store<Wry>>,
}

impl ConfigCookie {
    fn new(name: String, cookies: Option<Arc<CookieStoreMutex>>, store: Arc<Store<Wry>>) -> Self {
        let cookies =
            cookies.unwrap_or_else(|| Arc::new(CookieStoreMutex::new(CookieStore::new(None))));
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
        Self {
            name,
            config: Arc::new(RwLock::new(config)),
            cookies,
            store,
        }
    }

    pub fn load(&self) {
        if let Some(value) = self.store.get(&self.name) {
            if let Some(value) = value.as_array().unwrap().first() {
                let url = reqwest::Url::parse(BASE_URL).unwrap();
                let _ = self
                    .cookies
                    .lock()
                    .unwrap()
                    .parse(value.as_str().unwrap(), &url);
            }
        }
    }

    pub fn save(&self) {
        let cookies = self.cookies.lock().unwrap();
        let cookies_str = cookies
            .iter_any()
            .map(|c| format!("{}={}", c.name(), c.value()))
            .collect::<Vec<String>>();
        let cookies_value = serde_json::json!(cookies_str);
        self.store.set(&self.name, cookies_value);
    }

    pub fn delete(&self) -> bool {
        self.store.delete(&self.name)
    }
}

pub struct ConfigCookieMap {
    map: RwLock<std::collections::HashMap<String, Arc<ConfigCookie>>>,
    store: Arc<Store<Wry>>,
}

// Config Cookies Map - stores cookies for all users

impl<'a> ConfigCookieMap {
    pub fn init(app: &tauri::AppHandle) {
        let map = ConfigCookieMap::new(app);
        app.manage(map);
    }

    pub fn new(app: &tauri::AppHandle) -> Self {
        let store = app
            .store_builder(STORE_COOKIES_KEY)
            .auto_save(std::time::Duration::from_secs(30))
            .build();
        Self {
            map: RwLock::new(std::collections::HashMap::new()),
            store: Arc::new(store),
        }
    }

    pub async fn read(&self, name: &str) -> Option<Arc<ConfigCookie>> {
        self.map.read().await.get(name).cloned()
    }

    pub async fn load(&self, name: &str) -> Arc<ConfigCookie> {
        let cc = Arc::new(ConfigCookie::new(name.to_owned(), None, self.store.clone()));
        cc.load();
        self.map.write().await.insert(name.to_owned(), cc.clone());
        cc
    }

    pub async fn get(&self, name: &str) -> Arc<ConfigCookie> {
        if let Some(cc) = self.read(name).await {
            return cc;
        }
        self.load(name).await
    }

    pub async fn delete(&self, name: &str) -> Option<Arc<ConfigCookie>> {
        if let Some(cc) = self.map.write().await.remove(name) {
            cc.delete();
            return Some(cc);
        }
        None
    }
}
