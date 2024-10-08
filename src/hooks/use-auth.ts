import { getAuth, me } from "@/state/auth";
import { LoginStatus } from "@/types";
import React from "react";
import { useSnapshot } from "valtio";

export default function useAuth(username?: string) {
  const meState = useSnapshot(me);
  const _auth = React.useMemo(
    () => getAuth(username ?? me.username),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [username, meState],
  );
  const auth = useSnapshot(_auth);
  const loggedIn = auth.status === LoginStatus.Success;

  return {
    me: meState,
    auth,
    authMut: _auth,
    loggedIn,
  };
}
