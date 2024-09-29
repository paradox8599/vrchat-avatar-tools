import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { getVersion } from "@tauri-apps/api/app";
import { appState } from "@/state/app";

export async function checkAndUpdate() {
  try {
    appState.version = await getVersion();
    const update = await check();
    if (!update) return;
    await update.downloadAndInstall();
    await relaunch();
  } catch (e) {
    alert({ title: "App 更新失败", description: String(e) });
  }
}
