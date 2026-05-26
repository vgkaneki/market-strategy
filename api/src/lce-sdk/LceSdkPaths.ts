import path from "node:path";
import fs from "node:fs";

export function getProjectRoot() {
  // services/api -> project root
  return path.resolve(process.cwd(), "../..");
}

export function getDefaultLceSdkPath() {
  return path.resolve(getProjectRoot(), "external", "lce-sdk", "market-strategy-lce-sdk-main");
}

export function getLceSdkPath() {
  return process.env.LCE_SDK_PATH
    ? path.resolve(process.env.LCE_SDK_PATH)
    : getDefaultLceSdkPath();
}

export function hasInstalledLceSdk() {
  return fs.existsSync(path.join(getLceSdkPath(), "package.json"));
}
