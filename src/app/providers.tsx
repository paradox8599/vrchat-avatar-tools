"use client";

import useAppInit from "@/hooks/app/use-app-init";
import useAppUpdater from "@/hooks/app/use-app-updater";
import useConnectivityCheck from "@/hooks/app/use-connectivity-check";
import useNotification from "@/hooks/app/use-notifications";
import usePath from "@/hooks/app/use-path";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import useRoutes from "@/hooks/app/use-routes";
import { useAvatarInfoFetcher } from "@/hooks/avatars/use-avatar-info-fetcher";
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
