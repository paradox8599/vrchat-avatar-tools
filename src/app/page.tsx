"use client";
import {
  AvatarFallback,
  Avatar as AvatarIcon,
  AvatarImage,
} from "@/components/ui/avatar";
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
import { appState } from "@/state/app";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Trash2,
} from "lucide-react";
import React from "react";
import { useSnapshot } from "valtio";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useToast } from "@/hooks/use-toast";
import { open } from "@tauri-apps/plugin-shell";
import { format } from "date-fns";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { type Avatar } from "@/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { avatarMapState } from "@/state/avatars";
import useAvatars from "@/hooks/useAvatars";
import { Card, CardContent } from "@/components/ui/card";

function TagSelector({ avatar }: { avatar: Avatar }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { tags } = useAvatars();

  const mutAvatar = avatarMapState.get(avatar.id)!;

  function setTag(tag: string) {
    mutAvatar.tag = tag;
    avatarMapState.set(avatar.id, mutAvatar);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-32 justify-between p-2 text-xs",
            avatar.tag ? "opacity-100" : "opacity-50",
          )}
        >
          {avatar.tag ? avatar.tag : "选择标签"}
          <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" side="bottom" align="start">
        <Command>
          <CommandInput
            placeholder="输入标签..."
            value={search}
            onValueChange={setSearch}
            onKeyUp={(e) => e.key === "Enter" && setTag(search)}
          />
          <CommandList>
            <CommandEmpty>
              <div
                className="cursor-pointer flex items-center pl-4"
                onClick={() => setTag(search)}
              >
                <ChevronRight size={14} /> {search}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={`${tag ?? ""}`}
                  value={tag}
                  onSelect={(v) => setTag(v === avatar.tag ? "" : v)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      avatar.tag === tag ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {tag}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function Page() {
  const { auth } = useSnapshot(appState);
  const [addAvatarId, setAddAvatarId] = React.useState("");
  const { sortedAvatars } = useAvatars();
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

      if (!avatarMapState.get(idToAdd)) {
        avatarMapState.set(idToAdd, { id: idToAdd });
      }
      setAddAvatarId("");
    }
  }

  return (
    <main className="p-4">
      <div className="flex flex-row items-center justify-between gap-4">
        <Link href="/settings">
          <AvatarIcon className="relative avatar-btn">
            <AvatarImage
              src={auth?.me?.currentAvatarThumbnailImageUrl}
              className="object-cover"
            />
            <AvatarFallback>{auth?.me?.displayName}</AvatarFallback>
            <div className="avatar-tooltip absolute inset-auto h-full w-full flex-center text-white text-sm cursor-pointer bg-black bg-opacity-50">
              设置
            </div>
          </AvatarIcon>
        </Link>

        <form
          className="w-full flex justify-between gap-2"
          action={onAvatarIdAdd}
        >
          <Input
            name="avatarId"
            value={addAvatarId}
            onChange={(e) => setAddAvatarId(e.target.value.trim())}
            placeholder="输入模型蓝图 ID ..."
          />

          <Button type="submit" className="w-full max-w-14 md:max-w-32">
            添加
          </Button>
        </form>
      </div>

      {/* NOTE: Mobile View */}

      <div className="sm:hidden py-2 flex flex-col gap-2">
        {sortedAvatars.map((avatar) => {
          return (
            <Card
              key={avatar.id}
              className={cn("py-2 px-2", avatar.info ? "bg-red-200" : "")}
            >
              <div className="flex items-center justify-start gap-2">
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

                {/* info */}

                <div className="w-full text-xs flex flex-col gap-1">
                  {/* avatar id */}
                  <p className="font-mono text-center px-1 rounded-full bg-black bg-opacity-10">
                    {avatar.id}
                  </p>

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
                        "uppercase w-16 flex justify-center rounded-full font-bold",
                        avatar.info ? "text-white bg-red-600" : "bg-gray-300",
                      )}
                    >
                      {avatar.info?.releaseStatus ?? "未知"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* NOTE: Desktop View */}

      <div className="hidden sm:block">
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
                  <TagSelector avatar={avatar} />
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
    </main>
  );
}
