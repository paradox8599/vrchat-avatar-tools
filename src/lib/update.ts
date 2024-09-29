import { check } from "@tauri-apps/plugin-updater";
import { getVersion } from "@tauri-apps/api/app";
import { appState } from "@/state/app";

export async function getAppVersion() {
  appState.version = "v" + (await getVersion());
}

export async function checkUpdate() {
  try {
    await getAppVersion();
    const update = await check();
    appState.updated = !update;
    if (!update) return;
  } catch (e) {
    console.log(e);
  }
}
