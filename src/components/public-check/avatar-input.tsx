import { avatarMapState } from "@/state/avatars";
import React from "react";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "../ui/dialog";
import { AvatarImport, reId } from "./avatar-import";
import { AvatarExport } from "./avatar-export";
import SplitButton from "../split-button";

export default function AvatarInput() {
  const [avatarIdInput, setAvatarIdInput] = React.useState("");
  const [exportOpen, setExportOpen] = React.useState(false);

  function onAvatarIdAdd() {
    const idMatch = avatarIdInput.match(reId);
    if (idMatch === null) return;
    const id = idMatch[1];
    if (!avatarMapState.get(id)) {
      avatarMapState.set(id, { id: id });
      // track("avatar", { add: id, userAdd: trackName() });
    }
    setAvatarIdInput("");
  }

  return (
    <form className="w-full flex justify-between gap-2" action={onAvatarIdAdd}>
      <Input
        autoComplete="off"
        className="rounded-full text-xs"
        name="avatarId"
        value={avatarIdInput}
        onChange={(e) => setAvatarIdInput(e.target.value.trim())}
        placeholder="输入模型蓝图 ID ..."
      />

      <SplitButton
        type="submit"
        onClick={onAvatarIdAdd}
        dropdownItems={[
          { label: "批量导入/导出", onClick: () => setExportOpen(true) },
        ]}
      >
        添加
      </SplitButton>

      <Dialog open={exportOpen} onOpenChange={(open) => setExportOpen(open)}>
        <DialogContent>
          <DialogTitle>模型 ID 批量导入/导出</DialogTitle>
          <DialogDescription>
            <AvatarImport />
            <AvatarExport />
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </form>
  );
}
