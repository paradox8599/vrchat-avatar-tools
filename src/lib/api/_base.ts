import {
  invoke as _invoke,
  InvokeArgs,
  InvokeOptions,
} from "@tauri-apps/api/core";
import { appState } from "@/state/app";
import { ErrorName, parseError } from "./_err";

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
  // files
  vrchatGetFiles = "vrchat_get_files",
}

export async function invoke<T>(
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
    console.error("invoke error", err);
    throw err;
  }
}
