import { promises as fs } from "node:fs";
import * as path from "node:path";

export interface VersionInfo {
  name: string;
  version: string;
  source: string;
}

export async function readVersion(startDir: string = __dirname): Promise<VersionInfo> {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, "package.json");
    try {
      const raw = await fs.readFile(candidate, "utf8");
      const pkg = JSON.parse(raw) as { name?: string; version?: string };
      if (pkg.name && pkg.version) {
        return { name: pkg.name, version: pkg.version, source: candidate };
      }
    } catch {
      // keep walking up
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return { name: "agentsmd", version: "unknown", source: "" };
}
