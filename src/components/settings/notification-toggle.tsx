import { useSnapshot } from "valtio";
import { Switch } from "../ui/switch";
import { appState } from "@/state/app";
import { Label } from "../ui/label";

export function NotificationToggle() {
  const { settings } = useSnapshot(appState);
  return (
    <Label className="w-full flex items-center justify-between px-2">
      <span>当有模型被公开时通知提醒我</span>
      <Switch
        className="mx-2"
        checked={settings.notifications}
        onCheckedChange={(checked) =>
          (appState.settings.notifications = checked)
        }
      />
    </Label>
  );
}
