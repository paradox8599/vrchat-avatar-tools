"use client";
import React from "react";
import { ROUTES } from "@/routes";
import { appState } from "@/state/app";
import { authState } from "@/state/auth";
import { LoginStatus } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { useSnapshot } from "valtio";

export default function useAuth() {
  const { init } = useSnapshot(appState);
  const auth = useSnapshot(authState);
  const path = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!appState.init) return;
    // logged in at /login page
    if (path === ROUTES.login) {
      if (authState.status === LoginStatus.Success)
        router.replace(ROUTES.start);
    }
    // logged out at other pages
    else if (authState.status !== LoginStatus.Success) {
      router.replace(ROUTES.login);
    }
  }, [init, auth, path, router]);
}
