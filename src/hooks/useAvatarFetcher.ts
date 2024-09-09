import { appState } from "@/state";
import React from "react";
import { vrchatGetAvatarInfo } from "@/lib/api";

const INTERVAL = 3000;
// const EXPIRES = 60 * 60 * 1000;
const EXPIRES = 1000 * 20;

function hasOutdated(date?: Date | string) {
  return Date.now() - new Date(date ?? 0)?.getTime() > EXPIRES;
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
    }, INTERVAL);

    return () => {
      clearInterval(timer);
    };
  }, []);
}
