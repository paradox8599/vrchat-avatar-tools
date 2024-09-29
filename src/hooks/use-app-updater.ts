import React from "react";
import { checkUpdate } from "@/lib/update";
import { appState } from "@/state/app";

export default function useAppUpdater({ interval }: { interval: number }) {
  React.useEffect(() => {
    async function check() {
      if (appState.init) await checkUpdate();
    }
    const timer = setInterval(check, interval);
    return () => clearInterval(timer);
  }, [interval]);
}
