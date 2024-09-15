import { avatarMapState } from "@/state/avatars";
import React from "react";
import { useSnapshot } from "valtio";

export default function useAvatars() {
  const avatarMap = useSnapshot(avatarMapState);
  const avatars = Array.from(avatarMapState.values());
  const sortedAvatars = React.useMemo(
    () =>
      avatars.sort((a, b) => {
        if (a.info?.releaseStatus) {
          return -1;
        } else if (b.info?.releaseStatus) {
          return 1;
        }
        return (
          new Date(a.lastFetch ?? 0).getTime() -
          new Date(b.lastFetch ?? 0).getTime()
        );
      }),
    [avatars],
  );
  const tags = React.useMemo(
    () =>
      Array.from(new Set(avatars.map((a) => a.tag))).filter(
        (t) => t && t.length > 0,
      ),
    [avatars],
  );
  return { avatarMap, avatars, sortedAvatars, tags };
}
