import { appState } from "@/state";
import React from "react";
import { vrchatGetAvatarInfo } from "@/lib/api";

function hasOutdated(date?: Date | string) {
  return (
    Date.now() - new Date(date ?? 0)?.getTime() >
    appState.settings.avatarStatusExpiresHr
  );
}

function getOutdatedAvatar() {
  return appState.avatars.find((a) => !a.lastFetch || hasOutdated(a.lastFetch));
}

export function useAvatarFetcher() {
  React.useEffect(() => {
    const timer = setInterval(async () => {
      const avatar = getOutdatedAvatar();
      if (!avatar) return;
      avatar.info = await vrchatGetAvatarInfo(avatar.id);
      avatar.lastFetch = new Date().toISOString();
    }, appState.settings.avatarFetchInterval);

    return () => {
      clearInterval(timer);
    };
  }, []);
}
