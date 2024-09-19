import React from "react";

import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export default function NotificationProvider({
  children,
}: React.PropsWithChildren<{}>) {
  React.useEffect(() => {
    (async () => {
      let granted = await isPermissionGranted();

      if (!granted) {
        const permission = await requestPermission();
        granted = permission === "granted";
      }
    })();
  }, []);

  return children;
}
