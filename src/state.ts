import { Avatar, LoginStatus, UserInfo } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";

const APP_STORE_KEY = "appStore";

const appStorePersistent = new Store("store");

export type AppState = {
  init?: boolean;
  auth: {
    status: LoginStatus;
    credentials?: { username: string; password: string };
    me?: UserInfo;
  };
  avatars: Avatar[];
  settings: { avatarFetchInterval: number; avatarStatusExpiresHr: number };
};

export const appState: AppState = proxy({
  auth: { status: LoginStatus.NotLoggedIn },
  avatars: [],
  settings: { avatarFetchInterval: 3000, avatarStatusExpiresHr: 1 },
});

subscribe(appState, async () => {
  await appStorePersistent.set(APP_STORE_KEY, appState);
  await appStorePersistent.save();
});

export async function loadAppState() {
  const stored: AppState | null = await appStorePersistent.get(APP_STORE_KEY);
  if (stored) Object.assign(appState, stored);
  appState.init = true;
}

export async function logout() {
  await invoke("vrchat_logout");
  clearAuth();
}

export function clearAuth() {
  appState.auth = { status: LoginStatus.NotLoggedIn };
}
