import { LoginStatus, UserInfo } from "@/types";
import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";
import { track, trackId } from "@/lib/aptabase";
import { appState } from "./app";
import { vrchatLogin } from "@/lib/api";

const AUTH_STORE_KEY = "authStore";

const authStore = new Store("store");

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
  await authStore.set(AUTH_STORE_KEY, authState);
  await authStore.save();
});

export async function loadAuthState() {
  const stored: AuthState | null = await authStore.get(AUTH_STORE_KEY);
  if (!stored) return;
  Object.assign(authState, {
    ...stored,
    status: LoginStatus.NotLoggedIn,
  });

  if (authState.credentials) await vrchatLogin();
}

export async function logout() {
  track("logout", { user: trackId() });
  clearAuth();
  invoke("vrchat_logout");
}

export function clearAuth() {
  track("clear", { auth: trackId() });
  authState.me = void 0;
  authState.credentials = void 0;
  authState.status = LoginStatus.NotLoggedIn;
}
