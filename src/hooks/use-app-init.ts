"use client";
import { appState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { useSnapshot } from "valtio";
import { toast } from "./use-toast";
import useSWRImmutable from "swr/immutable";
import { track, trackId } from "@/lib/aptabase";
import { loadAuthState } from "@/state/auth";
import { loadSettingsState } from "@/state/settings";

export default function useAppInit() {
  const { init, updated } = useSnapshot(appState);

  useSWRImmutable(
    // do not init if:
    // - not updated
    // - already init
    !updated || init ? null : "appInit",
    async () => {
      try {
        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////

        disableContextMenu();

        // load app data & settings
        await loadSettingsState();
        await loadAuthState();
        await loadAvatarState();

        ////////////////////////////////////////////////////////////////
        ////////////////////////////////////////////////////////////////
        track("init", { success: trackId() });
        appState.init = true;
      } catch (e) {
        track("init", { error: String(e) });
        toast({
          title: "初始化失败，请稍后重启 App 再试",
          description: String(e),
        });
      }
    },
  );
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
