import { proxy } from "valtio";

export type AppState = {
  init?: boolean;
  reachable?: boolean;
  updated?: boolean;
  version?: string;

  publicCheckTagFilter?: string;
  avatarsSelectedUsername?: string;
};

const initAppState = {
  init: false,
  updated: false,
};

export const appState: AppState = proxy(initAppState);
