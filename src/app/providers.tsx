"use client";

import useAppInit from "@/hooks/use-app-init";
import useAppUpdater from "@/hooks/use-app-updater";
import useConnectivityCheck from "@/hooks/use-connectivity-check";
import useNotification from "@/hooks/use-notifications";
import usePath from "@/hooks/use-path";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import useRoutes from "@/hooks/use-routes";
import { useAvatarInfoFetcher } from "@/hooks/use-avatar-info-fetcher";
import React from "react";

export default function AppProvider({ children }: React.PropsWithChildren) {
  useAppInit();
  useAppUpdater({ interval: 1000 * 60 * 60 });
  useConnectivityCheck();
  useNotification();
  usePath();
  useRoutes();

  useAvatarInfoFetcher();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </NextThemesProvider>
  );
}
