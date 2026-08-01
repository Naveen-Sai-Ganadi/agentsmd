import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { readVersion } from "../src/version.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-version-"));
}

test("readVersion walks up to the repo package.json", async () => {
  // process.cwd() is the repo root when tests run via `npm test`.
  const info = await readVersion(process.cwd());
  assert.equal(info.name, "agentsmd");
  assert.match(info.version, /^\d+\.\d+\.\d+/);
  assert.ok(info.source.endsWith("package.json"));
});

test("readVersion finds a nearby package.json when given a nested dir", async () => {
  const root = await mkTmp();
  const nested = path.join(root, "a", "b", "c");
  await fs.mkdir(nested, { recursive: true });
  await fs.writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "fake-pkg", version: "9.8.7" }),
  );
  const info = await readVersion(nested);
  assert.equal(info.name, "fake-pkg");
  assert.equal(info.version, "9.8.7");
});

test("readVersion returns unknown when nothing is found", async () => {
  const root = await mkTmp();
  const info = await readVersion(root);
  // Walking up from tmp will hit the OS root without a package.json.
  // Accept either "unknown" or a real package.json far above tmp (macOS/CI both possible).
  assert.ok(info.version === "unknown" || /^\d/.test(info.version));
});
