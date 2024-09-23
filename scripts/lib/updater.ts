import { getLatestReleaseFile } from "./files";

export function generateUpdateInfo() {
  const url = "https://vrchat-avatar-tools.paradox8599.io";
  const { sig, version, file } = getLatestReleaseFile();

  const updater = {
    version: version.raw,
    notes: "",
    pub_date: new Date().toISOString(),
    platforms: {
      "windows-x86_64": {
        signature: sig,
        url: new URL(`/release/${file}`, url).href,
      },
    },
  };
  return updater;
}
