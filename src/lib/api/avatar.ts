import { AvatarInfo, UpdateAvatarRequest } from "@/types";
import { ErrorName, parseError } from "./err";
import { clearAuth, getAuth } from "@/state/auth";
import { API_NAMES, invoke } from "./base";

// Get Avatar Info

async function vrchatGetAvatarInfo(avatarId: string) {
  const auth = getAuth();
  if (!auth.credentials) return;
  try {
    // track("avatar", { fetch: avatarId, userFetch: trackName() });
    const avatarInfo: AvatarInfo = await invoke(API_NAMES.vrchatGetAvatarInfo, {
      username: auth.credentials.username,
      avatarId,
    });
    return avatarInfo;
  } catch (e) {
    const err = parseError(e);
    // track("avatar", { [err.message]: trackName() });
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

// Get Own Avatars

async function vrchatGetOwnAvatars(username: string) {
  const auth = getAuth(username);
  if (!auth.credentials) return [];
  try {
    const avatars = await invoke<AvatarInfo[]>(API_NAMES.vrchatGetOwnAvatars, {
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
          clearAuth(username);
        }
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
  data: UpdateAvatarRequest,
) {
  try {
    await invoke(API_NAMES.vrchatUpdateAvatar, { username, avatarId, data });
  } catch (e) {
    const err = parseError(e);
    switch (err.type) {
      case ErrorName.StatusError:
        if (err.status === 404) {
          throw err.status;
        } else if (err.status === 401) {
          clearAuth(username);
        }
      case ErrorName.UnknownError:
        throw err;
    }
  }
}

export { vrchatGetAvatarInfo, vrchatGetOwnAvatars, vrchatUpdateAvatar };
