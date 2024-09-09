import { appState } from "@/state";
import {
  Avatar,
  GetMeResult,
  isLoginSuccess,
  LoginCredentials,
  LoginResult,
} from "@/types";
import {
  invoke as _invoke,
  InvokeArgs,
  InvokeOptions,
} from "@tauri-apps/api/core";

export const API_NAMES = {
  vrchatLogin: "vrchat_login",
  vrchatVerifyEmailOtp: "vrchat_verify_emailotp",
  vrchatGetMe: "vrchat_get_me",
  vrchatLogout: "vrchat_logout",
  vrchatGetAvatarInfo: "vrchat_get_avatar_info",
};

async function invoke<T>(
  cmd: string,
  args?: InvokeArgs,
  options?: InvokeOptions,
): Promise<T> {
  try {
    return await _invoke<T>(cmd, args, options);
  } catch (e) {
    console.log(e);
    appState.auth = undefined;
    throw e;
  }
}

/**
 * returns
 *  - UserInfo if login succeeded
 *  - undefined if needsVerify
 *  - false if login failed
 */
export async function hasLoggedIn() {
  if (!appState.auth?.credentials) return false;
  try {
    const me: GetMeResult = await invoke(API_NAMES.vrchatGetMe);
    if (isLoginSuccess(me)) return me;
    return me.requiresTwoFactorAuth.length > 0 ? undefined : false;
  } catch (e) {
    throw e;
    // TODO:
  }
}

export async function vrchatLogin(credentials: LoginCredentials) {
  appState.auth = { credentials };
  await invoke(API_NAMES.vrchatLogin, credentials);
  const me = await hasLoggedIn();

  // Needs verify
  if (me === undefined) {
    return LoginResult.NeedsVerify;
  }

  // Login failed
  else if (me === false) {
    appState.auth = undefined;
    return LoginResult.Failed;
  }

  // Login succeeded
  else {
    appState.auth = { credentials, me };
    return LoginResult.Success;
  }
}

export async function vrchatVerifyEmailOtp(code: string) {
  try {
    const res: boolean = await invoke(API_NAMES.vrchatVerifyEmailOtp, { code });
    if (!res) false;

    const me = await hasLoggedIn();

    // Needs verify
    if (me === undefined) {
      return LoginResult.NeedsVerify;
    }

    // Login failed
    else if (me === false) {
      appState.auth = undefined;
      return LoginResult.Failed;
    }

    // Login succeeded
    else {
      if (!appState.auth) return LoginResult.Failed;
      appState.auth.me = me;
      return LoginResult.Success;
    }
  } catch (e) {
    console.error("vrchatVerifyEmailOtp", e);
    appState.auth = undefined;
    return LoginResult.Failed;
  }
}

export async function vrchatGetAvatarInfo(avatarId: string) {
  const avatarInfo: Avatar["info"] = await invoke(
    API_NAMES.vrchatGetAvatarInfo,
    { avatarId },
  );
  return avatarInfo;
}
