import { LoginStatus, UserInfo } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";

const APP_STORE_KEY = "appStore";

const appStore = new Store("store");

export type AppState = {
  init?: boolean;
  version: string;
  auth: {
    status: LoginStatus;
    credentials?: { username: string; password: string };
    me?: UserInfo;
  };
  settings: {
    avatarFetchInterval: number;
    avatarStatusExpiresHr: number;
    notifications: boolean;
    autoStart: boolean;
  };
  filter?: string;
};

const initAppState = {
  auth: { status: LoginStatus.NotLoggedIn },
  version: "0.0.0",
  settings: {
    avatarFetchInterval: 1,
    avatarStatusExpiresHr: 1,
    notifications: true,
    autoStart: false,
  },
};

export const appState: AppState = proxy(initAppState);

subscribe(appState, async () => {
  if (!appState.init) return;
  await appStore.set(APP_STORE_KEY, appState);
  await appStore.save();
});

export async function loadAppState() {
  const stored: AppState | null = await appStore.get(APP_STORE_KEY);
  if (stored) Object.assign(appState, stored);
  appState.init = true;
}

export async function logout() {
  clearAuth();
  await invoke("vrchat_logout");
}

export function clearAuth() {
  console.error("clear auth");
  appState.auth = { status: LoginStatus.NotLoggedIn };
}

export function clearApp() {
  Object.assign(appState, initAppState);
}
