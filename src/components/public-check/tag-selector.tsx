"use client";
import React from "react";
import { avatarMapState } from "@/state/avatars";
import { Avatar } from "@/types";
import useAvatars from "@/hooks/use-avatars";
import { useSnapshot } from "valtio";
import { appState } from "@/state/app";
import { track } from "@/lib/aptabase";
import { Combobox } from "../ui/combobox";

export function AvatarTagSelector({ avatar }: { avatar: Avatar }) {
  const { tags } = useAvatars();
  const mutAvatar = avatarMapState.get(avatar.id)!;
  function setTag(tag: string) {
    const exists = mutAvatar.tag === tag;
    mutAvatar.tag = exists ? undefined : tag;
    if (!exists) track("tag", { set: tag });
  }
  return <Combobox onSelect={setTag} value={mutAvatar?.tag} options={tags} />;
}

export function TagFilter() {
  const { tags } = useAvatars();
  const { publicCheckTagFilter: filter } = useSnapshot(appState);
  function setTag(tag: string) {
    const filtering = filter === tag;
    appState.publicCheckTagFilter = filtering ? undefined : tag;
    if (!filtering) track("tag", { filter: tag });
  }

  return (
    <Combobox
      onSelect={setTag}
      value={filter}
      placeholder="标签过滤"
      options={tags}
      noCreate
    />
  );
}
