import { avatarMapState } from "@/state/avatars";
import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function AvatarInput() {

  const [addAvatarId, setAddAvatarId] = React.useState("");
  function onAvatarIdAdd() {
    {
      if (
        !addAvatarId.startsWith("avtr_") &&
        !addAvatarId.startsWith("https://vrchat.com/home/avatar/")
      ) {
        return;
      }
      const idToAdd = addAvatarId.replace(
        "https://vrchat.com/home/avatar/",
        "",
      );

      if (!avatarMapState.get(idToAdd)) {
        avatarMapState.set(idToAdd, { id: idToAdd });
      }
      setAddAvatarId("");
    }
  }

  return <form
    className="w-full flex justify-between gap-2"
    action={onAvatarIdAdd}
  >
    <Input
      name="avatarId"
      value={addAvatarId}
      onChange={(e) => setAddAvatarId(e.target.value.trim())}
      placeholder="输入模型蓝图 ID ..."
    />

    <Button type="submit" className="w-full max-w-14 md:max-w-32">
      添加
    </Button>
  </form>
}
