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
import { authState, clearAuth } from "@/state/auth";
import { track, trackId } from "./aptabase";

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
  if (!authState.credentials) {
    authState.status = LoginStatus.NotLoggedIn;
    return authState.status;
  }
  try {
    const me: GetMeResult = await invoke(API_NAMES.vrchatGetMe);

    // Login succeeded and got user info
    if (isLoginSuccess(me)) {
      authState.me = me;
      authState.status = LoginStatus.Success;
      return authState.status;
    }
    // needs verify but not available verify method
    else {
      for (const method of me.requiresTwoFactorAuth) {
        track("login#verify", { [method]: authState.credentials.username });
      }
      if (me.requiresTwoFactorAuth.length === 0) {
        authState.status = LoginStatus.NotLoggedIn;
        return authState.status;
      }
      // needs emailotp verify
      else if (me.requiresTwoFactorAuth.includes("emailOtp")) {
        authState.status = LoginStatus.NeedsEmailVerify;
        return authState.status;
      }
      // needs totp verify
      else if (me.requiresTwoFactorAuth.includes("totp")) {
        authState.status = LoginStatus.NeedsVerify;
        return authState.status;
      }
      // unsupported verify method
      else {
        alert(`尚未支持的验证方式: ${me.requiresTwoFactorAuth}`);
        authState.status = LoginStatus.NotLoggedIn;
        return authState.status;
      }
    }
  } catch (e) {
    const err = parseError(e);
    track("login#error", { [err.name]: authState.credentials.username });
    switch (err.name) {
      // 429 Too many requests, do not change status
      case "TooManyRequests":
        return authState.status;
    }
    authState.status = LoginStatus.NotLoggedIn;
    return authState.status;
  }
}

export async function checkAuth() {
  const me = await vrchatGetMe();
  switch (me) {
    case LoginStatus.NotLoggedIn:
      clearAuth();
  }
  return me;
}

export async function vrchatLogin(credentials?: LoginCredentials) {
  authState.credentials ??= credentials;
  if (!authState.credentials) throw new Error("no credentials provided");
  await invoke(API_NAMES.vrchatLogin, authState.credentials);
  return await checkAuth();
}

export async function vrchatVerifyEmailOtp(code: string) {
  try {
    await invoke(API_NAMES.vrchatVerifyEmailOtp, { code });
    return await checkAuth();
  } catch (e) {
    console.error(`caught at vrchatVerifyEmailOtp ${JSON.stringify(e)}`);
    authState.status = LoginStatus.NotLoggedIn;
    return authState.status;
  }
}

export async function vrchatVerifyOtp(code: string) {
  try {
    await invoke(API_NAMES.vrchatVerifyOtp, { code });
    return await checkAuth();
  } catch (e) {
    console.error(`caught at vrchatVerifyOtp ${JSON.stringify(e)}`);
    authState.status = LoginStatus.NotLoggedIn;
    return authState.status;
  }
}

export async function vrchatGetAvatarInfo(avatarId: string) {
  try {
    track("avatar_info", { avatar: avatarId });
    const avatarInfo: Avatar["info"] = await invoke(
      API_NAMES.vrchatGetAvatarInfo,
      { avatarId },
    );
    track("avatar_info", { success: trackId() });
    return avatarInfo;
  } catch (e) {
    const err = parseError(e);
    track("avatar_info", { [err.name]: trackId() });
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
