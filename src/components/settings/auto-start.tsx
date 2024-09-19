import { useSnapshot } from "valtio";
import { Switch } from "../ui/switch";
import { appState } from "@/state/app";
import { Label } from "../ui/label";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import React from "react";

export function AutoStartToggle() {
  const { settings } = useSnapshot(appState);
  const [loading, setLoading] = React.useState(false);
  return (
    <Label className="w-full flex items-center justify-between">
      <span>开机时启动</span>
      <Switch
        className="mx-2"
        checked={settings.autoStart}
        onCheckedChange={async (checked) => {
          if (loading) return;
          setLoading(true);
          if (checked) {
            await enable();
          } else {
            disable();
          }
          appState.settings.autoStart = await isEnabled();
          setLoading(false);
        }}
      />
    </Label>
  );
}
