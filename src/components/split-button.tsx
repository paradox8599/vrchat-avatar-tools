import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const noFocusRing = "focus-visible:ring-0 focus-visible:ring-offset-0";

export default function SplitButton({
  children,
  dropdownItems,
  onClick,
  variant,
  size,
  type,
}: ButtonProps & {
  dropdownItems?: { label: string; onClick: () => void }[];
}) {
  if (!dropdownItems || dropdownItems.length === 0) {
    return (
      <Button onClick={onClick} className="w-full">
        {children}
      </Button>
    );
  }

  return (
    <div className="flex">
      <Button
        onClick={onClick}
        type={type}
        className={cn(
          "rounded-full rounded-r-none flex-1 hover:opacity-90 active:opacity-80",
          noFocusRing,
        )}
        variant={variant}
        size={size}
      >
        {children}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn(
              "rounded-full rounded-l-none border-l-0 px-2 hover:opacity-90",
              noFocusRing,
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          {dropdownItems.map((item, index) => (
            <DropdownMenuItem key={index} onClick={item.onClick}>
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
