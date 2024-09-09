"use client";
import { appState } from "@/state";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useSnapshot } from "valtio";

export default function InitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { init } = useSnapshot(appState);
  const path = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (!appState.init) {
      router.replace("/splash");
    } else if (path === "/splash") {
      router.push("/settings");
    }
  }, [init, path, router]);

  return <>{children}</>;
}
