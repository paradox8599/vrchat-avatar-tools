import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { toast } from "@/hooks/use-toast";

export async function checkAndUpdate({
  silent = false,
  // autoInstall = true,
}: {
  silent?: boolean;
  // autoInstall?: boolean;
}) {
  try {
    !silent && toast({ title: "检查更新..." });
    const update = await check();
    if (!update) {
      !silent && toast({ title: "无更新" });
      return;
    }

    console.log(
      `found update ${update.version} from ${update.date} with notes ${update.body}`,
    );

    let downloaded = 0;
    let contentLength = 0;

    await update.download((event) => {
      switch (event.event) {
        case "Started":
          contentLength = event.data.contentLength ?? 0;
          !silent &&
            toast({
              title: "下载中...",
              description: `共 ${contentLength / 1024 / 1024} MB`,
            });
          break;
        case "Progress":
          downloaded += event.data.chunkLength;
          console.log(downloaded);
          break;
        // case "Finished":
        //   toast({ title: "下载完成" });
        //   break;
      }
    });
    !silent && toast({ title: "更新已下载，开始安装" });
    await update.install();
    !silent && toast({ title: "更新已安装，重启 App 以应用" });
    await relaunch();
  } catch (e) {
    toast({ title: "App 更新失败", description: String(e) });
  }
}
