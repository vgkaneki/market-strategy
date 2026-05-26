import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const zipPath = path.join(root, "external", "lce-sdk", "market-strategy-lce-sdk-main.zip");
const sdkPath = process.env.LCE_SDK_PATH || path.join(root, "external", "lce-sdk", "market-strategy-lce-sdk-main");
const expectedSha = "d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf";

function sha256(file) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(file));
  return h.digest("hex");
}

if (!fs.existsSync(zipPath)) throw new Error(`Missing locked SDK ZIP: ${zipPath}`);
const actual = sha256(zipPath);
if (actual !== expectedSha) throw new Error(`SDK ZIP hash mismatch: ${actual}`);

if (!fs.existsSync(sdkPath)) {
  console.error(`SDK working copy is not installed: ${sdkPath}`);
  console.error("Run: node scripts/install-lce-sdk.mjs");
  process.exit(1);
}

execFileSync("npm", ["test"], { cwd: sdkPath, stdio: "inherit", shell: process.platform === "win32" });
console.log("LCE SDK hash verified and SDK tests passed.");
