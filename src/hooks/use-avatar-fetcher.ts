import { appState } from "@/state/app";
import React from "react";
import { vrchatGetAvatarInfo } from "@/lib/api";
import { avatarMapState } from "@/state/avatars";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { Avatar } from "@/types";
import { track } from "@/lib/aptabase";

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

export async function fetchAvatarInfo(avatar: Avatar) {
  if (avatar.fetching) return;
  try {
    avatar.fetching = true;
    const info = await vrchatGetAvatarInfo(avatar.id);
    const isPublic = info?.releaseStatus === "public";
    const newPublic = isPublic && avatar.info === void 0;

    if (newPublic) {
      track("avatar", { public: `${info.authorId}:${avatar.id}` });
      if (appState.settings.notifications) {
        sendNotification({
          title: `发现  ${info.authorName}  的公开模型`,
          body: [avatar.id, avatar.tag].filter((l) => !!l).join("\n"),
        });
      }
    }

    // wait for status indicator dot animation
    setTimeout(() => {
      avatar.info = info;
      avatar.lastFetch = new Date().toISOString();
      avatar.public = isPublic;
    }, 300);
  } finally {
    setTimeout(() => (avatar.fetching = false), 300);
  }
}

export function useAvatarFetcher() {
  React.useEffect(() => {
    const timer = setInterval(async () => {
      const avatar = getOutdatedAvatar();
      if (!avatar) return;
      await fetchAvatarInfo(avatar);
    }, appState.settings.avatarFetchInterval * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);
}
