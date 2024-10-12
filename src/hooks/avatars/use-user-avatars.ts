import React from "react";
import useSWRImmutable from "swr/immutable";
import { useAuth } from "../app/use-auth";

export function useUserAvatars(username?: string) {
  const { client } = useAuth(username);
  const swr = useSWRImmutable(
    username ? ["useUserAvatars", username] : null,
    () => client.getOwnAvatars(),
  );
  const avatars = React.useMemo(
    () =>
      (swr.data ?? [])
        // sort: latest updated first
        .sort(
          (b, a) =>
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
        ),
    [swr.data],
  );
  return {
    ...swr,
    avatars,
  };
}
