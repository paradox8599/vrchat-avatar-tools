import { cn } from "@/lib/utils";
import { EasyTooltip } from "./easy-tooltip";
import { Avatar } from "@/types";
import { fetchAvatarInfo } from "@/hooks/use-avatar-info-fetcher";
import React from "react";
import { settingsState } from "@/state/settings";

const EXPIRING_MS = settingsState.avatarStatusExpiresHr * 60 * 60 * 1000;
const HALF_EXPIRING_MS = EXPIRING_MS / 2;

type StatusColor = "red" | "yellow" | "green" | "gray";

function getColor(lastFetch: string | undefined): StatusColor {
  if (!lastFetch) return "gray";
  const diff = Date.now() - new Date(lastFetch).getTime();
  if (diff < HALF_EXPIRING_MS) return "green";
  if (diff < EXPIRING_MS) return "yellow";
  return "red";
}

export function StatusDot({ avatar }: { avatar: Avatar }) {
  const color = getColor(avatar.lastFetch);
  return (
    <EasyTooltip
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
    </EasyTooltip>
  );
}
