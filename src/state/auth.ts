import { LoginStatus, UserInfo } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";
import { track } from "@/lib/aptabase";
import { appState } from "./app";

const APP_STORE_KEY = "authStore";

const appStore = new Store("store");

export type AuthState = {
  status: LoginStatus;
  credentials?: { username: string; password: string };
  me?: UserInfo;
};

const initAuthState = {
  status: LoginStatus.NotLoggedIn,
};

export const authState: AuthState = proxy(initAuthState);

subscribe(authState, async () => {
  if (!appState.init) return;
  await appStore.set(APP_STORE_KEY, authState);
  await appStore.save();
});

export async function logout() {
  track("logout");
  clearAuth();
  invoke("vrchat_logout");
}

export function clearAuth() {
  authState.me = void 0;
  authState.credentials = void 0;
  authState.status = LoginStatus.NotLoggedIn;
}
