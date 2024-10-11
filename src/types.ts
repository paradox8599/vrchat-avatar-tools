import vrchat from "vrchat";

export type AvatarRecord = {
  id: string;
  lastFetch?: string;
  fetching?: boolean;
  tag?: string;
  public?: boolean;
  info?: vrchat.Avatar;
};

export type LoginCredentials = { username: string; password: string };

export type LoginNeedsVerify = { requiresTwoFactorAuth: string[] };
export type GetMeResult = vrchat.CurrentUser | LoginNeedsVerify;

export function isLoginSuccess(
  result: GetMeResult,
): result is vrchat.CurrentUser {
  return "displayName" in result;
}

export enum LoginStatus {
  NotLoggedIn,
  Success,
  NeedsVerify,
  NeedsEmailVerify,
}

export type EventProps = {
  [key: string]: string | number;
};
