"use client";
import { appState } from "@/state/app";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth, init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

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
