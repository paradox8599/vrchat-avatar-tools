import { Avatar } from "@/types";
import { ErrorName, parseError } from "./err";
import { clearAuth, getAuth } from "@/state/auth";
import { API_NAMES, invoke } from "./base";

async function vrchatGetAvatarInfo(avatarId: string) {
  const auth = getAuth();
  if (!auth.credentials) return;
  try {
    // track("avatar", { fetch: avatarId, userFetch: trackId() });
    const avatarInfo: Avatar["info"] = await invoke(
      API_NAMES.vrchatGetAvatarInfo,
      { username: auth.credentials.username, avatarId },
    );
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

export { vrchatGetAvatarInfo };
