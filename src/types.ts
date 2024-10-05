export type UserInfo = {
  acceptedTOSVersion: number;
  acceptedPrivacyVersion: number;
  accountDeletionDate: null;
  accountDeletionLog: null;
  activeFriends: unknown[];
  allowAvatarCopying: boolean;
  badges: unknown[];
  bio: string;
  bioLinks: unknown[];
  currentAvatar: string;
  currentAvatarAssetUrl: string;
  currentAvatarImageUrl: string;
  currentAvatarThumbnailImageUrl: string;
  currentAvatarTags: unknown[];
  date_joined: string;
  developerType: string;
  displayName: string;
  emailVerified: boolean;
  fallbackAvatar: string;
  friendGroupNames: unknown[];
  friendKey: string;
  friends: unknown[];
  hasBirthday: boolean;
  hideContentFilterSettings: boolean;
  userLanguage: null;
  userLanguageCode: null;
  hasEmail: boolean;
  hasLoggedInFromClient: boolean;
  hasPendingEmail: boolean;
  homeLocation: string;
  id: string;
  isBoopingEnabled: boolean;
  isFriend: false;
  last_activity: string;
  last_login: string;
  last_mobile: null;
  last_platform: string;
  obfuscatedEmail: string;
  obfuscatedPendingEmail: string;
  oculusId: string;
  googleId: string;
  googleDetails: object;
  picoId: string;
  viveId: string;
  offlineFriends: unknown[];
  onlineFriends: unknown[];
  pastDisplayNames: unknown[];
  presence: {
    groups: unknown[];
    id: string;
    instance: string;
    instanceType: string;
    platform: string;
    status: string;
    travelingToInstance: string;
    travelingToWorld: string;
    world: string;
  };
  profilePicOverride: string;
  profilePicOverrideThumbnail: string;
  pronouns: string;
  state: string;
  status: string;
  statusDescription: string;
  statusFirstTime: boolean;
  statusHistory: string[];
  steamDetails: object;
  steamId: string;
  tags: string[];
  twoFactorAuthEnabled: boolean;
  twoFactorAuthEnabledDate: null;
  unsubscribe: boolean;
  updated_at: string;
  userIcon: string;
  username: string;
};

export type AvatarInfo = {
  assetUrl: string;
  authorId: string;
  authorName: string;
  created_at: string;
  description: string;
  featured: boolean;
  id: string;
  imageUrl: string;
  name: string;
  releaseStatus: "public" | "private" | "hidden" | "all";
  tags: string[];
  thumbnailImageUrl: string;
  unityPackageUrl: string;
  unityPackages: {
    id: string;
    assetUrl: string;
    assetVersion: number;
    created_at: string;
    impostorizerVersion: string;
    performanceRating:
      | "None"
      | "Excellent"
      | "Good"
      | "Medium"
      | "Poor"
      | "VeryPoor";
    platform: string;
    pluginUrl: string;
    unitySortNumber: number;
    unityVersion: string;
    worldSignature: string;
    impostorUrl: string;
    scanStatus: string;
    variant: string;
  }[];
  updated_at: string;
  version: number;
};

export type Avatar = {
  id: string;
  lastFetch?: string;
  fetching?: boolean;
  tag?: string;
  public?: boolean;
  info?: AvatarInfo;
};

export type LoginCredentials = { username: string; password: string };

export type LoginSuccess = UserInfo;
export type LoginNeedsVerify = { requiresTwoFactorAuth: string[] };
export type GetMeResult = LoginSuccess | LoginNeedsVerify;

export function isLoginSuccess(result: GetMeResult): result is LoginSuccess {
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
