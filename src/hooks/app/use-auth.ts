import { me } from "@/state/auth";
import { useSnapshot } from "valtio";
import { VRChatClient } from "@/lib/api/_base";
import { LoginStatus } from "@/types";

export function useAuth(username?: string) {
  const { username: myName } = useSnapshot(me);
  username ??= myName;
  const client = VRChatClient.new(username);

  const auth = useSnapshot(client.auth);

  return {
    client,
    authMut: client.auth,

    // reactive
    auth,
    loggedIn: auth.status === LoginStatus.Success,
  };
}
