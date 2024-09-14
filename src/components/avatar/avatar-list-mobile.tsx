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
import { Copy } from "lucide-react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "@/hooks/use-toast";

export default function AvatarListMobile() {
  const { sortedAvatars } = useAvatars();

  useAvatarFetcher();

  return (
    <div className="sm:hidden py-2 flex flex-col gap-2">
      {sortedAvatars.map((avatar) => {
        return (
          <Card
            key={avatar.id}
            className={cn("py-2 px-2", avatar.info ? "bg-red-200" : "")}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-start gap-2">
                {/* thumbnail image */}

                <AvatarIcon
                  className="cursor-pointer"
                  onClick={() =>
                    open(`https://vrchat.com/home/avatar/${avatar.id}`)
                  }
                >
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
                      "rounded-full bg-white bg-opacity-25",
                      "font-mono font-bold text-xs",
                      "flex gap-2",
                    )}
                    variant="secondary"
                    onClick={() =>
                      writeText(avatar.id).then(() =>
                        toast({
                          title: "模型ID 已复制到剪切板",
                          description: avatar.id,
                        }),
                      )
                    }
                  >
                    {avatar.id}
                    <Copy size={16} />
                    {/* </p> */}
                  </Button>
                </div>
              </div>

              {/* info */}

              <div className="w-full text-sm flex flex-col gap-1">
                <div className="flex items-center justify-between px-2">
                  <p>
                    {avatar.info?.created_at &&
                      `上传: ${format(avatar.info?.created_at, "yy-MM-dd HH:mm")}`}
                  </p>
                  <p>
                    {avatar.info?.updated_at &&
                      `修改: ${format(avatar.info?.updated_at, "yy-MM-dd HH:mm")}`}
                  </p>
                </div>

                <div className="flex items-center justify-between px-2">
                  {/* avatar author name  */}

                  <p className="font-bold">{avatar.info?.authorName ?? ""}</p>

                  {/* avatar status */}

                  <p
                    className={cn(
                      "uppercase w-20 flex justify-center rounded-full font-bold py-1",
                      avatar.info ? "text-white bg-red-600" : "bg-gray-300",
                    )}
                  >
                    {avatar.info?.releaseStatus ?? "未知"}
                  </p>
                </div>
              </div>

              {/* actions */}
              {avatar.info && (
                <div className="w-full grid grid-cols-3 text-xs gap-2">
                  <Button
                    className="rounded-full"
                    onClick={() =>
                      open(`https://vrchat.com/home/avatar/${avatar.id}`)
                    }
                  >
                    查看模型
                  </Button>
                  <Button
                    className="rounded-full"
                    onClick={() =>
                      open(
                        `https://vrchat.com/home/user/${avatar.info?.authorId}`,
                      )
                    }
                  >
                    查看作者
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
