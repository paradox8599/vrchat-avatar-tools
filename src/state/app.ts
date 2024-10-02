import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { track, trackId } from "@/lib/aptabase";
import { isEnabled } from "@tauri-apps/plugin-autostart";

const APP_STORE_KEY = "appStore";

const appStore = new Store("store");

export type AppState = {
  init?: boolean;
  updated?: boolean | null;
  reachable?: boolean;
  version?: string;
  filter?: string;
  settings: {
    avatarFetchInterval: number;
    avatarStatusExpiresHr: number;
    notifications: boolean;
    autoStart: boolean;
  };
};

const initAppState = {
  init: false,
  updated: null,
  reachable: undefined, // set reachable to undefined to allow check in init step
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
  if (!stored) return;
  // only store settings as other values need to be updated on startup
  Object.assign(appState, { ...initAppState, settings: stored.settings });
  // load auto start state and save to settings
  await isEnabled().then((v) => (appState.settings.autoStart = v));
}

export function clearApp() {
  track("clear", { app: trackId() });
  Object.assign(appState, initAppState);
}
