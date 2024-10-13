import vrchat from "vrchat";
import { ApiError, ErrorName } from "./_err";
import { VRChatClient } from "./_base";

declare module "./_base" {
  export interface VRChatClient {
    getAvatarInfo(avatarId: string): Promise<vrchat.Avatar | undefined>;
    getOwnAvatars(): Promise<vrchat.Avatar[]>;
    updateAvatar(
      avatarId: string,
      data: vrchat.UpdateAvatarRequest,
    ): Promise<void>;
    deleteAvatar(avatarId: string): Promise<void>;
  }
}

VRChatClient.prototype.getAvatarInfo = async function (avatarId: string) {
  try {
    return await this.invoke(this.apis.vrchatGetAvatarInfo, {
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
    return await this.invoke<vrchat.Avatar[]>(this.apis.vrchatGetOwnAvatars, {
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
  await this.invoke(this.apis.vrchatUpdateAvatar, {
    username: this.username,
    avatarId,
    data,
  });
};

VRChatClient.prototype.deleteAvatar = async function (avatarId: string) {
  try {
    await this.invoke(this.apis.vrchatDeleteAvatar, {
      username: this.username,
      avatarId,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.type === ErrorName.FalsePositive) {
      return;
    }
    throw err;
  }
};
