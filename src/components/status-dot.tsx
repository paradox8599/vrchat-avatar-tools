import { cn } from "@/lib/utils";
import { appState } from "@/state/app";
import { Tooltip } from "./tooltip";

const EXPIRING_MS = appState.settings.avatarStatusExpiresHr * 60 * 60 * 1000;
const HALF_EXPIRING_MS = EXPIRING_MS / 2;


export function StatusDot({ dts }: { dts?: string }) {
  let color: "red" | "yellow" | "green" | "gray";

  if (!dts) {
    color = "gray";
  } else {
    const diff = Date.now() - new Date(dts as string).getTime();
    if (diff < HALF_EXPIRING_MS) color = "green";
    else if (diff < EXPIRING_MS) color = "yellow";
    else color = "red";
  }

  return (
    <Tooltip tooltip={{
      red: "状态已过期，进入更新队列",
      yellow: "状态即将过期",
      green: "状态已更新",
      gray: "状态未获取",
    }[color]}>
      <div
        className={cn(
          "w-3 h-3 rounded-full",
          "absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3",
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
