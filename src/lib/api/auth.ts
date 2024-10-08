import {
  GetMeResult,
  isLoginSuccess,
  LoginCredentials,
  LoginStatus,
} from "@/types";
import { ErrorName, parseError } from "./err";
import { track } from "../aptabase";
import { API_NAMES, invoke } from "./base";
import { clearAuth, getAuth } from "@/state/auth";

async function vrchatIsReachable() {
  return await invoke<boolean>(API_NAMES.vrchatIsReachable).catch(() => false);
}

/**
 * @returns [LoginStatus]
 */
async function vrchatGetMe(username: string) {
  const auth = getAuth(username);

  if (!auth.credentials) {
    auth.status = LoginStatus.NotLoggedIn;
    return auth.status;
  }

  try {
    const info: GetMeResult = await invoke(API_NAMES.vrchatGetMe, {
      username: auth.credentials.username,
    });

    // Login succeeded and got user info
    if (isLoginSuccess(info)) {
      auth.info = info;
      auth.status = LoginStatus.Success;
    }

    // needs verify but not available verify method
    else {
      for (const method of info.requiresTwoFactorAuth) {
        track("login", { [method]: auth.credentials.username });
      }
      if (info.requiresTwoFactorAuth.length === 0) {
        auth.status = LoginStatus.NotLoggedIn;
      }
      // needs emailotp verify
      else if (info.requiresTwoFactorAuth.includes("emailOtp")) {
        auth.status = LoginStatus.NeedsEmailVerify;
      }
      // needs totp verify
      else if (info.requiresTwoFactorAuth.includes("totp")) {
        auth.status = LoginStatus.NeedsVerify;
      }
      // unsupported verify method
      else {
        alert(`尚未支持的验证方式: ${info.requiresTwoFactorAuth}`);
        auth.status = LoginStatus.NotLoggedIn;
      }
    }
    return auth.status;
  } catch (e) {
    const err = parseError(e);
    track("login", { getMeError: err.message });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) return auth.status;
    }
    auth.status = LoginStatus.NotLoggedIn;
    return auth.status;
  }
}

async function checkAuth(username: string) {
  const loginStatus = await vrchatGetMe(username);
  switch (loginStatus) {
    case LoginStatus.NotLoggedIn:
      clearAuth(username);
  }
  return loginStatus;
}

async function vrchatLogin(credentials?: LoginCredentials) {
  if (!credentials) {
    throw new Error("No credentials provided");
  }

  await invoke(API_NAMES.vrchatLogin, credentials);

  const auth = getAuth(credentials.username);
  auth.credentials = credentials;
  return await checkAuth(credentials.username);
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
    return await checkAuth(username);
  } catch (e) {
    const auth = getAuth(username);
    const err = parseError(e);
    track("login", { verifyEmailError: err.message });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) throw err.message;
    }
    console.error(`caught at vrchatVerifyEmailOtp ${JSON.stringify(e)}`);
    auth.status = LoginStatus.NotLoggedIn;
    return auth.status;
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
    return await checkAuth(username);
  } catch (e) {
    const auth = getAuth(username);
    const err = parseError(e);
    track("login", { verifyOtpError: err.message });
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) throw err.message;
    }
    console.error(`caught at vrchatVerifyOtp ${JSON.stringify(e)}`);
    auth.status = LoginStatus.NotLoggedIn;
    return auth.status;
  }
}

export {
  vrchatIsReachable,
  vrchatLogin,
  vrchatVerifyEmailOtp,
  vrchatVerifyOtp,
  vrchatGetMe,
};
