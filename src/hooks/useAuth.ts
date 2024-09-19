"use client";
import { appState } from "@/state/app";
import { LoginStatus } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";

export default function useAuth() {
  const { auth, init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!appState.init) return;
    // logged in at /login page
    if (path === "/login") {
      if (appState.auth.status === LoginStatus.Success) router.replace("/");
    }
    // logged out at other pages
    else if (appState.auth.status !== LoginStatus.Success) {
      router.replace("/login");
    }
  }, [init, auth, path, router]);
}
