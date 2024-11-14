import { load, type Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { appState } from "./app";
import { isEnabled } from "@tauri-apps/plugin-autostart";

const SETTINGS_STORE_KEY = "settings";

let store: Store;

export type SettingsState = {
  avatarFetchInterval: number;
  avatarStatusExpiresHr: number;
  notifications: boolean;
  autoStart: boolean;
};

const initSettingsState = {
  avatarFetchInterval: 1,
  avatarStatusExpiresHr: 1,
  notifications: true,
  autoStart: false,
};

export const settingsState: SettingsState = proxy(initSettingsState);

subscribe(settingsState, async () => {
  if (!appState.init) return;
  await store.set(SETTINGS_STORE_KEY, settingsState);
  await store.save();
});

export async function loadSettingsState() {
  store = await load("app");
  const stored = await store.get<SettingsState>(SETTINGS_STORE_KEY);
  if (!stored) return;
  Object.assign(settingsState, stored);
  settingsState.autoStart = await isEnabled();
}

export function clearSettings() {
  Object.assign(settingsState, initSettingsState);
}
