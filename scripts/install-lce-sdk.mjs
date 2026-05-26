import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const zipPath = path.join(root, "external", "lce-sdk", "market-strategy-lce-sdk-main.zip");
const expectedSha = "d25ac66018311f7cf047bdce376bc88a070a0a761f3b1e25733bf8ddc13e6baf";
const targetDir = path.join(root, "external", "lce-sdk", "market-strategy-lce-sdk-main");

function sha256(file) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(file));
  return h.digest("hex");
}

if (!fs.existsSync(zipPath)) {
  console.error(`Missing locked SDK ZIP: ${zipPath}`);
  process.exit(1);
}

const actual = sha256(zipPath);
if (actual !== expectedSha) {
  console.error("SDK ZIP hash mismatch.");
  console.error(`Expected: ${expectedSha}`);
  console.error(`Actual:   ${actual}`);
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.mkdirSync(path.dirname(targetDir), { recursive: true });

const extractRoot = path.join(root, "external", "lce-sdk", ".extract-tmp");
fs.rmSync(extractRoot, { recursive: true, force: true });
fs.mkdirSync(extractRoot, { recursive: true });

try {
  execFileSync("node", [
    "-e",
    `
      const fs = require('fs');
      const path = require('path');
      const cp = require('child_process');
      const zip = process.argv[1];
      const out = process.argv[2];

      // Prefer PowerShell Expand-Archive on Windows, unzip elsewhere.
      if (process.platform === 'win32') {
        cp.execFileSync('powershell', ['-NoProfile', '-Command', 'Expand-Archive -Force -LiteralPath ' + JSON.stringify(zip) + ' -DestinationPath ' + JSON.stringify(out)], {stdio:'inherit'});
      } else {
        cp.execFileSync('unzip', ['-q', zip, '-d', out], {stdio:'inherit'});
      }
    `,
    zipPath,
    extractRoot
  ], { stdio: "inherit" });

  const nested = path.join(extractRoot, "market-strategy-lce-sdk-main");
  if (!fs.existsSync(nested)) throw new Error("Extracted SDK folder not found");
  fs.renameSync(nested, targetDir);

  console.log("LCE SDK installed without modifying locked ZIP.");
  console.log(`Installed path: ${targetDir}`);
} finally {
  fs.rmSync(extractRoot, { recursive: true, force: true });
}
