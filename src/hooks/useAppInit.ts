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
import { checkAndUpdate } from "@/lib/update";

export default function useAppInit() {
  const { init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  useSWR(
    appState.init ? null : "appInit",
    async () => {
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////

      disableContextMenu();

      // version check
      const version = await getVersion();
      appState.version = version;
      await checkAndUpdate({ silent: true });

      // load app data & settings
      await loadAvatarState();
      await loadAppState();
      if (appState.auth?.credentials) await vrchatLogin();

      // load auto start state
      isEnabled().then((v) => (appState.settings.autoStart = v));

      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  React.useEffect(() => {
    if (!appState.init) {
      router.replace("/splash");
    } else if (path === "/splash") {
      router.push("/");
    }
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
