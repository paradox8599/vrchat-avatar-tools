"use client";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import React from "react";
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

export function Combobox({
  onSelect,
  value,
  options = [],
  allowCreate = false,
  align = "start",
  placeholder,
}: {
  onSelect?: (tag: string) => void;
  value?: string;
  options: string[];
  allowCreate?: boolean;
  align?: "start" | "center" | "end";
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  function select(value: string) {
    value = value.trim();
    if (value === "") return;

    if (allowCreate) {
      onSelect?.(value);
    } else {
      onSelect?.(options.includes(value) ? value : "");
    }
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
            "h-full w-32 justify-between py-1 text-xs rounded-full",
            value ? "opacity-100" : "opacity-50",
          )}
        >
          <span className="w-full">{value ? value : placeholder}</span>
          <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" side="bottom" align={align}>
        <Command>
          <CommandInput
            className="text-xs"
            placeholder={placeholder}
            value={search}
            onValueChange={setSearch}
            onKeyUp={(e) => e.key === "Enter" && select(search)}
          />

          <CommandList>
            {search?.trim() !== "" && (
              <CommandEmpty className="p-1">
                <div
                  className={cn(
                    "cursor-pointer rounded",
                    "text-accent-foreground bg-accent text-xs",
                    "flex items-center pl-8 py-[0.375rem]",
                    "[line-height:1.25rem] text-[0.875rem]",
                  )}
                  onClick={() => select(search.trim())}
                >
                  {allowCreate ? search.trim() : "无"}
                </div>
              </CommandEmpty>
            )}

            <CommandGroup>
              {options
                .sort((a, b) => {
                  if (a === value) return -1;
                  if (b === value) return 1;
                  return a.localeCompare(b);
                })
                .map((tag) => (
                  <CommandItem
                    key={`${tag ?? ""}`}
                    value={tag}
                    onSelect={select}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === tag ? "opacity-100" : "opacity-0",
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
