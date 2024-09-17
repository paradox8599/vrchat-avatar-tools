import React from "react";
import { Button } from "../ui/button";
import { avatarMapState } from "@/state/avatars";
import { cn, dt } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { exportFile } from "@/lib/file";

const HEADERS = [
  "\ufeff模型id",
  "标签",
  "状态获取时间",
  "上传者",
  "上传者id",
  "封面链接",
  "首次上传时间",
  "最后更新时间",
  "发布状态",
].join(",");

function exportIds() {
  const ids = [...avatarMapState.values()].map((a) => a.id);
  exportFile(ids, "模型id.txt", "text/plain");
}

export function AvatarExport() {
  const [exportIdsOnly, setExportIdsOnly] = React.useState(false);
  const [dateFmt, setDateFormat] = React.useState<"ISO" | "FRIENDLY">(
    "FRIENDLY",
  );

  function generateDateString(d?: string) {
    if (!d) return "";
    return dateFmt === "ISO" ? new Date(d).toISOString() : dt(new Date(d));
  }

  function exportAvatars() {
    const avatars: string[] = [...avatarMapState.values()].map((a) =>
      [
        a.id,
        a.tag ?? "",
        generateDateString(a.lastFetch),
        a.info?.authorName ?? "",
        a.info?.authorId ?? "",
        a.info?.thumbnailImageUrl ?? "",
        generateDateString(a.info?.created_at),
        generateDateString(a.info?.updated_at),
        a.info?.releaseStatus ?? "",
      ].join(","),
    );

    exportFile([HEADERS, ...avatars], "模型.csv", "text/csv");
  }

  return (
    <div className="flex flex-col items-stretch sm:flex-row sm:items-center w-full gap-4">
      <Button
        variant="outline"
        onClick={() => {
          if (exportIdsOnly) exportIds();
          else exportAvatars();
        }}
      >
        导出{exportIdsOnly ? "文件" : "CSV"}
      </Button>

      <div className="flex justify-around gap-4">
        <label className="flex items-center gap-1">
          仅导出模型ID
          <Checkbox
            checked={exportIdsOnly}
            onCheckedChange={(v) => setExportIdsOnly(v.valueOf() as boolean)}
          />
        </label>

        <label
          className={cn(
            "flex items-center gap-1",
            exportIdsOnly ? "text-muted-foreground" : "",
          )}
        >
          使用ISO时间格式
          <Checkbox
            disabled={exportIdsOnly}
            checked={dateFmt === "ISO"}
            onCheckedChange={(v) =>
              setDateFormat((v.valueOf() as boolean) ? "ISO" : "FRIENDLY")
            }
          />
        </label>
      </div>
    </div>
  );
}
