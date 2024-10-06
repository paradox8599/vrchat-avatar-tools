import { authMapState, myAuthState } from "@/state/auth";
import { useSnapshot } from "valtio";
import { Combobox } from "../ui/combobox";
import { appState } from "@/state/app";
import { UserInfo } from "@/types";

export default function UserSelector() {
  const { avatarsSelectedUsername } = useSnapshot(appState);
  const authMap = useSnapshot(authMapState);
  const users = Array.from(authMap.values());

  const options = users
    .filter((u) => u.info)
    .map((u) => u.info as UserInfo)
    .map((u) => ({ label: u.displayName, value: u.username }));

  return (
    <div>
      <Combobox
        options={[
          {
            label: myAuthState.info?.displayName as string,
            value: myAuthState.info?.username as string,
          },
          ...options,
        ]}
        onSelect={(v) => (appState.avatarsSelectedUsername = v)}
        value={avatarsSelectedUsername}
        placeholder="选择用户..."
      />
    </div>
  );
}
