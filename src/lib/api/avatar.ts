import { ApiError, ErrorName } from "./_err";
import { getAuth } from "@/state/auth";
import { API_NAMES, invoke } from "./_base";
import vrchat from "vrchat";

// Get Avatar Info

async function vrchatGetAvatarInfo(avatarId: string) {
  const auth = getAuth();
  if (!auth.credentials) return;
  try {
    // track("avatar", { fetch: avatarId, userFetch: trackName() });
    const avatarInfo: vrchat.Avatar = await invoke(
      API_NAMES.vrchatGetAvatarInfo,
      {
        username: auth.credentials.username,
        avatarId,
      },
    );
    return avatarInfo;
  } catch (e) {
    const err = e as ApiError;
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 404) {
          return undefined;
        }
      default:
        throw err;
    }
  }
}

// Get Own Avatars

async function vrchatGetOwnAvatars(username: string) {
  const auth = getAuth(username);
  if (!auth.credentials) return [];
  try {
    const avatars = await invoke<vrchat.Avatar[]>(
      API_NAMES.vrchatGetOwnAvatars,
      {
        username,
      },
    );
    return avatars;
  } catch (e) {
    const err = e as ApiError;
    switch (err.type) {
      case ErrorName.UnknownError:
        throw err;
    }
    return [];
  }
}

// Update Avatar

async function vrchatUpdateAvatar(
  username: string,
  avatarId: string,
  data: vrchat.UpdateAvatarRequest,
) {
  await invoke(API_NAMES.vrchatUpdateAvatar, { username, avatarId, data });
}

export { vrchatGetAvatarInfo, vrchatGetOwnAvatars, vrchatUpdateAvatar };
