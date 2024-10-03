use crate::{
    constants::{BASE_URL, STORE_COOKIES_KEY, UA},
    get_store,
    store::Store,
    Arw,
};
use reqwest_cookie_store::{CookieStore, CookieStoreMutex};
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;
use vrchatapi::apis::configuration::Configuration;

pub struct ConfigCookies {
    pub app: tauri::AppHandle,
    pub name: String,
    pub config: Arw<Configuration>,
    pub cookies: Arc<CookieStoreMutex>,
}

#[macro_export]
macro_rules! get_cookies {
    ($app:tt) => {
        $app.try_state::<ConfigCookies>()
            .ok_or("Store not found")
            .unwrap()
    };
}

impl ConfigCookies {
    fn new(app: tauri::AppHandle, name: String, cookies: Option<Arc<CookieStoreMutex>>) -> Self {
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
            app,
            name,
            config: Arc::new(RwLock::new(config)),
            cookies,
        }
    }

    pub fn load(&self) {
        let app = &self.app;
        let store = get_store!(app);
        if let Some(value) = store.read(STORE_COOKIES_KEY, &self.name) {
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
        let app = &self.app;
        let store = get_store!(app);
        let cookies = self.cookies.lock().unwrap();
        let cookies_str = cookies
            .iter_any()
            .map(|c| format!("{}={}", c.name(), c.value()))
            .collect::<Vec<String>>();
        let cookies_value = serde_json::json!(cookies_str);

        store.write(STORE_COOKIES_KEY, &self.name, &cookies_value);
    }

    pub fn delete(&self) {
        let app = &self.app;
        let store = get_store!(app);
        store.delete(STORE_COOKIES_KEY, &self.name);
    }
}

pub struct ConfigCookieMap {
    app: tauri::AppHandle,
    map: RwLock<std::collections::HashMap<String, Arc<ConfigCookies>>>,
}

impl ConfigCookieMap {
    pub fn init(app: &tauri::AppHandle) {
        let map = ConfigCookieMap::new(app.clone());
        app.manage(map);
    }

    pub fn new(app: tauri::AppHandle) -> Self {
        Self {
            app,
            map: RwLock::new(std::collections::HashMap::new()),
        }
    }

    pub async fn get(&self, name: &str) -> Option<Arc<ConfigCookies>> {
        self.map.read().await.get(name).cloned()
    }

    pub async fn set(&self, name: &str, cc: Arc<ConfigCookies>) {
        self.map.write().await.insert(name.to_owned(), cc);
    }

    pub async fn load(&self, name: &str) -> Arc<ConfigCookies> {
        let cc = Arc::new(ConfigCookies::new(self.app.clone(), name.to_owned(), None));
        cc.load();
        self.set(name, cc.clone()).await;
        cc
    }

    pub async fn get_or_load(&self, name: &str) -> Arc<ConfigCookies> {
        if let Some(cc) = self.get(name).await {
            return cc;
        }
        self.load(name).await
    }

    pub async fn delete(&self, name: &str) -> Option<Arc<ConfigCookies>> {
        if let Some(cc) = self.map.write().await.remove(name) {
            cc.delete();
            return Some(cc);
        }
        None
    }
}
