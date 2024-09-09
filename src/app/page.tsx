"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAvatarFetcher } from "@/hooks/useAvatarFetcher";
import { appState, logout } from "@/state";
import { Copy, Trash2 } from "lucide-react";
import React from "react";
import { useSnapshot } from "valtio";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useToast } from "@/hooks/use-toast";
import { open } from "@tauri-apps/plugin-shell";
import { format, formatRelative } from "date-fns";

export default function Page() {
  const { auth, avatars } = useSnapshot(appState);
  const [addAvatarId, setAddAvatarId] = React.useState("");
  const { toast } = useToast();

  useAvatarFetcher();

  function onAvatarIdAdd() {
    {
      if (
        !addAvatarId.startsWith("avtr_") &&
        !addAvatarId.startsWith("https://vrchat.com/home/avatar/")
      ) {
        return;
      }
      const idToAdd = addAvatarId.replace(
        "https://vrchat.com/home/avatar/",
        "",
      );
      if (!appState.avatars.find((a) => a.id === idToAdd)) {
        appState.avatars.push({ id: idToAdd });
      }
      setAddAvatarId("");
    }
  }

  return (
    <main className="p-4">
      <div className="flex flex-row items-center justify-between gap-4">
        <Avatar className="relative avatar-btn" onClick={() => logout()}>
          <AvatarImage src={auth?.me?.currentAvatarThumbnailImageUrl} />
          <div className="avatar-tooltip absolute inset-auto h-full w-full flex-center text-white text-sm cursor-pointer bg-black bg-opacity-50">
            退出
          </div>
        </Avatar>
        <form
          className="w-full flex justify-between gap-2"
          action={onAvatarIdAdd}
        >
          <Input
            name="avatarId"
            value={addAvatarId}
            onChange={(e) => setAddAvatarId(e.target.value.trim())}
            placeholder="输入模型 ID..."
          />
          <Button type="submit" className="w-full max-w-32">
            添加
          </Button>
        </form>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>状态</TableHead>
              <TableHead>封面</TableHead>
              <TableHead>模型 ID</TableHead>
              <TableHead>上传者</TableHead>
              <TableHead>上传时间</TableHead>
              <TableHead>修改时间</TableHead>
              <TableHead>状态获取时间</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.values(avatars)
              .sort((a, b) => {
                if (a.info?.releaseStatus) {
                  return -1;
                } else if (b.info?.releaseStatus) {
                  return 1;
                }
                return (
                  new Date(a.lastFetch ?? 0).getTime() -
                  new Date(b.lastFetch ?? 0).getTime()
                );
              })
              .map((avatar) => {
                return (
                  <TableRow key={avatar.id}>
                    {/* 状态 */}
                    <TableCell className="uppercase font-semibold text-red-500">
                      {avatar.info?.releaseStatus}
                    </TableCell>
                    {/* 封面 */}
                    <TableCell>
                      <Avatar
                        className="cursor-pointer"
                        onClick={() =>
                          open(`https://vrchat.com/home/avatar/${avatar.id}`)
                        }
                      >
                        <AvatarImage src={avatar.info?.thumbnailImageUrl} />
                      </Avatar>
                    </TableCell>
                    {/* 模型 ID */}
                    <TableCell>
                      <span
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => {
                          writeText(avatar.id).then(() => {
                            toast({
                              title: "模型ID 已复制到剪切板",
                              description: avatar.id,
                            });
                          });
                        }}
                      >
                        {avatar.id}
                        <Copy size={16} />
                      </span>
                    </TableCell>
                    {/* 上传者 */}
                    <TableCell>
                      <span
                        className="font-semibold cursor-pointer"
                        onClick={() =>
                          open(
                            `https://vrchat.com/home/user/${avatar.info?.authorId}`,
                          )
                        }
                      >
                        {avatar.info?.authorName}
                      </span>
                    </TableCell>
                    {/* 上传时间 */}
                    <TableCell>
                      {avatar.info?.created_at &&
                        format(avatar.info?.created_at, "yy-MM-dd HH:mm")}
                    </TableCell>
                    {/* 修改时间 */}
                    <TableCell>
                      {avatar.info?.updated_at &&
                        format(avatar.info?.updated_at, "yy-MM-dd HH:mm")}
                    </TableCell>
                    {/* 状态获取时间 */}
                    <TableCell>
                      {avatar.lastFetch &&
                        format(avatar.lastFetch, "yy-MM-dd HH:mm")}
                    </TableCell>
                    {/* 删除 */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          appState.avatars = appState.avatars.filter(
                            (a) => a.id !== avatar.id,
                          );
                        }}
                      >
                        <Trash2 color="red" size="18" strokeWidth="1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
