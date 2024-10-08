import { LoginStatus, UserInfo } from "@/types";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";
import { track } from "@/lib/aptabase";
import { vrchatLogin } from "@/lib/api/auth";
import { appState } from "./app";

const ME = "me";
const OTHERS = "others";

let store: Store;

type Credentials = { username: string; password: string };
type Auth = {
  status: LoginStatus;
  credentials?: Credentials;
  info?: UserInfo;
};

export type MyInfo = { username?: string };

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export const me: MyInfo = proxy({});
subscribe(me, async () => {
  console.log("state: me", me);
  if (!appState.init) return;
  console.log("state: me", me);
  await store.set(ME, me);
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export type AuthState = Record<string, Auth>;
export const authState: AuthState = proxy({});
subscribe(authState, async () => {
  if (!appState.init) return;
  await store.set(OTHERS, authState);
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export async function loadAuthState() {
  store = await createStore("auth", { autoSave: 1000 as unknown as boolean });

  const storedMe = await store.get<MyInfo>(ME);
  me.username = storedMe?.username;

  const storedOthers = await store.get<Record<string, Auth>>(OTHERS);
  for (const [k, v] of Object.entries(storedOthers ?? {})) {
    authState[k] = v;
  }

  if (me.username) {
    const auth = getAuth(me.username);
    if (auth.credentials) await vrchatLogin(auth.credentials);
  }
}

export function getAuth(username?: string) {
  username ??= me.username ?? "_";
  authState[username] ??= proxy({ status: LoginStatus.NotLoggedIn });
  return authState[username];
}

export async function logout(username: string) {
  track("logout", { user: username });

  const cred = getAuth(username).credentials;
  if (cred) invoke("vrchat_logout", { username: cred.username });
  clearAuth(username);
}

export function clearAuth(username: string) {
  delete authState[username];
}

export function clearAuths() {
  for (const k of Object.keys(authState)) {
    clearAuth(k);
  }
}
