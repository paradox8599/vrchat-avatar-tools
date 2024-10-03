import {
  GetMeResult,
  isLoginSuccess,
  LoginCredentials,
  LoginStatus,
} from "@/types";
import { ErrorName, parseError } from "./err";
import { authState, clearAuth } from "@/state/auth";
import { track } from "../aptabase";
import { API_NAMES, invoke } from "./base";

async function vrchatIsReachable() {
  return await invoke<boolean>(API_NAMES.vrchatIsReachable).catch(() => false);
}

/**
 * @returns [LoginStatus]
 */
async function vrchatGetMe(username?: string) {
  if (!authState.credentials) {
    authState.status = LoginStatus.NotLoggedIn;
    return authState.status;
  }
  try {
    username ??= authState.credentials.username;
    const me: GetMeResult = await invoke(API_NAMES.vrchatGetMe, { username });

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

async function checkAuth() {
  const me = await vrchatGetMe();
  switch (me) {
    case LoginStatus.NotLoggedIn:
      clearAuth();
  }
  return me;
}

async function vrchatLogin(credentials?: LoginCredentials) {
  authState.credentials ??= credentials;
  if (!authState.credentials) throw new Error("no credentials provided");
  await invoke(API_NAMES.vrchatLogin, authState.credentials);
  return await checkAuth();
}

async function vrchatVerifyEmailOtp({
  username,
  code,
}: {
  username: string;
  code: string;
}) {
  try {
    await invoke(API_NAMES.vrchatVerifyEmailOtp, { username, code });
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

async function vrchatVerifyOtp({
  username,
  code,
}: {
  username: string;
  code: string;
}) {
  try {
    await invoke(API_NAMES.vrchatVerifyOtp, { username, code });
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

export {
  vrchatIsReachable,
  vrchatLogin,
  vrchatVerifyEmailOtp,
  vrchatVerifyOtp,
  vrchatGetMe,
};
