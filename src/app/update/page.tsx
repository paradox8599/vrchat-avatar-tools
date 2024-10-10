"use client";
import { Updater } from "@/components/updater";
import { appState } from "@/state/app";
import { useSnapshot } from "valtio";

export default function UpdatePage() {
  const { reachable } = useSnapshot(appState);
  return <main className="h-full flex-center">{reachable && <Updater />}</main>;
}
