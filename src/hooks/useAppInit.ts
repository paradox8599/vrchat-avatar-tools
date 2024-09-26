"use client";
import { appState, loadAppState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { useSnapshot } from "valtio";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { vrchatLogin } from "@/lib/api";
import useAppUpdater from "./useAppUpdater";
import { ROUTE_HOME, ROUTES } from "@/routes";
import { toast } from "./use-toast";

export default function useAppInit() {
  const { init, updated } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();
  console.log("updated", updated, "init", init);

  useSWR(
    // do not init if:
    // - not updated
    // - already init
    !updated || init ? null : "appInit",
    async () => {
      try {
        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////

        disableContextMenu();

        // load app data & settings
        await loadAppState();
        await loadAvatarState();
        if (appState.auth?.credentials) await vrchatLogin();

        // load auto start state
        isEnabled().then((v) => (appState.settings.autoStart = v));

        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////
      } catch (e) {
        toast({ title: "初始化失败", description: String(e) });
      } finally {
        appState.init = true;
        router.replace(ROUTE_HOME);
      }
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useAppUpdater({ interval: 1000 * 60 * 60 });

  React.useEffect(() => {
    if (!appState.init) router.replace(ROUTES.start);
  }, [init, path, router]);
}

function disableContextMenu() {
  // if (window.location.hostname !== "tauri.localhost") return;

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
}
