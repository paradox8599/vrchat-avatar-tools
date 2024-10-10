"use client";
import { appState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { useSnapshot } from "valtio";
import { toast } from "./use-toast";
import useSWRImmutable from "swr/immutable";
import { track, trackName } from "@/lib/aptabase";
import { loadAuthState } from "@/state/auth";
import { loadSettingsState } from "@/state/settings";

export default function useAppInit() {
  const { init, updated, reachable } = useSnapshot(appState);

  useSWRImmutable(
    // do not init if:
    // - not updated
    // - already init
    !reachable || !updated || init ? null : "appInit",
    async () => {
      try {
        ////////////////////////////////////////////////////////////////

        // load app data & settings
        await loadSettingsState();
        await loadAuthState();
        await loadAvatarState();

        ////////////////////////////////////////////////////////////////
        track("init", { success: trackName() });
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
