import fs from "fs";
import semver from "semver";

export function readPackage(root: string = "./") {
  const pkgJson = fs.readFileSync(`${root}package.json`, "utf-8");
  return JSON.parse(pkgJson);
}

export function readPackageVersion({ version }: { version: string }) {
  return semver.parse(version)!;
}

export function readTauriConf(root: string = "./") {
  const tauriJson = fs.readFileSync(`${root}src-tauri/tauri.conf.json`, "utf-8");
  return JSON.parse(tauriJson);
}

export function readTauriVersion({ version }: { version: string }) {
  return semver.parse(version)!;
}

export function readCargo(root: string = "./") {
  const cargoToml = fs.readFileSync(`${root}src-tauri/Cargo.toml`, "utf-8");
  return cargoToml;
}

export function readCargoVersion(cargo: string) {
  const cargoVerFileRe = /^\s*version\s*=\s*"(\d+\.\d+\.\d+)"/gm;
  const cargoVerRe = /^(\s*version\s*=\s*)"(\d+\.\d+\.\d+)"/;
  let cargoVerStr = cargo.match(cargoVerFileRe)![0].match(cargoVerRe)![2];
  return semver.parse(cargoVerStr)!;
}


export function updatePkgVersion(ver: semver.SemVer) {
  const pkg = readPackage();
  pkg["version"] = ver.raw;
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
}

export function updateTauriVersion(ver: semver.SemVer) {
  const tauriConf = readTauriConf();
  tauriConf["version"] = ver.raw;
  fs.writeFileSync(
    "src-tauri/tauri.conf.json",
    JSON.stringify(tauriConf, null, 2) + "\n",
  );
}

export function updateCargoVersion(ver: semver.SemVer) {
  const cargo = readCargo();
  const newCargoToml = cargo.replace(
    /^\s*version\s*=\s*"\d+\.\d+\.\d+"/m,
    `version = "${ver.raw}"`,
  );
  fs.writeFileSync("src-tauri/Cargo.toml", newCargoToml);
}

export function parseVersion(ver: string) {
  if (!semver.valid(ver)) {
    console.log("invalid version:", ver);
    process.exit(1);
  }
  return semver.parse(ver)!;
}



export function readCurrentVersion(root: string = "./") {
  const pkg = readPackage(root);
  const pkgVer = readPackageVersion(pkg)
  const tauriConf = readTauriConf(root);
  const tauriVer = readTauriVersion(tauriConf);
  const cargo = readCargo(root);
  const cargoVer = readCargoVersion(cargo);

  if ([...new Set([tauriVer.raw, pkgVer.raw, cargoVer.raw])].length !== 1) {
    console.log("version mismatch");
    console.log(
      `package.json: ${pkgVer}\n`,
      `src-tauri/Cargo.toml: ${cargoVer}`,
      `src-tauri/tauri.conf.json: ${tauriVer}\n`,
    );
    process.exit(1);
  }

  return pkgVer;
}
