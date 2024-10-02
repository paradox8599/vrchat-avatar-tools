use crate::{
    constants::{BASE_URL, STORE_COOKIES_KEY, STORE_REQWEST_KEY, UA},
    get_store,
    store::Store,
    Arw, StdResult,
};
use reqwest_cookie_store::{CookieStore, CookieStoreMutex};
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::RwLock;
use vrchatapi::apis::configuration::Configuration;

pub struct ConfigCookies {
    pub app: tauri::AppHandle,
    pub config: Arw<Configuration>,
    pub cookies: Arc<CookieStoreMutex>,
}

impl ConfigCookies {
    fn new(app: tauri::AppHandle, cookies: Arc<CookieStoreMutex>) -> Self {
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
            config: Arc::new(RwLock::new(config)),
            cookies,
        }
    }

    pub fn empty(app: tauri::AppHandle) -> Self {
        let cookies: CookieStoreMutex = CookieStoreMutex::new(CookieStore::new(None));
        Self::new(app, Arc::new(cookies))
    }

    pub fn init(app: &tauri::AppHandle) -> StdResult<()> {
        let cc = Self::empty(app.clone());
        cc.load()?;
        app.manage(cc);
        Ok(())
    }

    pub fn load(&self) -> StdResult<()> {
        let app = &self.app;
        let store = get_store!(app);

        if let Some(value) = store.read(STORE_REQWEST_KEY, STORE_COOKIES_KEY) {
            if let Some(value) = value.as_array().unwrap().first() {
                let url = reqwest::Url::parse(BASE_URL)?;
                self.cookies
                    .lock()
                    .unwrap()
                    .parse(value.as_str().unwrap(), &url)?;
            }
        }
        Ok(())
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

        // println!("save cookies value: {:?}", cookies_value);
        store.write(STORE_REQWEST_KEY, STORE_COOKIES_KEY, &cookies_value);
    }

    pub fn clear(&self) {
        let app = &self.app;
        let store = get_store!(app);
        store.clear(STORE_REQWEST_KEY);
    }
}
