"use client";
import { appState, loadAppState } from "@/state";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";
import useSWR from "swr";
import { vrchatLogin } from "@/lib/api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth, init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  useSWR(
    "appInit",
    async () => {
      await loadAppState();
      if (!appState.auth?.credentials) return;
      await vrchatLogin(appState.auth!.credentials);
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: false,
    },
  );

  React.useEffect(() => {
    if (!init) return;
    if (path === "/login") {
      if (appState.auth?.me) router.replace("/");
    } else if (!appState.auth?.credentials) {
      router.replace("/login");
    }
  }, [auth, path, router]);

  return <>{children}</>;
}
