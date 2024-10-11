import { LoginStatus } from "@/types";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";
import { track } from "@/lib/aptabase";
import { vrchatLogin } from "@/lib/api/auth";
import { appState } from "./app";
import vrchat from "vrchat";

const ME = "me";
const OTHERS = "others";

let store: Store;

type Credentials = { username: string; password: string };
type Auth = {
  status: LoginStatus;
  credentials?: Credentials;
  info?: vrchat.CurrentUser;
};

export type MyInfo = { username?: string };
const initAuth = { status: LoginStatus.NotLoggedIn };

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export const me: MyInfo = proxy({});
subscribe(me, async () => {
  if (!appState.init) return;
  await store.set(ME, me);
  await store.save();
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export type AuthState = Record<string, Auth>;
export const authState: AuthState = proxy({});
subscribe(authState, async () => {
  if (!appState.init) return;
  await store.set(OTHERS, { ...authState, _: void 0 });
  await store.save();
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export async function loadAuthState() {
  store = await createStore("auth");

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
  authState[username] ??= initAuth;
  return authState[username];
}

export async function logout(username: string) {
  track("logout", { user: username });
  const auth = getAuth(username);
  if (auth.credentials) invoke("vrchat_logout", { username });
  // auth.status = LoginStatus.NotLoggedIn;
  // authState[username] = initAuth;
  clearAuth(username);
}

export function clearAuth(username: string) {
  const auth = getAuth(username);
  delete auth.info;
  delete auth.credentials;
  auth.status = LoginStatus.NotLoggedIn;
}

export async function clearAuths() {
  Object.assign(authState, {});
}
