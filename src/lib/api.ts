import { appState, clearAuth } from "@/state";
import {
  Avatar,
  GetMeResult,
  isLoginSuccess,
  LoginCredentials,
  LoginStatus,
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
    if (e === "AuthFailed") {
      clearAuth();
    }
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
  appState.auth.credentials = credentials;
  await invoke(API_NAMES.vrchatLogin, credentials);
  const me = await hasLoggedIn();

  // Needs verify
  if (me === undefined) {
    appState.auth.status = LoginStatus.NeedsVerify;
    return LoginStatus.NeedsVerify;
  }

  // Login failed
  else if (me === false) {
    clearAuth();
    return LoginStatus.Failed;
  }

  // Login succeeded
  else {
    appState.auth = { status: LoginStatus.Success, credentials, me };
    return LoginStatus.Success;
  }
}

export async function vrchatVerifyEmailOtp(code: string) {
  try {
    const res: boolean = await invoke(API_NAMES.vrchatVerifyEmailOtp, { code });
    if (!res) {
      clearAuth();
      return LoginStatus.Failed;
    }

    const me = await hasLoggedIn();

    // Needs verify
    if (me === undefined) {
      appState.auth.status = LoginStatus.NeedsVerify;
      return LoginStatus.NeedsVerify;
    }

    // Login failed
    else if (me === false) {
      clearAuth();
      return LoginStatus.Failed;
    }

    // Login succeeded
    else {
      if (!appState.auth) {
        clearAuth();
        return LoginStatus.Failed;
      }
      appState.auth.me = me;
      appState.auth.status = LoginStatus.Success;
      return LoginStatus.Success;
    }
  } catch (e) {
    console.error("vrchatVerifyEmailOtp", e);
    clearAuth();
    return LoginStatus.Failed;
  }
}

export async function vrchatGetAvatarInfo(avatarId: string) {
  try {
    const avatarInfo: Avatar["info"] = await invoke(
      API_NAMES.vrchatGetAvatarInfo,
      { avatarId },
    );
    return avatarInfo;
  } catch (e) {
    console.log(e);
    return undefined;
  }
}
