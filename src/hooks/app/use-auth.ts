import { getAuth, me as _me } from "@/state/auth";
import { LoginStatus } from "@/types";
import { useSnapshot } from "valtio";

export default function useAuth(username?: string) {
  const { username: _username } = useSnapshot(_me);
  const authMut = getAuth(username ?? _username);
  const auth = useSnapshot(authMut);
  const loggedIn = auth.status === LoginStatus.Success;

  return {
    auth,
    authMut,
    loggedIn,
  };
}
