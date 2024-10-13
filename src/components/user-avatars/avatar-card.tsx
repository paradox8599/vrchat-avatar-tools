import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import vrchat from "vrchat";
import { VRChatClient } from "@/lib/api";
import { Button } from "../ui/button";
import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import ConfirmDialog from "../confirm-dialog";
import { Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "@/hooks/app/use-toast";
import _ from "lodash";

export default function AvatarCard({
  avatar,
  client,
}: {
  client: VRChatClient;
  avatar: vrchat.Avatar;
}): React.ReactNode {
  const [updateInfo, setUpdateInfo] =
    React.useState<vrchat.UpdateAvatarRequest>({});

  function addUpdateInfo(value: vrchat.UpdateAvatarRequest) {
    setUpdateInfo((prev) =>
      _({ ...prev, ...value })
        .omitBy(_.isUndefined)
        .value(),
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={avatar.thumbnailImageUrl} />
            <AvatarFallback />
          </Avatar>

          <CardTitle>{avatar.name}</CardTitle>

          <CardDescription>
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
          </CardDescription>
        </div>

        <ConfirmDialog
          title="删除"
          description="确定要删除这个模型吗？"
          onConfirm={async () => {
            // TODO: delete avatar
            alert("delete");
          }}
        >
          <Button size="icon" variant="destructive">
            <Trash2 />
          </Button>
        </ConfirmDialog>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-8">
          <Label className="flex items-center gap-2">
            <span className="whitespace-nowrap">名字</span>
            <Input
              value={updateInfo.name ?? avatar.name}
              onChange={(e) => {
                addUpdateInfo({
                  name:
                    e.target.value === avatar.name ? undefined : e.target.value,
                });
              }}
            />
          </Label>

          <Label className="flex gap-2 items-center">
            <span className="whitespace-nowrap">公开状态</span>
            <Switch
              checked={
                (updateInfo.releaseStatus ?? avatar.releaseStatus) === "public"
              }
              onCheckedChange={(checked) => {
                const state = checked ? "public" : "private";
                addUpdateInfo({
                  releaseStatus:
                    state === avatar.releaseStatus ? undefined : state,
                });
              }}
            />
          </Label>
        </div>

        <Label className="flex gap-2 items-start">
          <span className="whitespace-nowrap py-3">描述</span>
          <Textarea
            value={updateInfo.description ?? avatar.description}
            onChange={(e) => {
              addUpdateInfo({
                description:
                  e.target.value === avatar.description
                    ? undefined
                    : e.target.value,
              });
            }}
          />
        </Label>

        {Object.keys(updateInfo).length > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setUpdateInfo({})}
            >
              重置
            </Button>
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={async () => {
                await client.updateAvatar(avatar.id, updateInfo);
                avatar.name = updateInfo.name ?? avatar.name;
                setUpdateInfo({});
              }}
            >
              保存
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
