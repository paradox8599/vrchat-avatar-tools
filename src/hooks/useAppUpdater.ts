import React from "react";
import { getVersion } from "@tauri-apps/api/app";
import { checkAndUpdate } from "@/lib/update";
import { appState } from "@/state/app";

export default function useAppUpdater() {
  React.useEffect(() => {
    async function update() {
      const version = await getVersion();
      appState.version = version;
      await checkAndUpdate({ silent: true });
    }

    const timer = setInterval(update, 1000 * 60 * 60);

    return () => clearInterval(timer);
  }, []);
}
