"use client";
import { appState, loadAppState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { useSnapshot } from "valtio";
import { isEnabled } from "@tauri-apps/plugin-autostart";
import { vrchatLogin } from "@/lib/api";
import { getVersion } from "@tauri-apps/api/app";
import useAppUpdater from "./useAppUpdater";

export default function useAppInit() {
  const { init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  useSWR(
    init ? null : "appInit",
    async () => {
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////

      disableContextMenu();

      // load app data & settings
      await loadAvatarState();
      await loadAppState();
      if (appState.auth?.credentials) await vrchatLogin();

      // load auto start state
      isEnabled().then((v) => (appState.settings.autoStart = v));

      appState.version = await getVersion();

      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      appState.init = true;
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useAppUpdater({ interval: 1000 * 60 * 60 });

  React.useEffect(() => {
    if (!appState.init) router.replace("/");
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
