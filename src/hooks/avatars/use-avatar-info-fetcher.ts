import React from "react";
import { avatarMapState } from "@/state/avatars";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { AvatarRecord, LoginStatus } from "@/types";
import { track } from "@/lib/aptabase";
import { vrchatGetAvatarInfo } from "@/lib/api/avatar";
import { settingsState } from "@/state/settings";
import { getAuth } from "@/state/auth";

function hasOutdated(date?: Date | string) {
  return (
    Date.now() - new Date(date ?? 0)?.getTime() >
    settingsState.avatarStatusExpiresHr * 60 * 60 * 1000
  );
}

function getOutdatedAvatar() {
  return Array.from(avatarMapState.values()).filter(
    (a) => !a.lastFetch || hasOutdated(a.lastFetch),
  )[0];
}

export async function fetchAvatarInfo(avatar: AvatarRecord) {
  const auth = getAuth();
  if (auth.status !== LoginStatus.Success) return;
  if (avatar.fetching) return;
  try {
    avatar.fetching = true;
    const info = await vrchatGetAvatarInfo(avatar.id);
    const isPublic = info?.releaseStatus === "public";
    const newPublic = isPublic && avatar.info === void 0;

    if (newPublic) {
      track("avatar", { public: `${info.authorId}:${avatar.id}` });
      if (settingsState.notifications) {
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

export function useAvatarInfoFetcher() {
  React.useEffect(() => {
    const timer = setInterval(async () => {
      const avatar = getOutdatedAvatar();
      if (!avatar) return;
      await fetchAvatarInfo(avatar);
    }, settingsState.avatarFetchInterval * 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);
}
