import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  AvatarFallback,
  Avatar as AvatarIcon,
  AvatarImage,
} from "@/components/ui/avatar";
import useAvatars from "@/hooks/avatars/use-avatars";
import { Button } from "../ui/button";
import {
  Box,
  CloudUpload,
  Copy,
  SquareArrowOutUpRight,
  TrashIcon,
} from "lucide-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "@/hooks/app/use-toast";
import { AvatarTagSelector } from "./tag-selector";
import { avatarMapState } from "@/state/avatars";
import { EasyTooltip } from "../easy-tooltip";
import { StatusDot } from "../status-dot";
import { ScrollArea } from "../ui/scroll-area";
import { track, trackName } from "@/lib/aptabase";
//
export default function AvatarGrid() {
  const { sortedAvatars } = useAvatars();

  return (
    <ScrollArea className="h-full">
      <div>
        <div
          className={cn(
            "flex flex-col items-center justify-start gap-2 h-fit",
            "sm:grid md:gap-y-4 md:gap-x-4",
            "sm:grid-cols-2",
            "md:grid-cols-3",
            "lg:grid-cols-4",
            "py-2",
          )}
        >
          {sortedAvatars
            .filter((avatar) => avatar.public || avatar.info)
            .map((avatar) => {
              return (
                <Card
                  key={avatar.id}
                  className={cn(
                    "relative",
                    "w-96 min-h-[10rem]",
                    "px-2 flex flex-col justify-center gap-2",
                    avatar.public ? "bg-cardhl" : "bg-card",
                  )}
                >
                  <StatusDot avatar={avatar} />

                  <div className="flex items-center justify-start gap-2 px-0">
                    {/* thumbnail image */}

                    <AvatarIcon>
                      <AvatarImage
                        src={avatar.info?.thumbnailImageUrl}
                        className="object-cover"
                      />
                      <AvatarFallback />
                    </AvatarIcon>

                    {/* vrchat urls */}
                    <div className="w-full flex items-center justify-end gap-2">
                      {/* avatar author name  */}

                      <EasyTooltip
                        tooltip={`上传者${avatar.info ? `: ${avatar.info.authorName}` : ""}`}
                      >
                        <Button
                          className="w-full max-w-full rounded-full flex gap-2 font-bold overflow-x-hidden"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!avatar.info?.authorId) return;
                            track("author", {
                              open: avatar.info.authorId,
                              userOpen: trackName(),
                            });
                            open(
                              `https://vrchat.com/home/user/${avatar.info?.authorId}`,
                            );
                          }}
                        >
                          {avatar.info?.authorName}
                          {avatar.info && <SquareArrowOutUpRight size={12} />}
                        </Button>
                      </EasyTooltip>

                      {/* avatar status */}
                      <EasyTooltip tooltip="公开状态">
                        <Button
                          className={cn(
                            "uppercase w-24 rounded-full font-bold flex gap-2",
                            avatar.public ? "" : "bg-muted text-foreground",
                          )}
                          size="sm"
                          onClick={() => {
                            if (!avatar.info) return;
                            track("avatar", {
                              open: avatar.id,
                              userOpen: trackName(),
                            });
                            open(`https://vrchat.com/home/avatar/${avatar.id}`);
                          }}
                        >
                          {avatar.info?.releaseStatus ?? "未知状态"}
                          <SquareArrowOutUpRight size={12} />
                        </Button>
                      </EasyTooltip>
                    </div>
                  </div>

                  {/* info row */}

                  <div className="w-full text-sm flex flex-col items-start gap-1">
                    {/* avatar id */}
                    <div className="w-full flex items-start justify-center">
                      <Button
                        className={cn(
                          "w-full",
                          "rounded-full bg-background",
                          "font-mono font-bold text-sm",
                          "flex gap-2",
                        )}
                        variant="outline"
                        onClick={() => {
                          track("avatar", {
                            copy: avatar.id,
                            userCopy: trackName(),
                          });
                          writeText(avatar.id).then(() =>
                            toast({
                              title: "已复制模型ID",
                              description: avatar.id,
                            }),
                          );
                        }}
                      >
                        {avatar.id}
                        <Copy size={16} />
                      </Button>
                    </div>

                    <div className="w-full flex items-end justify-between gap-2">
                      {/* tag selector */}

                      <AvatarTagSelector avatar={avatar} />

                      {/* dates & delete row */}

                      <div className="pl-1 font-mono flex flex-col items-center justify-between text-sm gap-0.5">
                        <EasyTooltip tooltip="首次上传时间">
                          <p className="flex-center gap-2 bg-background border border-secondary text-accent-foreground px-2 rounded-full">
                            <Box size={13} />
                            {avatar.info && avatar.public
                              ? format(
                                  avatar.info?.created_at,
                                  "yyyy/MM/dd HH:mm",
                                )
                              : "----/--/-- --:--"}
                          </p>
                        </EasyTooltip>

                        <EasyTooltip tooltip="最后修改时间" side="bottom">
                          <p className="flex-center gap-2 bg-background border border-secondary text-accent-foreground px-2 rounded-full">
                            <CloudUpload size={14} />
                            {avatar.info && avatar.public
                              ? format(
                                  avatar.info?.updated_at,
                                  "yyyy/MM/dd HH:mm",
                                )
                              : "----/--/-- --:--"}
                          </p>
                        </EasyTooltip>
                      </div>

                      {/* delete button */}
                      <EasyTooltip tooltip="删除">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            track("avatar", {
                              delete: avatar.id,
                              userDelete: trackName(),
                            });
                            avatarMapState.delete(avatar.id);
                          }}
                        >
                          <TrashIcon size={16} />
                        </Button>
                      </EasyTooltip>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
        <div className="text-center">共 {sortedAvatars.length} 个模型</div>
      </div>
    </ScrollArea>
  );
}
