"use client";
import vrchat from "vrchat";
import { authState } from "@/state/auth";
import { useSnapshot } from "valtio";
import { Combobox } from "../ui/combobox";
import { appState } from "@/state/app";
import { LoginStatus } from "@/types";

export default function UserSelector() {
  const { selectedUsername } = useSnapshot(appState.pages.userAvatars);
  const auths = useSnapshot(authState);
  const users = Object.values(auths);

  const options = users
    .filter((u) => u.status === LoginStatus.Success)
    .map((u) => u.info as vrchat.CurrentUser)
    .map((u) => ({ label: u.displayName, value: u.username! }));

  return (
    <Combobox
      options={options}
      onSelect={(v) => (appState.pages.userAvatars.selectedUsername = v)}
      value={selectedUsername}
      placeholder="选择用户..."
      noCreate
    />
  );
}
