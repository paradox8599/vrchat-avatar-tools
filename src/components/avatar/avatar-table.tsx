"use client";
import { Avatar as AvatarIcon, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Copy, Trash2 } from "lucide-react";
import React from "react";
import { format } from "date-fns";
import { avatarMapState } from "@/state/avatars";
import useAvatars from "@/hooks/useAvatars";
import { toast } from "@/hooks/use-toast";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useAvatarFetcher } from "@/hooks/useAvatarFetcher";
import { AvatarTagSelector } from "./tag-selector";

export default function AvatarListDesktop() {
  const { sortedAvatars } = useAvatars();

  useAvatarFetcher();

  return (
    <div className="hidden lg:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>状态</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>封面</TableHead>
            <TableHead>模型ID</TableHead>
            <TableHead>上传者</TableHead>
            <TableHead>上传时间</TableHead>
            <TableHead>修改时间</TableHead>
            <TableHead>状态获取时间</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedAvatars.map((avatar) => (
            <TableRow key={avatar.id}>
              {/* 状态 */}
              <TableCell className="uppercase font-semibold text-red-500">
                {avatar.info?.releaseStatus}
              </TableCell>

              <TableCell className="">
                <AvatarTagSelector avatar={avatar} />
              </TableCell>

              {/* 封面 */}
              <TableCell>
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
                </AvatarIcon>
              </TableCell>

              {/* 模型 ID */}
              <TableCell>
                <span
                  className="cursor-pointer flex items-center gap-2"
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
                {avatar.lastFetch && format(avatar.lastFetch, "yy-MM-dd HH:mm")}
              </TableCell>

              {/* 删除 */}
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => avatarMapState.delete(avatar.id)}
                >
                  <Trash2 color="red" size="18" strokeWidth="1" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
