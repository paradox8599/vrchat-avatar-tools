import {
  invoke as _invoke,
  InvokeArgs,
  InvokeOptions,
} from "@tauri-apps/api/core";
import { appState } from "@/state/app";
import { ApiError, ErrorName, parseError } from "./_err";
import { authState, initAuth, me } from "@/state/auth";
import { LoginStatus } from "@/types";

export enum API_NAMES {
  vrchatIsReachable = "vrchat_is_reachable",
  // auth
  vrchatLogin = "vrchat_login",
  vrchatVerifyEmailOtp = "vrchat_verify_emailotp",
  vrchatVerifyOtp = "vrchat_verify_otp",
  vrchatGetMe = "vrchat_get_me",
  vrchatLogout = "vrchat_logout",
  // avatars
  vrchatGetAvatarInfo = "vrchat_get_avatar_info",
  vrchatGetOwnAvatars = "vrchat_get_own_avatars",
  vrchatUpdateAvatar = "vrchat_update_avatar",
  vrchatDeleteAvatar = "vrchat_delete_avatar",
  // files
  vrchatGetFiles = "vrchat_get_files",
  vrchatShowFile = "vrchat_show_file",
}

async function invoke<T>(
  cmd: API_NAMES,
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
    throw err;
  }
}

export class VRChatClient {
  apis = API_NAMES;
  username: string;

  constructor(username: string) {
    this.username = username;
  }

  static new(username?: string) {
    username ??= me.username ?? "_";
    return new VRChatClient(username);
  }

  get auth() {
    authState[this.username] ??= initAuth();
    return authState[this.username];
  }

  get status() {
    return this.auth.status;
  }

  get loggedIn() {
    return this.status === LoginStatus.Success;
  }

  async invoke<T>(
    cmd: API_NAMES,
    args?: InvokeArgs,
    options?: InvokeOptions,
  ): Promise<T> {
    try {
      return await invoke<T>(cmd, args, options);
    } catch (e) {
      const err = e as ApiError;
      switch (err.type) {
        case ErrorName.StatusError:
          if (err.status === 401) {
            this.auth.status = LoginStatus.NotLoggedIn;
          }
          break;
      }
      throw e;
    }
  }

  cacheKey(key: CacheKey) {
    return [key, this.username];
  }
}

export type CacheKey = "avatars";

export async function vrchatIsReachable() {
  return await invoke<boolean>(API_NAMES.vrchatIsReachable).catch(() => false);
}
