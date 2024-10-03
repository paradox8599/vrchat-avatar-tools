import { Avatar } from "@/types";
import { ErrorName, parseError } from "./err";
import { authState, clearAuth } from "@/state/auth";
import { API_NAMES, invoke } from "./base";

async function vrchatGetAvatarInfo(avatarId: string) {
  try {
    // track("avatar", { fetch: avatarId, userFetch: trackId() });
    const avatarInfo: Avatar["info"] = await invoke(
      API_NAMES.vrchatGetAvatarInfo,
      {
        username: authState.credentials?.username,
        avatarId,
      },
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
          clearAuth();
        }
      case ErrorName.UnknownError:
        throw err;
    }
  }
}

export { vrchatGetAvatarInfo };
