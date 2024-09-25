import { getRoot } from "./lib/path";
import {
  readCurrentVersion,
  updateCargoVersion,
  updatePkgVersion,
  updateTauriVersion,
} from "./lib/version";
import semver from "semver";

async function main() {
  if (Bun.argv.length > 3) {
    console.log("too many arguments");
    process.exit(1);
  }

  const ver = readCurrentVersion(`${getRoot()}/`);

  if (Bun.argv.length === 2) {
    console.log(ver.raw);
    process.exit(0);
  }

  const cmd = Bun.argv[2].trim();
  const newVer = semver.parse(ver.raw)!;
  if (semver.valid(cmd)) {
    Object.assign(newVer, semver.parse(cmd)!);
  } else {
    if (
      [
        "major",
        "minor",
        "patch",
        "premajor",
        "preminor",
        "prepatch",
        "prerelease",
      ].includes(cmd)
    ) {
      newVer.inc(cmd as semver.ReleaseType);
    } else {
      const msg = [
        "Available Inc Commands:",
        "major, minor, patch, premajor, preminor, prepatch, prerelease",
      ].join(" ");
      console.log(msg);
      return;
    }
  }

  updatePkgVersion(newVer);
  updateTauriVersion(newVer);
  updateCargoVersion(newVer);

  const updatedVer = readCurrentVersion();

  console.log(`${ver.raw} -> ${updatedVer.raw}`);
}

main();
