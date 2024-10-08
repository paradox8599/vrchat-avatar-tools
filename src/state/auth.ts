import { LoginStatus, UserInfo } from "@/types";
import { createStore, Store } from "@tauri-apps/plugin-store";
import { proxy, subscribe } from "valtio";
import { invoke } from "@tauri-apps/api/core";
import { track, trackId } from "@/lib/aptabase";
import { vrchatLogin } from "@/lib/api/auth";
import { proxyMap } from "valtio/utils";

const AUTH_STORE_ME_KEY = "me";
const AUTH_STORE_OTHERS_KEY = "others";

let store: Store;

type Credentials = { username: string; password: string };
type Auth = {
  status: LoginStatus;
  credentials?: Credentials;
  info?: UserInfo;
};

export type MyAuthState = Auth;

const initAuth: Auth = { status: LoginStatus.NotLoggedIn };

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export const myAuthState: MyAuthState = proxy(initAuth);
subscribe(myAuthState, async () => {
  await store.set(AUTH_STORE_ME_KEY, myAuthState);
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export type AuthMapState = Map<string, Auth>;
export const authMapState: AuthMapState = proxyMap();
subscribe(authMapState, async () => {
  await store.set(AUTH_STORE_OTHERS_KEY, authMapState);
});

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

export async function loadAuthState() {
  store = await createStore("auth", { autoSave: 1 as unknown as boolean });

  const storedMe = await store.get<MyAuthState>(AUTH_STORE_ME_KEY);
  if (storedMe) Object.assign(myAuthState, storedMe);

  const storedOthers = await store.get<Record<string, Auth>>(
    AUTH_STORE_OTHERS_KEY,
  );
  if (storedOthers) {
    for (const [key, value] of Object.entries(storedOthers)) {
      authMapState.set(key, proxy(value));
    }
  }

  if (myAuthState.credentials) await vrchatLogin(myAuthState.credentials);
}

export function getAuth(username?: string) {
  if (!username) return myAuthState;
  if (!myAuthState.credentials?.username) {
    return myAuthState;
  }
  if (username === myAuthState.credentials?.username) {
    return myAuthState;
  }
  const auth = authMapState.get(username);
  if (auth) {
    return auth;
  } else {
    const auth: Auth = proxy({ status: LoginStatus.NotLoggedIn });
    authMapState.set(username, auth);
    return auth;
  }
}

export async function logout(username?: string) {
  username ??= myAuthState.credentials?.username;
  if (!username) return;

  track("logout", { user: trackId() });

  const auth = getAuth(username);
  const cred = auth.credentials;
  if (cred) invoke("vrchat_logout", { username: cred.username });
  clearAuth(username);
}

export function clearAuth(username: string) {
  if (username === myAuthState.credentials?.username) {
    track("clear", { auth: trackId() });
    delete myAuthState.credentials;
    delete myAuthState.info;
    myAuthState.status = LoginStatus.NotLoggedIn;
  } else {
    authMapState.delete(username);
  }
}

export function clearAuths() {
  authMapState.clear();
}
