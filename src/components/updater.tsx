"use client";
import React from "react";
import useSWR from "swr";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useRouter } from "next/navigation";
import { Progress } from "./ui/progress";

export function Updater() {
  const router = useRouter();
  const [size, setSize] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [text, setText] = React.useState("");

  useSWR(
    "updater",
    async () => {
      const update = await check();
      if (!update) return router.replace("/public-check");

      let innerProgress = 0;
      let len = 0;
      await update.download(async (event) => {
        switch (event.event) {
          case "Started":
            len = event.data.contentLength ?? 0;
            setSize(len);
            setText(`下载中...`);
            break;
          case "Progress":
            innerProgress += event.data.chunkLength;
            setProgress(innerProgress);
            break;
          case "Finished":
            setProgress(len);
            break;
        }
      });
      setSize(0);
      setText("下载完成，正在安装更新...");
      await update.install();
      setText("安装完成，重启中...");
      await relaunch();
    },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-4">{text}</div>
      <div className="h-10 w-64 text-center">
        {size > 0 && (
          <>
            <Progress value={(progress / size) * 100} className="w-64" />
            <div className="mt-2">
              {(progress / 1000 / 1000).toFixed(2)} MB /{" "}
              {(size / 1000 / 1000).toFixed(2)} MB
            </div>
          </>
        )}
      </div>
    </div>
  );
}
