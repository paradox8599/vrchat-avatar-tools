"use client";
import { Updater } from "@/components/updater";
import { appState } from "@/state/app";
import { useSnapshot } from "valtio";

export default function Page() {
  const { reachable } = useSnapshot(appState);
  return (
    <main className="h-full flex-center">
      {reachable && <Updater />}
      {reachable === false && (
        <div>无法连接到 VRChat 服务器，请检查网络连接</div>
      )}
    </main>
  );
}
