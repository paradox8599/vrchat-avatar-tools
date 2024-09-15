import React from "react";
import { Button } from "../ui/button";
import { avatarMapState } from "@/state/avatars";
import { dt } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";

export function AvatarExport() {
  const [exportIdsOnly, setExportIdsOnly] = React.useState(false);
  const [dateFormat, setDateFormat] = React.useState<"ISO" | "FRIENDLY">(
    "FRIENDLY",
  );

  function exportFile(
    lines: string[],
    filename: string,
    type: "text/plain" | "text/csv",
  ) {
    const blob = new Blob([lines.join("\n")], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  }

  function exportIds() {
    const ids = [...avatarMapState.values()].map((a) => a.id);
    exportFile(ids, "模型id.txt", "text/plain");
  }

  function exportAvatars() {
    const headers = [
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

    function generateDateString(ds?: string) {
      if (!ds) return "";
      if (dateFormat === "ISO") {
        return new Date(ds).toISOString();
      } else {
        return dt(new Date(ds));
      }
    }

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

    exportFile([headers, ...avatars], "模型.csv", "text/csv");
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            if (exportIdsOnly) exportIds();
            else exportAvatars();
          }}
        >
          导出{exportIdsOnly ? "文件" : "CSV"}
        </Button>
        <div className="flex gap-4">
          <label className="flex items-center gap-1">
            仅导出ID
            <Checkbox
              checked={exportIdsOnly}
              onCheckedChange={(v) => setExportIdsOnly(v.valueOf() as boolean)}
            />
          </label>

          {!exportIdsOnly && (
            <label className="flex items-center gap-1">
              使用ISO时间格式
              <Checkbox
                checked={dateFormat === "ISO"}
                onCheckedChange={(v) =>
                  setDateFormat((v.valueOf() as boolean) ? "ISO" : "FRIENDLY")
                }
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
