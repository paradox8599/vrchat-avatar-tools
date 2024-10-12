import { LoginStatus } from "@/types";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { appState } from "./app";
import vrchat from "vrchat";

const ME = "me";
const OTHERS = "others";

let store: Store;

type Auth = {
  status: LoginStatus;
  info?: vrchat.CurrentUser;
};

export type MyInfo = { username?: string };
export const initAuth = () => ({ status: LoginStatus.NotLoggedIn });

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
}
