import { vrchatGetOwnAvatars } from "@/lib/api/avatar";
import React from "react";
import useSWRImmutable from "swr/immutable";

export function useUserAvatars(username?: string) {
  const swr = useSWRImmutable(
    username ? ["useUserAvatars", username] : null,
    () => vrchatGetOwnAvatars(username!),
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
