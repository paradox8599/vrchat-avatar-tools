"use client";
import React from "react";
import ThemeProvider from "./theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import useAppInit from "@/hooks/useAppInit";
import useAuth from "@/hooks/useAuth";
import useNotifications from "@/hooks/useNotifications";

export default function AppProviders({ children }: React.PropsWithChildren) {
  useAppInit();
  useAuth();
  useNotifications();
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  );
}
