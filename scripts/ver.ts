import {
  parseVersion,
  readCurrentVersion,
  updateCargoVersion,
  updatePkgVersion,
  updateTauriVersion,
} from "./lib/version";

if (Bun.argv.length > 3) {
  console.log("too many arguments");
  process.exit(1);
}

const ver = readCurrentVersion();

if (Bun.argv.length === 2) process.exit(0);

const newVer = parseVersion(Bun.argv[2]);

updatePkgVersion(newVer);
updateTauriVersion(newVer);
updateCargoVersion(newVer);

const updatedVer = readCurrentVersion();

console.log(`Updated app version from ${ver.raw} to ${updatedVer.raw}`);
