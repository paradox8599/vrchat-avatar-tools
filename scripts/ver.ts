import { getRoot } from "./lib/path";
import {
  parseVersion,
  readCurrentVersion,
  updateCargoVersion,
  updatePkgVersion,
  updateTauriVersion,
} from "./lib/version";

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

  const newVer = parseVersion(Bun.argv[2]);

  updatePkgVersion(newVer);
  updateTauriVersion(newVer);
  updateCargoVersion(newVer);

  const updatedVer = readCurrentVersion();

  console.log(`Updated app version from ${ver.raw} to ${updatedVer.raw}`);
}
main();
