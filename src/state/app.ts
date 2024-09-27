import { Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { track } from "@/lib/aptabase";

const APP_STORE_KEY = "appStore";

const appStore = new Store("store");

export type AppState = {
  init?: boolean;
  updated?: boolean;
  version: string;
  settings: {
    avatarFetchInterval: number;
    avatarStatusExpiresHr: number;
    notifications: boolean;
    autoStart: boolean;
  };
  filter?: string;
};

const initAppState = {
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
  if (!stored) return;
  Object.assign(appState, { settings: stored.settings });
}

export function clearApp() {
  track("clearApp");
  Object.assign(appState, initAppState);
}
