"use client";
import { appState, loadAppState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { vrchatLogin } from "@/lib/api";
import useAppUpdater from "./useAppUpdater";
import { ROUTE_HOME, ROUTES } from "@/routes";
import { toast } from "./use-toast";
import useSWRImmutable from "swr/immutable";
import { track } from "@/lib/aptabase";
import { authState } from "@/state/auth";

export default function useAppInit() {
  const { init, updated } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  useSWRImmutable(
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
        if (authState.credentials) await vrchatLogin();

        // load auto start state
        isEnabled().then((v) => (appState.settings.autoStart = v));

        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////
        track("app_init", { msg: "success" });
        appState.init = true;
        router.replace(ROUTE_HOME);
      } catch (e) {
        track("app_init", { msg: String(e) });
        toast({
          title: "初始化失败，请稍后重启 App 再试",
          description: String(e),
        });
      }
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
