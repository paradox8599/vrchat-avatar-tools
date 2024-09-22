import fs from "fs";
import path from "path";
import semver from "semver";
import { getRoot } from "./path";

type FileInfo = {
  file: string;
  full: string;
  sig: string;
  version: semver.SemVer;
};

export const releaseDir = path.resolve(
  getRoot(),
  "src-tauri/target/release/bundle/nsis/",
);

export function parseFileName(file: string) {
  const [_name, version] = file.split("_");
  return { file, version: semver.parse(version) } as FileInfo;
}

export function getReleaseFiles() {
  return fs
    .readdirSync(releaseDir)
    .map(parseFileName)
    .filter(({ version }) => version)
    .sort((a, b) => a.version.compare(b.version))
    .toReversed() as FileInfo[];
}

export function getLatestReleaseFile() {
  const files = getReleaseFiles();
  if (files.length === 0) {
    console.log("no release files found");
    process.exit(1);
  }
  const fn = files[0].file.replace(".sig", "");
  const latest = files.filter((f) => f.file.startsWith(fn));
  const sig = latest.find((f) => f.file.endsWith(".sig"))!;
  const exe = latest.find((f) => f.file.endsWith(".exe"))!;
  const sigText = fs.readFileSync(path.resolve(releaseDir, sig.file), "utf-8");
  return {
    file: exe.file,
    full: path.resolve(releaseDir, exe.file),
    sig: sigText,
    version: latest[0].version,
  } as FileInfo;
}
