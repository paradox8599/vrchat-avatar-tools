import vrchat from "vrchat";
import { ApiError, ErrorName } from "./_err";
import { API_NAMES, VRChatClient } from "./_base";

declare module "./_base" {
  export interface VRChatClient {
    getAvatarInfo(avatarId: string): Promise<vrchat.Avatar | undefined>;
    getOwnAvatars(): Promise<vrchat.Avatar[]>;
    updateAvatar(
      avatarId: string,
      data: vrchat.UpdateAvatarRequest,
    ): Promise<void>;
  }
}

VRChatClient.prototype.getAvatarInfo = async function (avatarId: string) {
  try {
    return await this.invoke(API_NAMES.vrchatGetAvatarInfo, {
      username: this.username,
      avatarId,
    });
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
};

VRChatClient.prototype.getOwnAvatars = async function () {
  try {
    return await this.invoke<vrchat.Avatar[]>(API_NAMES.vrchatGetOwnAvatars, {
      username: this.username,
    });
  } catch (e) {
    const err = e as ApiError;

    switch (err.type) {
      case ErrorName.UnknownError:
        throw err;
    }
    return [];
  }
};

VRChatClient.prototype.updateAvatar = async function (
  avatarId: string,
  data: vrchat.UpdateAvatarRequest,
) {
  await this.invoke(API_NAMES.vrchatUpdateAvatar, {
    username: this.username,
    avatarId,
    data,
  });
};
