"use client";
import { useAutoBodyThemeSetter } from "@/components/settings/theme-toggle";
import { appState, loadAppState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { useSnapshot } from "valtio";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { checkAuth } from "@/lib/api";

export default function useAppInit() {
  const { init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  useSWR(
    appState.init ? null : "appInit",
    async () => {
      // load auto start state
      isEnabled().then((v) => (appState.settings.autoStart = v));
      // load app data & settings
      await loadAvatarState();
      await loadAppState();
      if (!appState.auth?.credentials) return;
      await checkAuth();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useAutoBodyThemeSetter();

  React.useEffect(() => {
    if (!appState.init) {
      router.replace("/splash");
    } else if (path === "/splash") {
      router.push("/");
    }
  }, [init, path, router]);

  React.useEffect(() => {
    if (window.location.hostname !== "tauri.localhost") {
      return;
    }

    document.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault();
        return false;
      },
      { capture: true },
    );

    document.addEventListener(
      "selectstart",
      (e) => {
        e.preventDefault();
        return false;
      },
      { capture: true },
    );
  }, []);
}
