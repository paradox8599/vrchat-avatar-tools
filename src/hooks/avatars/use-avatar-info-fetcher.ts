import React from "react";
import { avatarMapState } from "@/state/avatars";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { AvatarRecord } from "@/types";
import { settingsState } from "@/state/settings";
import { VRChatClient } from "@/lib/api/_base";
import { me } from "@/state/auth";

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
  if (!me.username) return;
  const client = new VRChatClient(me.username);
  console.log(client);
  if (!client.loggedIn) return;
  if (avatar.fetching) return;
  try {
    avatar.fetching = true;
    const info = await client.getAvatarInfo(avatar.id);
    const isPublic = info?.releaseStatus === "public";
    const newPublic = isPublic && avatar.info === void 0;

    if (newPublic && settingsState.notifications) {
      sendNotification({
        title: `发现  ${info.authorName}  的公开模型`,
        body: [avatar.id, avatar.tag].filter((l) => !!l).join("\n"),
      });
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
