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
import { ErrorName, parseError } from "./err";
import { authState, clearAuth } from "@/state/auth";
import { track } from "./aptabase";
import { appState } from "@/state/app";

export const API_NAMES = {
  vrchatIsReachable: "vrchat_is_reachable",
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
    const result = await _invoke<T>(cmd, args, options);
    appState.reachable = true;
    return result;
  } catch (e) {
    const err = parseError(e);
    if (err.type === ErrorName.ConnectionError) {
      appState.reachable = false;
    }
    throw e;
  }
}

export async function vrchatIsReachable() {
  return await invoke<boolean>(API_NAMES.vrchatIsReachable).catch(() => false);
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
        track("login", { [method]: authState.credentials.username });
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
    track("login", { getMeError: err.message });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) return authState.status;
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
    const err = parseError(e);
    track("login", { verifyEmailError: err.message });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) return authState.status;
    }
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
    const err = parseError(e);
    track("login", { verifyOtpError: err.message });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) return authState.status;
    }
    console.error(`caught at vrchatVerifyOtp ${JSON.stringify(e)}`);
    authState.status = LoginStatus.NotLoggedIn;
    return authState.status;
  }
}

export async function vrchatGetAvatarInfo(avatarId: string) {
  try {
    // track("avatar", { fetch: avatarId, userFetch: trackId() });
    const avatarInfo: Avatar["info"] = await invoke(
      API_NAMES.vrchatGetAvatarInfo,
      { avatarId },
    );
    return avatarInfo;
  } catch (e) {
    const err = parseError(e);
    // track("avatar", { [err.message]: trackId() });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 404) {
          // track("avatar", { notFound: avatarId });
          return undefined;
        } else if (err.status === 401) {
          clearAuth();
        }
      case ErrorName.UnknownError:
        throw err;
    }
  }
}
