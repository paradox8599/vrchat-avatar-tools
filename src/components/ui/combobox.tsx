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
import _ from "lodash";

type Option = {
  label: string;
  value: string;
};

function optionHasLabel(options: Option[] | string[]): options is Option[] {
  return typeof options[0] === "object";
}

export function Combobox({
  onSelect,
  value,
  options = [],
  placeholder,
  noCreate = false,
}: {
  onSelect?: (value: string) => void;
  value?: string;
  options: string[] | Option[];
  placeholder?: string;
  noCreate?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const hasLabels = optionHasLabel(options);
  const allowCreate = !hasLabels && !noCreate;
  const labels = hasLabels ? _.map(options, "label") : options;
  const values = hasLabels ? _.map(options, "value") : options;

  function select(value: string) {
    value = value.trim();
    if (value === "") return;

    if (allowCreate) {
      onSelect?.(value);
    } else {
      onSelect?.(values.includes(value) ? value : "");
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
      <PopoverContent className="w-[200px] p-0" side="bottom" align="center">
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
              {labels
                .sort((a, b) => {
                  if (a === value) return -1;
                  if (b === value) return 1;
                  return a.localeCompare(b);
                })
                .map((label, i) => (
                  <CommandItem
                    key={`${label ?? ""}`}
                    value={values[i]}
                    onSelect={select}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === values[i] ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {label}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
