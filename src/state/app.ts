import { proxy } from "valtio";

export type AppState = {
  init?: boolean;
  reachable?: boolean;
  updated?: boolean;
  version?: string;

  publicCheckTagFilter?: string;
  pages: {
    userAvatars: {
      selectedUsername?: string;
    };
  };
};

const initAppState = {
  init: false,
  updated: false,
  pages: {
    userAvatars: {},
  },
};

export const appState: AppState = proxy(initAppState);
