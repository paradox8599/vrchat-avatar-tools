import React from "react";
import { Button } from "../ui/button";
import { avatarMapState } from "@/state/avatars";
import { dt } from "@/lib/utils";
import { Checkbox } from "../ui/checkbox";
import { exportFile } from "@/lib/system-file";
import { track, trackName } from "@/lib/aptabase";

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
  const [includeTags, setIncludeTags] = React.useState(false);

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

    track("avatar", {
      userExport: trackName(),
      exportSize: avatars.length,
      exportFileFormat: exportIdsOnly ? "txt" : "csv",
      exportDateFormat: dateFmt,
    });

    exportFile([HEADERS, ...avatars], "模型.csv", "text/csv");
  }

  return (
    <div className="w-full">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          if (exportIdsOnly) exportIds();
          else exportAvatars();
        }}
      >
        导出{exportIdsOnly ? "文件" : "CSV"}
      </Button>

      <div className="w-fit flex gap-8 py-2">
        <label className="flex-1 flex items-center justify-end gap-1 whitespace-nowrap">
          <Checkbox
            checked={exportIdsOnly}
            onCheckedChange={(v) => setExportIdsOnly(v.valueOf() as boolean)}
          />
          仅导出模型ID
        </label>

        <label className="flex-1 flex items-center justify-end gap-1 whitespace-nowrap">
          <Checkbox
            checked={exportIdsOnly ? includeTags : dateFmt === "ISO"}
            onCheckedChange={(v) => {
              const value = v.valueOf() as boolean;
              if (exportIdsOnly) {
                setIncludeTags(value);
              } else {
                setDateFormat(value ? "ISO" : "FRIENDLY");
              }
            }}
          />
          {exportIdsOnly ? "包括标签" : "使用ISO时间格式"}
        </label>
      </div>
    </div>
  );
}
