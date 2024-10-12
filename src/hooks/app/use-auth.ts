import { me } from "@/state/auth";
import { useSnapshot } from "valtio";
import { VRChatClient } from "@/lib/api/_base";

export function useAuth(username?: string) {
  const { username: myName } = useSnapshot(me);
  username ??= myName;
  const client = VRChatClient.new(username);

  const auth = useSnapshot(client.auth);

  return {
    auth,
    client,
    authMut: client.auth,
    loggedIn: client.loggedIn,
  };
}
