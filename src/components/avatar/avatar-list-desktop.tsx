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
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  Copy,
  Trash2,
} from "lucide-react";
import React from "react";
import { format } from "date-fns";
import { avatarMapState } from "@/state/avatars";
import { Avatar } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useAvatars from "@/hooks/useAvatars";
import { toast } from "@/hooks/use-toast";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { useAvatarFetcher } from "@/hooks/useAvatarFetcher";

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
