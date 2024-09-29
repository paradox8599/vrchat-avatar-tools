"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ClientOnly from "../client-only";
import { track } from "@/lib/aptabase";

function trackTheme(theme: string) {
  track("settings", { theme });
}

export function ThemeToggle() {
  const { theme, setTheme: _setTheme, resolvedTheme } = useTheme();

  const themeName = React.useMemo(
    () =>
      ({ system: "跟随系统", light: "总是关闭", dark: "总是开启" })[
        theme ?? ""
      ],
    [theme],
  );

  function setTheme(themeStr: string) {
    trackTheme(themeStr);
    _setTheme(themeStr);
  }

  return (
    <ClientOnly className="w-full flex flex-row items-center justify-between gap-4">
      <p>深色模式</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {resolvedTheme === "light" && (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
            {resolvedTheme === "dark" && (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="ml-2">{themeName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => setTheme("system")}>
            跟随系统
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            总是开启
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            总是关闭
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ClientOnly>
  );
}

export function ThemeToggleIcon(props: React.ComponentProps<"div">) {
  const { setTheme: _setTheme, resolvedTheme } = useTheme();

  function setTheme(themeStr: string) {
    trackTheme(themeStr);
    _setTheme(themeStr);
  }

  return (
    <ClientOnly {...props}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
        onContextMenu={() => setTheme("system")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">深色模式</span>
      </Button>
    </ClientOnly>
  );
}
