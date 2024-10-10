import { authState } from "@/state/auth";
import { useSnapshot } from "valtio";
import { Combobox } from "../ui/combobox";
import { appState } from "@/state/app";
import { UserInfo } from "@/types";

export default function UserSelector() {
  const { selectedUsername } = useSnapshot(appState.pages.userAvatars);
  const auths = useSnapshot(authState);
  const users = Object.values(auths);

  const options = users
    .filter((u) => u.info)
    .map((u) => u.info as UserInfo)
    .map((u) => ({ label: u.displayName, value: u.username }));

  function setUsername(un: string) {
    appState.pages.userAvatars.selectedUsername = un;
  }

  return (
    <Combobox
      options={options}
      onSelect={setUsername}
      value={selectedUsername}
      placeholder="选择用户..."
      noCreate
    />
  );
}
