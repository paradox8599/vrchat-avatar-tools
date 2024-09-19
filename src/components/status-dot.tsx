import { cn } from "@/lib/utils";
import { appState } from "@/state/app";
import { Tooltip } from "./tooltip";
import { Avatar } from "@/types";
import { fetchAvatarInfo } from "@/hooks/useAvatarFetcher";
import React from "react";

const EXPIRING_MS = appState.settings.avatarStatusExpiresHr * 60 * 60 * 1000;
const HALF_EXPIRING_MS = EXPIRING_MS / 2;

export function StatusDot({ avatar }: { avatar: Avatar }) {
  let color: "red" | "yellow" | "green" | "gray";
  if (!avatar.lastFetch) {
    color = "gray";
  } else {
    const diff = Date.now() - new Date(avatar.lastFetch).getTime();
    if (diff < HALF_EXPIRING_MS) color = "green";
    else if (diff < EXPIRING_MS) color = "yellow";
    else color = "red";
  }

  return (
    <Tooltip
      tooltip={
        `${avatar.lastFetch ? `【${Math.floor((Date.now() - new Date(avatar.lastFetch!).getTime()) / 1000 / 60)} 分钟前】` : ""}  ` +
        {
          red: "状态已过期，已进入更新队列，点击立即更新",
          yellow: "状态即将过期，点击立即更新",
          green: "状态已更新，点击再次更新",
          gray: "状态未获取，点击立即获取",
        }[color]
      }
    >
      <div
        onClick={() => fetchAvatarInfo(avatar)}
        className={cn(
          "w-3 h-3 rounded-full",
          "absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3",
          "cursor-pointer",
          avatar.fetching ? "animate-ping" : "",
          {
            red: "bg-red-500",
            yellow: "bg-yellow-500",
            green: "bg-green-500",
            gray: "bg-gray-500",
          }[color],
        )}
      />
    </Tooltip>
  );
}
