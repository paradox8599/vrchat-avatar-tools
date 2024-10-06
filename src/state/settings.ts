import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { appState } from "./app";
import { isEnabled } from "@tauri-apps/plugin-autostart";

const SETTINGS_STORE_KEY = "settings";

const appStore = new Store("app");

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
  await appStore.set(SETTINGS_STORE_KEY, settingsState);
  await appStore.save();
});

export async function loadSettingsState() {
  const stored: SettingsState | null = await appStore.get(SETTINGS_STORE_KEY);
  if (!stored) return;
  Object.assign(settingsState, stored);
  settingsState.autoStart = await isEnabled();
}

export function clearSettings() {
  Object.assign(settingsState, initSettingsState);
}
