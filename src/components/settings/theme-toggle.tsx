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

export function useAutoBodyThemeSetter() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const body = document.getElementsByTagName("body")[0];
    const currentThemeClass = body.className
      .match(/ (dark|light|system) /)
      ?.pop()
      ?.trim();
    if (currentThemeClass === resolvedTheme) return;

    body.className =
      body.className
        .replaceAll(/ (dark|light|system) /g, " ")
        .replaceAll(/ +/g, " ") + ` ${resolvedTheme} `;
  }, [resolvedTheme]);
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeName = React.useMemo(
    () =>
      ({ system: "跟随系统", light: "总是关闭", dark: "总是开启" })[
        theme ?? ""
      ],
    [theme],
  );

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

// export function ThemeToggle(){
//
//   lazy
//
// }
