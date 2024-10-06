import { useSnapshot } from "valtio";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { settingsState } from "@/state/settings";

export function NotificationToggle() {
  const settings = useSnapshot(settingsState);
  return (
    <Label className="w-full flex items-center justify-between">
      <span>当有模型被公开时通知提醒我</span>
      <Switch
        className="mx-2"
        checked={settings.notifications}
        onCheckedChange={(checked) => (settingsState.notifications = checked)}
      />
    </Label>
  );
}
