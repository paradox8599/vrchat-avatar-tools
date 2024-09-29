import { vrchatIsReachable } from "@/lib/api";
import { appState } from "@/state/app";
import useSWR from "swr";
import { useSnapshot } from "valtio";

export default function useConnectivityCheck() {
  const { reachable } = useSnapshot(appState);

  useSWR(reachable ? null : "connectivityCheck", async () => {
    if (!appState.reachable) await vrchatIsReachable();
  });
}
