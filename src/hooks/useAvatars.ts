import { appState } from "@/state/app";
import { avatarMapState } from "@/state/avatars";
import React from "react";
import { useSnapshot } from "valtio";

export default function useAvatars() {
  const avatarMap = useSnapshot(avatarMapState);
  const avatars = Array.from(avatarMapState.values());
  const { filter } = useSnapshot(appState);

  const sortedAvatars = React.useMemo(
    () =>
      avatars
        .sort((a, b) => {
          // if a has releaseStatus, make a higher priority
          if (a.info?.releaseStatus) return -1;
          // if b has releaseStatus, make b higher priority
          else if (b.info?.releaseStatus) return 1;
          // if both a and b have no releaseStatus, sort by lastFetch and earlier lastFetch first
          return (
            new Date(a.lastFetch ?? 0).getTime() -
            new Date(b.lastFetch ?? 0).getTime()
          );
        })
        .filter((a) => (filter ? a.tag === filter : true)),
    [avatars, filter],
  );

  const tags = React.useMemo(
    () =>
      Array.from(new Set(avatars.map((a) => a.tag))).filter(
        (t) => t && t.length > 0,
      ) as string[],
    [avatars],
  );

  return { avatarMap, avatars, sortedAvatars, tags };
}
