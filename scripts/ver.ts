import fs from "fs";
import semver from "semver";

if (Bun.argv.length > 3) {
  console.log("too many arguments");
  process.exit(1);
}

const cargoVerFileRe = /^\s*version\s*=\s*"(\d+\.\d+\.\d+)"/gm;
const cargoVerRe = /^(\s*version\s*=\s*)"(\d+\.\d+\.\d+)"/;

const pkgJson = fs.readFileSync("package.json", "utf-8");
const tauriJson = fs.readFileSync("src-tauri/tauri.conf.json", "utf-8");
const cargoToml = fs.readFileSync("src-tauri/Cargo.toml", "utf-8");

const pkg = JSON.parse(pkgJson);
const tauri = JSON.parse(tauriJson);

const pkgVer = semver.parse(pkg["version"])!;
const tauriVer = semver.parse(tauri["version"])!;
let cargoVerStr = cargoToml.match(cargoVerFileRe)![0].match(cargoVerRe)![2];
const cargoVer = semver.parse(cargoVerStr)!;

if ([...new Set([tauriVer.raw, pkgVer.raw, cargoVer.raw])].length !== 1) {
  console.log("version mismatch");
  console.log(
    `package.json: ${pkgVer}\n`,
    `src-tauri/Cargo.toml: ${cargoVer}`,
    `src-tauri/tauri.conf.json: ${tauriVer}\n`,
  );
  process.exit(1);
}

const currentVersion = pkgVer;

console.log("Current version:", currentVersion.raw);

if (Bun.argv.length === 2) process.exit(0);

const newVersionString = Bun.argv[2];
if (!semver.valid(newVersionString)) {
  console.log("invalid input version:", newVersionString);
  process.exit(1);
}

const newVersion = semver.parse(newVersionString);

const result = confirm(
  `Update app version from ${currentVersion} to ${newVersion}?`,
);

if (!result) process.exit(0);

pkg["version"] = newVersionString;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

const newCargoToml = cargoToml.replace(
  /^\s*version\s*=\s*"\d+\.\d+\.\d+"/m,
  `version = "${newVersionString}"`,
);
fs.writeFileSync("src-tauri/Cargo.toml", newCargoToml);

tauri["version"] = newVersionString;
fs.writeFileSync(
  "src-tauri/tauri.conf.json",
  JSON.stringify(tauri, null, 2) + "\n",
);

// recheck
function recheck() {
  const cargoVerFileRe = /^\s*version\s*=\s*"(\d+\.\d+\.\d+)"/gm;
  const cargoVerRe = /^(\s*version\s*=\s*)"(\d+\.\d+\.\d+)"/;

  const pkgJson = fs.readFileSync("package.json", "utf-8");
  const tauriJson = fs.readFileSync("src-tauri/tauri.conf.json", "utf-8");
  const cargoToml = fs.readFileSync("src-tauri/Cargo.toml", "utf-8");

  const pkg = JSON.parse(pkgJson);
  const tauri = JSON.parse(tauriJson);

  const pkgVer = semver.parse(pkg["version"])!;
  const tauriVer = semver.parse(tauri["version"])!;
  let cargoVerStr = cargoToml.match(cargoVerFileRe)![0].match(cargoVerRe)![2];
  const cargoVer = semver.parse(cargoVerStr)!;

  if ([...new Set([tauriVer.raw, pkgVer.raw, cargoVer.raw])].length !== 1) {
    console.log("version mismatch");
    console.log(
      `package.json: ${pkgVer}\n`,
      `src-tauri/Cargo.toml: ${cargoVer}`,
      `src-tauri/tauri.conf.json: ${tauriVer}\n`,
    );
    process.exit(1);
  }
}

recheck();

console.log("Updated app version to", newVersionString);
