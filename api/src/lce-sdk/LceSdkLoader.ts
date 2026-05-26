import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getLceSdkPath, hasInstalledLceSdk } from "./LceSdkPaths.js";

export interface LoadedLceSdk {
  root: string;
  manifest: any;
  core: any;
  adapters: any;
  engines: any;
  marketDecision: any;
  replay: any;
  validation: any;
}

export class LceSdkLoader {
  private cached?: LoadedLceSdk;

  status() {
    const root = getLceSdkPath();
    const manifestPath = path.join(root, "PROJECT_MANIFEST.json");
    const packagePath = path.join(root, "package.json");

    return {
      installed: hasInstalledLceSdk(),
      root,
      hasManifest: fs.existsSync(manifestPath),
      hasPackage: fs.existsSync(packagePath),
      installCommand: "node scripts/install-lce-sdk.mjs",
      verifyCommand: "node scripts/verify-lce-sdk.mjs",
      marketDataOnly: true,
      noOrderExecution: true
    };
  }

  async load(): Promise<LoadedLceSdk> {
    if (this.cached) return this.cached;

    const root = getLceSdkPath();
    if (!hasInstalledLceSdk()) {
      throw new Error(`LCE SDK is not installed at ${root}. Run: node scripts/install-lce-sdk.mjs`);
    }

    const manifestPath = path.join(root, "PROJECT_MANIFEST.json");
    const manifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
      : null;

    const loadModule = async (relativePath: string) => import(pathToFileURL(path.join(root, relativePath)).href);

    this.cached = {
      root,
      manifest,
      core: await loadModule("packages/lce-core/src/index.mjs"),
      adapters: await loadModule("packages/lce-adapters/src/index.mjs"),
      engines: await loadModule("packages/lce-engines/src/index.mjs"),
      marketDecision: await loadModule("packages/lce-market-decision/src/index.mjs"),
      replay: await loadModule("packages/lce-replay/src/index.mjs"),
      validation: await loadModule("packages/lce-validation/src/index.mjs")
    };

    return this.cached;
  }
}
