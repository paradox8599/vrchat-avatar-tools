import { LoginStatus, UserInfo } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";

const APP_STORE_KEY = "appStore";

const appStore = new Store("store");

export type AppState = {
  init?: boolean;
  auth: {
    status: LoginStatus;
    credentials?: { username: string; password: string };
    me?: UserInfo;
  };
  settings: {
    avatarFetchInterval: number;
    avatarStatusExpiresHr: number;
    notifications: boolean;
  };
  filter?: string;
};

const initAppState = {
  auth: { status: LoginStatus.NotLoggedIn },
  settings: {
    avatarFetchInterval: 3000,
    avatarStatusExpiresHr: 1,
    notifications: true,
  },
}

export const appState: AppState = proxy(initAppState);

subscribe(appState, async () => {
  console.log(Object.values(LoginStatus)[appState.auth.status]);
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
