import { exportFile, selectFile } from "@/lib/file";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import React from "react";
import { avatarMapState } from "@/state/avatars";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import _ from "lodash";

const EXAMPLE = [
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c39",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c40",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c41",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c42",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c43",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c44",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c45",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c46",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c47",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c48",
  "avtr_b69eddca-db02-4be8-9c07-396d865f8c49",
];

export function AvatarImport() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [ids, setIds] = React.useState<string[]>([]);

  const filteredIds = _.difference(ids, [...avatarMapState.keys()]);

  async function importIds() {
    const text = await selectFile({ accept: "text/plain" });
    const lines = text
      .trim()
      .split("\n")
      .filter((l) => l.trim().length > 0);
    const uniqueLines = [...new Set(lines)];
    setIds(uniqueLines);
    setDialogOpen(true);
  }

  function close() {
    setDialogOpen(false);
    setIds([]);
  }

  function confirmImport() {
    for (const id of filteredIds) avatarMapState.set(id, { id });
    close();
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={importIds}>
              导入模型ID
            </Button>
          </DialogTrigger>

          <DialogContent className="w-fit px-8 mx-2">
            <DialogHeader>
              <DialogTitle>
                {`将导入 ${ids.length} 个 ID 中的 ${filteredIds.length} 个 （${ids.length - filteredIds.length} 个已存在）`}
              </DialogTitle>
              <DialogDescription className="max-h-[60vh] w-fit overflow-y-scroll [scrollbar-width:thin] text-mono">
                {ids.map((id, i) => (
                  <span
                    key={id}
                    className={cn(
                      "whitespace-nowrap w-fit flex items-center justify-between py-1",
                      "border-b",
                      // i % 2 === 0 ? "" : "",
                      filteredIds.includes(id)
                        ? ""
                        : "text-destructive line-through",
                    )}
                  >
                    <span className="w-12 pr-1 text-end">
                      {(i + 1).toString().padStart(2, " ")}.
                    </span>

                    {id}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="mx-4"
                      onClick={() => setIds(ids.filter((i) => i !== id))}
                    >
                      <X size={18} />
                    </Button>
                  </span>
                ))}
              </DialogDescription>
            </DialogHeader>

            {/* Import Dialog Actions */}
            <DialogFooter className="flex flex-row justify-end gap-4">
              <DialogClose asChild>
                <Button variant={"outline"}>取消</Button>
              </DialogClose>

              <Button onClick={confirmImport} className="w-24">
                导入
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-sm text-muted-foreground">
          支持 txt 文本文件，每行仅一个模型ID
          <Button
            variant={"link"}
            size={"sm"}
            onClick={() =>
              exportFile(EXAMPLE, "示例-模型ID导入格式.txt", "text/plain")
            }
          >
            查看示例
          </Button>
        </p>
      </div>
    </>
  );
}
