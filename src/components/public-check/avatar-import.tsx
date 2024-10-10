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
import { Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { toast } from "@/hooks/app/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { track, trackName } from "@/lib/aptabase";

const EXAMPLE_FILE = `
# 模型ID导入格式示例
# 空行和 # 后的文本将被忽略

# 格式 1: 每行一个模型ID

# 例:

avtr_b69eddca-db02-4be8-9c07-396d865f8c40
avtr_b69eddca-db02-4be8-9c07-396d865f8c41




# 格式 2: 每行一个模型ID和标签,用空格或半角逗号分隔
# 例:

avtr_b69eddca-db02-4be8-9c07-396d865f8c42  mamehinata    # 这个ID会获得标签 [mamehinata]
avtr_b69eddca-db02-4be8-9c07-396d865f8c43, mamehinata    # 这个ID会获得标签 [mamehinata]
avtr_b69eddca-db02-4be8-9c07-396d865f8c44，grus          # 这个ID会获得标签 [grus]
avtr_b69eddca-db02-4be8-9c07-396d865f8c45  selestia      # 这个ID会获得标签 [selestia]




# 格式 3: 第一行以非空白字符开头，将会被识别为标签
#         后面所有连续行的模型ID将会被分到该标签下，直到有非单独模型ID的一行为止
#         模型ID后面的标签优先级高于前面的标签

# 例: 以下ID都会获得标签 [cxk]

cxk
avtr_b69eddca-db02-4be8-9c07-396d865f8c46
avtr_b69eddca-db02-4be8-9c07-396d865f8c47
avtr_b69eddca-db02-4be8-9c07-396d865f8c48
avtr_b69eddca-db02-4be8-9c07-396d865f8c49 selestia      # 这个ID会获得标签 [selestia], 且 cxk 标签在此中止
avtr_b69eddca-db02-4be8-9c07-396d865f8c50               # 这个ID不会获得任何标签


# 以下ID都会获得标签 [ctrl]
ctrl
avtr_b69eddca-db02-4be8-9c07-396d865f8c51
avtr_b69eddca-db02-4be8-9c07-396d865f8c52
avtr_b69eddca-db02-4be8-9c07-396d865f8c53
`;

// match id and tag at a same line, tag can contain any character that are not # symbol, or newline character
const reIdTag =
  /(avtr_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})[ ,，]+([^#\n]+)/;
// match id only
export const reId =
  /.*(avtr_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}).*/;

type ImportId = { id: string; tag?: string };

function parseIds(text: string): ImportId[] {
  const ids: ImportId[] = [];

  // split, trim, and remove empty lines
  const lines = text.split("\n").map((line) => line.trim());

  let currentTag: string | undefined = void 0;

  for (const line of lines) {
    // ignore # comments
    if (line.startsWith("#")) {
      continue;
    }

    // ignore empty lines and reset current tag
    if (line.length === 0) {
      currentTag = void 0;
      continue;
    }

    // parse id
    // id with tag at a same line
    const idTagMatch = line.match(reIdTag);
    if (idTagMatch !== null) {
      const id = idTagMatch[1];
      const tag = idTagMatch[2].trim();
      ids.push({ id, tag });
      currentTag = void 0;
      continue;
    }
    // only id at a line
    const idMatch = line.match(reId);
    if (idMatch !== null) {
      const id = idMatch[1];
      ids.push({ id, tag: currentTag });
      continue;
    }

    // line contains a tag
    currentTag = line.split("#")[0].trim();
  }

  return ids;
}

export function AvatarImport() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [ids, setIds] = React.useState<ImportId[]>([]);
  const idsToAdd = ids.filter((v) => !avatarMapState.has(v.id));
  const idsExists = ids.filter((v) => avatarMapState.has(v.id));

  async function importIds() {
    const text = await selectFile({ accept: "text/plain" });
    const ids = parseIds(text);
    setIds(ids);
    setDialogOpen(true);
  }

  function close() {
    setDialogOpen(false);
    setIds([]);
  }

  function confirmImport() {
    for (const id of idsToAdd) avatarMapState.set(id.id, id);
    track("avatar", {
      userImport: trackName(),
      importSize: idsToAdd.length,
      importExists: idsExists.length,
    });
    close();
    toast({
      title: "导入成功",
      description: `导入了 ${idsToAdd.length} 个 ID`,
    });
  }

  return (
    <div className="w-full">
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && close()}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={importIds} className="w-full">
            导入模型ID
          </Button>
        </DialogTrigger>

        <DialogContent className="px-8 mx-2">
          <DialogHeader>
            <DialogTitle className="text-center">
              {`将导入 ${ids.length} 个 ID 中的 ${idsToAdd.length} 个 （${idsExists.length} 个已存在）`}
            </DialogTitle>
            <DialogDescription className="max-h-[60vh] text-mono">
              <ScrollArea className="h-full pr-4">
                {ids.map((id, i) => (
                  <span
                    key={id.id}
                    className={cn(
                      "whitespace-nowrap w-full py-2 flex items-center justify-between",
                      "border-b",
                      // i % 2 === 0 ? "" : "",
                      idsExists.find((x) => x.id === id.id)
                        ? "text-destructive line-through"
                        : "",
                    )}
                  >
                    <span className="flex flex-row items-center">
                      {/* index number */}
                      <span className="w-12 pr-1 text-end text-md font-bold">
                        {(i + 1).toString().padStart(2, " ")}.
                      </span>

                      <span className="flex flex-col items-start xs:flex-row xs:items-center justify-start gap-1">
                        {/* id */}
                        <div className="w-full flex items-center justify-center">
                          <Button
                            className={cn(
                              "rounded-full",
                              "font-mono font-bold text-xs",
                              "flex gap-2",
                            )}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              writeText(id.id).then(() =>
                                toast({
                                  title: "已复制模型ID",
                                  description: id.id,
                                }),
                              )
                            }
                          >
                            {id.id}
                            <Copy size={16} />
                          </Button>
                        </div>
                        {/* tag */}
                        {id.tag && (
                          <span>
                            <Badge
                              variant="outline"
                              className="text-xs w-fit ml-2"
                            >
                              {id.tag}
                            </Badge>
                          </span>
                        )}
                      </span>
                    </span>

                    {/* delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mx-4"
                      onClick={() =>
                        setIds((prev) => prev.filter((v) => v.id !== id.id))
                      }
                    >
                      <X size={18} />
                    </Button>
                  </span>
                ))}
              </ScrollArea>
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

      <div className="text-sm text-muted-foreground">
        导入使用 txt 文本文件，详情见示例：
        <Button
          variant={"link"}
          size={"sm"}
          onClick={() =>
            exportFile(
              EXAMPLE_FILE.split("\n"),
              "示例-模型ID导入格式.txt",
              "text/plain",
            )
          }
        >
          查看示例
        </Button>
      </div>
    </div>
  );
}
