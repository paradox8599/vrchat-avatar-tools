"use client";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ChevronsUpDown } from "lucide-react";
import React from "react";
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

export function TagSelector({ avatar }: { avatar: Avatar }) {
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
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-32 justify-between p-2 text-xs rounded-full",
            avatar.tag ? "opacity-100" : "opacity-50",
          )}
        >
          {avatar.tag ? avatar.tag : "选择标签"}
          <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" side="bottom" align="end">
        <Command>
          <CommandInput
            placeholder="输入标签..."
            value={search}
            onValueChange={setSearch}
            onKeyUp={(e) => e.key === "Enter" && setTag(search)}
          />
          <CommandList>
            {search?.trim() !== "" && (
              <CommandEmpty>
                <div
                  className="cursor-pointer flex items-center pl-8"
                  onClick={() => setTag(search.trim())}
                >
                  {search.trim()}
                </div>
              </CommandEmpty>
            )}

            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={`${tag ?? ""}`}
                  value={tag}
                  onSelect={(v) => setTag(v === avatar.tag ? "" : v)}
                  className="cursor-pointer"
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
