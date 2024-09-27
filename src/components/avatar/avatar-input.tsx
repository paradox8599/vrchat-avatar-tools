import { avatarMapState } from "@/state/avatars";
import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const AVATAR_URL_PREFIX = "https://vrchat.com/home/avatar/";

export default function AvatarInput() {
  const [addAvatarId, setAddAvatarId] = React.useState("");
  function onAvatarIdAdd() {
    if (
      !addAvatarId.startsWith("avtr_") &&
      !addAvatarId.startsWith(AVATAR_URL_PREFIX)
    ) {
      return;
    }
    const idToAdd = addAvatarId.replace(AVATAR_URL_PREFIX, "");

    if (!avatarMapState.get(idToAdd)) {
      avatarMapState.set(idToAdd, { id: idToAdd });
    }
    setAddAvatarId("");
  }

  return (
    <form className="w-full flex justify-between gap-2" action={onAvatarIdAdd}>
      <Input
        autoComplete="off"
        className="rounded-full text-xs"
        name="avatarId"
        value={addAvatarId}
        onChange={(e) => setAddAvatarId(e.target.value.trim())}
        placeholder="输入模型蓝图 ID ..."
      />

      <Button
        type="submit"
        className="w-full max-w-14 md:max-w-32 rounded-full"
      >
        添加
      </Button>
    </form>
  );
}
