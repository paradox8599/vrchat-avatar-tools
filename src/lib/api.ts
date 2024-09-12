import { appState, clearAuth } from "@/state/app";
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
import { parseError } from "./err";

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
    console.error(JSON.stringify(e));
    throw e;
  }
}

/**
 * returns
 *  - UserInfo if login succeeded
 *  - undefined if needsVerify
 *  - false if login failed
 */
export async function vrchatGetMe() {
  if (!appState.auth?.credentials) return false;
  try {
    const me: GetMeResult = await invoke(API_NAMES.vrchatGetMe);
    if (isLoginSuccess(me)) return me;
    return me.requiresTwoFactorAuth.length > 0 ? undefined : false;
  } catch (e) {
    console.error("caught at vrchatGetMe");
    const err = parseError(e);
    if (err.name === "TooManyRequests") return undefined;
    // also return false here when err.name === "NotInWhiteList"
    return false;
  }
}

export async function vrchatLogin(credentials: LoginCredentials) {
  appState.auth.credentials = credentials;
  await invoke(API_NAMES.vrchatLogin, credentials);
  const me = await vrchatGetMe();

  switch (me) {
    // Needs verify
    case undefined:
      appState.auth.status = LoginStatus.NeedsVerify;
      return LoginStatus.NeedsVerify;

    // Login failed
    case false:
      console.log("clear auth at vrchatLogin#77");
      clearAuth();
      return LoginStatus.Failed;
    // Login succeeded
    default:
      appState.auth = { status: LoginStatus.Success, credentials, me };
      return LoginStatus.Success;
  }
}

export async function vrchatVerifyEmailOtp(code: string) {
  try {
    const res: boolean = await invoke(API_NAMES.vrchatVerifyEmailOtp, { code });

    if (!res) {
      console.log("email otp verification failed, clear auth");
      clearAuth();
      return LoginStatus.Failed;
    }

    const me = await vrchatGetMe();

    switch (me) {
      // Still needs verify
      case undefined:
        appState.auth.status = LoginStatus.NeedsVerify;
        return LoginStatus.NeedsVerify;
      // Login failed
      case false:
        clearAuth();
        return LoginStatus.Failed;
      // Login succeeded and got user info
      default:
        appState.auth.me = me;
        appState.auth.status = LoginStatus.Success;
        return LoginStatus.Success;
    }
  } catch (e) {
    console.error("caught at vrchatVerifyEmailOtp");
    const err = parseError(e);
    switch (err.name) {
      case "Unknown":
      case "TooManyRequests":
        return LoginStatus.NeedsVerify;
      default:
        clearAuth();
        return LoginStatus.Failed;
    }
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
    const err = parseError(e);
    switch (err.name) {
      case "AvatarIsPrivate":
        return undefined;
      case "AuthFailed":
        clearAuth();
      default:
        throw err;
    }
  }
}
