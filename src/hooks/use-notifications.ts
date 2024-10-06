"use client";
import React from "react";

import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { useSnapshot } from "valtio";
import { toast } from "@/hooks/use-toast";
import { settingsState } from "@/state/settings";

export default function useNotification() {
  const settings = useSnapshot(settingsState);
  const { notifications } = settings;

  React.useEffect(() => {
    (async () => {
      if (!settingsState.notifications) return;

      let granted: boolean = await isPermissionGranted();
      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }
      settingsState.notifications = granted;

      if (!granted) {
        toast({
          title: "通知权限被拒绝",
          description: "请在系统设置中启用通知权限",
        });
      }
    })();
  }, [notifications]);
}
