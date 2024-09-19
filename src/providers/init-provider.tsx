"use client";
import { useAutoBodyThemeSetter } from "@/components/settings/theme-toggle";
import { vrchatLogin } from "@/lib/api";
import { appState, loadAppState } from "@/state/app";
import { loadAvatarState } from "@/state/avatars";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { useSnapshot } from "valtio";

export default function InitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  useSWR(
    appState.init ? null : "appInit",
    async () => {
      await loadAvatarState();
      await loadAppState();
      if (!appState.auth?.credentials) return;
      await vrchatLogin(appState.auth!.credentials);
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useAutoBodyThemeSetter();

  React.useEffect(() => {
    if (!appState.init) {
      router.replace("/splash");
    } else if (path === "/splash") {
      router.push("/settings");
    }
  }, [init, path, router]);

  return <>{children}</>;
}
