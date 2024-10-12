import { GetMeResult, isLoginSuccess, LoginStatus } from "@/types";
import { ApiError, ErrorName } from "./_err";
import { API_NAMES, VRChatClient } from "./_base";
import { me } from "@/state/auth";

declare module "./_base" {
  export interface VRChatClient {
    getMe(): Promise<LoginStatus>;
    login(password?: string): Promise<LoginStatus>;
    verify(code: string): Promise<LoginStatus>;
    logout(): Promise<void>;
  }
}

VRChatClient.prototype.getMe = async function () {
  const auth = this.auth;

  try {
    const info: GetMeResult = await this.invoke(API_NAMES.vrchatGetMe, {
      username: this.username,
    });

    // Login succeeded and got user info
    if (isLoginSuccess(info)) {
      auth.info = info;
      auth.status = LoginStatus.Success;
    }

    // needs verify but not available verify method
    else {
      const authMethods = info.requiresTwoFactorAuth;

      if (authMethods.length === 0) {
        auth.status = LoginStatus.NotLoggedIn;
      }
      // needs emailotp verify
      else if (authMethods.includes("emailOtp")) {
        auth.status = LoginStatus.NeedsEmailVerify;
      }
      // needs totp verify
      else if (authMethods.includes("totp")) {
        auth.status = LoginStatus.NeedsVerify;
      }
      // unsupported verify method
      else {
        alert(`尚未支持的验证方式: ${authMethods}`);
        auth.status = LoginStatus.NotLoggedIn;
      }
    }
  } catch (e) {
    const err = e as ApiError;
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) return auth.status;
    }
    auth.status = LoginStatus.NotLoggedIn;
  }
  return auth.status;
};

VRChatClient.prototype.login = async function (password: string) {
  const cred = { username: this.username, password };
  await this.invoke(API_NAMES.vrchatLogin, cred);
  return await this.getMe();
};

function getVerifyUrl(status: LoginStatus) {
  switch (status) {
    case LoginStatus.NeedsEmailVerify:
      return API_NAMES.vrchatVerifyEmailOtp;
    case LoginStatus.NeedsVerify:
      return API_NAMES.vrchatVerifyOtp;
  }
}

VRChatClient.prototype.verify = async function (code: string) {
  const url = getVerifyUrl(this.auth.status);
  if (!url) return this.auth.status;
  try {
    const args = { username: this.username, code };
    await this.invoke(url, args);
    return await this.getMe();
  } catch (e) {
    const err = e as ApiError;
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 429) throw err.message;
    }
    const auth = this.auth;
    auth.status = LoginStatus.NotLoggedIn;
    return auth.status;
  }
};

VRChatClient.prototype.logout = async function () {
  if (!this.loggedIn) return;
  await this.invoke(API_NAMES.vrchatLogout, { username: this.username });
  const auth = this.auth;
  delete auth.info;
  auth.status = LoginStatus.NotLoggedIn;
  if (this.username === me.username) delete me.username;
};
