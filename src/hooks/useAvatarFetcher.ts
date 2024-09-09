import { appState } from "@/state/app";
import React from "react";
import { vrchatGetAvatarInfo } from "@/lib/api";
import { avatarMapState } from "@/state/avatars";

function hasOutdated(date?: Date | string) {
  return (
    Date.now() - new Date(date ?? 0)?.getTime() >
    appState.settings.avatarStatusExpiresHr * 60 * 60 * 1000
  );
}

function getOutdatedAvatar() {
  return Array.from(avatarMapState.values()).filter(
    (a) => !a.lastFetch || hasOutdated(a.lastFetch),
  )[0];
}

export function useAvatarFetcher() {
  React.useEffect(() => {
    const timer = setInterval(async () => {
      const avatar = getOutdatedAvatar();
      if (!avatar) return;
      avatar.info = await vrchatGetAvatarInfo(avatar.id);
      avatar.lastFetch = new Date().toISOString();
      avatarMapState.set(avatar.id, avatar);
    }, appState.settings.avatarFetchInterval);

    return () => {
      clearInterval(timer);
    };
  }, []);
}
