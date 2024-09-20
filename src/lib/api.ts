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
  vrchatVerifyOtp: "vrchat_verify_otp",
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
    // console.error(JSON.stringify(e));
    throw e;
  }
}

/**
 * @returns [LoginStatus]
 */
export async function vrchatGetMe() {
  if (!appState.auth?.credentials) {
    appState.auth.status = LoginStatus.NotLoggedIn;
    return appState.auth.status;
  }
  try {
    const me: GetMeResult = await invoke(API_NAMES.vrchatGetMe);
    // Login succeeded and got user info
    if (isLoginSuccess(me)) {
      appState.auth.me = me;
      appState.auth.status = LoginStatus.Success;
      return appState.auth.status;
    }
    // needs verify but not available verify method
    else if (me.requiresTwoFactorAuth.length === 0) {
      appState.auth.status = LoginStatus.NotLoggedIn;
      return appState.auth.status;
    }
    // needs emailotp verify
    else if (me.requiresTwoFactorAuth.includes("emailOtp")) {
      appState.auth.status = LoginStatus.NeedsEmailVerify;
      return appState.auth.status;
    }
    // needs totp verify
    else if (me.requiresTwoFactorAuth.includes("totp")) {
      appState.auth.status = LoginStatus.NeedsVerify;
      return appState.auth.status;
    }
    // unsupported verify method
    else {
      alert(`尚未支持的验证方式: ${me.requiresTwoFactorAuth}`);
      appState.auth.status = LoginStatus.NotLoggedIn;
      return appState.auth.status;
    }
  } catch (e) {
    console.error("caught at vrchatGetMe");
    const err = parseError(e);
    switch (err.name) {
      // 429 Too many requests, do not change status
      case "TooManyRequests":
        return appState.auth.status;
      // not in whitelist
      case "NotInWhiteList":
        appState.auth.status = LoginStatus.NotInWhitelist;
        return appState.auth.status;
    }
    appState.auth.status = LoginStatus.NotLoggedIn;
    return appState.auth.status;
  }
}

export async function checkAuth() {
  const me = await vrchatGetMe();
  switch (me) {
    case LoginStatus.NotInWhitelist:
    case LoginStatus.NotLoggedIn:
      clearAuth();
  }
  return me;
}

export async function vrchatLogin(credentials: LoginCredentials) {
  appState.auth.credentials = credentials;
  await invoke(API_NAMES.vrchatLogin, credentials);
  return await checkAuth();
}

export async function vrchatVerifyEmailOtp(code: string) {
  try {
    await invoke(API_NAMES.vrchatVerifyEmailOtp, { code });
    return await checkAuth();
  } catch (e) {
    console.error(`caught at vrchatVerifyEmailOtp ${JSON.stringify(e)}`);
    appState.auth.status = LoginStatus.NotLoggedIn;
    return appState.auth.status;
  }
}

export async function vrchatVerifyOtp(code: string) {
  try {
    await invoke(API_NAMES.vrchatVerifyOtp, { code });
    return await checkAuth();
  } catch (e) {
    console.error(`caught at vrchatVerifyOtp ${JSON.stringify(e)}`);
    appState.auth.status = LoginStatus.NotLoggedIn;
    return appState.auth.status;
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
    console.error(`caught at vrchatGetAvatarInfo ${JSON.stringify(err)}`);
    switch (err.name) {
      case "AvatarNotFound":
        return undefined;
      case "AuthFailed":
        clearAuth();
      default:
        throw err;
    }
  }
}
