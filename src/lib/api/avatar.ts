import { AvatarInfo } from "@/types";
import { ErrorName, parseError } from "./err";
import { clearAuth, getAuth } from "@/state/auth";
import { API_NAMES, invoke } from "./base";

async function vrchatGetAvatarInfo(avatarId: string) {
  const auth = getAuth();
  if (!auth.credentials) return;
  try {
    // track("avatar", { fetch: avatarId, userFetch: trackId() });
    const avatarInfo: AvatarInfo = await invoke(API_NAMES.vrchatGetAvatarInfo, {
      username: auth.credentials.username,
      avatarId,
    });
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
          clearAuth(auth.credentials.username);
        }
      case ErrorName.UnknownError:
        throw err;
    }
  }
}

async function vrchatGetOwnAvatars(username: string) {
  const auth = getAuth(username);
  if (!auth.credentials) return [];
  try {
    const avatars: AvatarInfo[] = await invoke(API_NAMES.vrchatGetOwnAvatars, {
      username,
    });
    return avatars;
  } catch (e) {
    const err = parseError(e);
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 404) {
          // track("avatar", { notFound: avatarId });
        } else if (err.status === 401) {
          clearAuth(auth.credentials.username);
        }
      case ErrorName.UnknownError:
        throw err;
    }
    return [];
  }
}

export { vrchatGetAvatarInfo, vrchatGetOwnAvatars };
