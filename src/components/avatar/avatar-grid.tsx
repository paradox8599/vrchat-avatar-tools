import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  AvatarFallback,
  Avatar as AvatarIcon,
  AvatarImage,
} from "@/components/ui/avatar";
import useAvatars from "@/hooks/useAvatars";
import { useAvatarFetcher } from "@/hooks/useAvatarFetcher";
import { Button } from "../ui/button";
import {
  Box,
  CloudUpload,
  Copy,
  SquareArrowOutUpRight,
  TrashIcon,
} from "lucide-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "@/hooks/use-toast";
import { AvatarTagSelector } from "./tag-selector";
import { avatarMapState } from "@/state/avatars";
import { Tooltip } from "../tooltip";

export default function AvatarGrid() {
  const { sortedAvatars } = useAvatars();

  useAvatarFetcher();

  return (
    <div className="h-full flex justify-center overflow-y-scroll [scrollbar-width:thin]">
      <div
        className={cn(
          "flex flex-col items-center justify-start gap-2 h-fit",
          "md:grid md:gap-y-4 md:gap-x-4",
          "md:grid-cols-2",
          "xl:grid-cols-3",
          "2xl:grid-cols-4",
          "py-2",
        )}
      >
        {sortedAvatars.map((avatar) => {
          return (
            <Card
              key={avatar.id}
              className={cn(
                "max-w-fit min-w-fit min-h-[8rem]",
                "px-2 flex flex-col justify-center gap-2",
                avatar.info ? "bg-cardhl" : "bg-card",
              )}
            >
              {/* thumbnail & id row */}

              <div className="flex items-start justify-start gap-2">
                {/* thumbnail image */}

                <AvatarIcon>
                  <AvatarImage
                    src={avatar.info?.thumbnailImageUrl}
                    className="object-cover"
                  />
                  <AvatarFallback />
                </AvatarIcon>

                {/* avatar id */}

                <div className="w-full flex items-center justify-center">
                  <Button
                    className={cn(
                      "rounded-full bg-background",
                      "font-mono font-bold text-xs",
                      "flex gap-2",
                    )}
                    variant="secondary"
                    onClick={() =>
                      writeText(avatar.id).then(() =>
                        toast({
                          title: "已复制模型ID",
                          description: avatar.id,
                        }),
                      )
                    }
                  >
                    {avatar.id}
                    <Copy size={16} />
                  </Button>
                </div>
              </div>

              {/* info row */}

              <div className="w-full text-sm flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  {/* vrchat urls */}
                  <div className="flex items-center justify-start gap-4">
                    {/* avatar status */}

                    <Tooltip tooltip="公开状态">
                      <Button
                        className={cn(
                          "uppercase w-24 rounded-full font-bold flex gap-2",
                          avatar.info ? "" : "bg-muted text-foreground",
                        )}
                        size="sm"
                        onClick={() =>
                          open(`https://vrchat.com/home/avatar/${avatar.id}`)
                        }
                      >
                        {avatar.info?.releaseStatus ? "已公开" : "未知"}
                        <SquareArrowOutUpRight size={12} />
                      </Button>
                    </Tooltip>

                    {/* avatar author name  */}

                    {avatar.info && (
                      <Tooltip tooltip="上传者">
                        <Button
                          className="rounded-full text-md flex gap-1 font-bold"
                          size="sm"
                          onClick={() =>
                            open(
                              `https://vrchat.com/home/user/${avatar.info?.authorId}`,
                            )
                          }
                        >
                          {avatar.info?.authorName}
                          <SquareArrowOutUpRight size={12} />
                        </Button>
                      </Tooltip>
                    )}
                  </div>

                  {/* tag selector */}

                  <div className="flex-center">
                    <AvatarTagSelector avatar={avatar} />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center gap-1">
                {/* dates & delete row */}

                <div className="font-mono flex items-center justify-between text-sm gap-2">
                  <Tooltip tooltip="首次上传时间">
                    <p className="flex-center gap-2 bg-accent text-accent-foreground px-2 rounded-full">
                      <Box size={13} />
                      {avatar.info
                        ? format(avatar.info?.created_at, "yyyy/MM/dd HH:mm")
                        : "----/--/-- --:--"}
                    </p>
                  </Tooltip>

                  <Tooltip tooltip="最后修改时间">
                    <p className="flex-center gap-2 bg-accent text-accent-foreground px-2 rounded-full">
                      <CloudUpload size={14} />
                      {avatar.info
                        ? format(avatar.info?.updated_at, "yyyy/MM/dd HH:mm")
                        : "----/--/-- --:--"}
                    </p>
                  </Tooltip>
                </div>

                {/* delete button */}
                <Tooltip tooltip="删除">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-1 h-5"
                    onClick={() => avatarMapState.delete(avatar.id)}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </Tooltip>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
