import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { detectConfigs } from "../src/detect.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-"));
}

test("detects nothing in empty dir", async () => {
  const dir = await mkTmp();
  const found = await detectConfigs(dir);
  assert.equal(found.length, 0);
});

test("detects AGENTS.md and CLAUDE.md", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), "# agents");
  await fs.writeFile(path.join(dir, "CLAUDE.md"), "# claude");
  const found = await detectConfigs(dir);
  const kinds = found.map((f) => f.kind).sort();
  assert.deepEqual(kinds, ["agents-md", "claude-md"]);
});

test("detects nested copilot-instructions", async () => {
  const dir = await mkTmp();
  await fs.mkdir(path.join(dir, ".github"), { recursive: true });
  await fs.writeFile(path.join(dir, ".github/copilot-instructions.md"), "x");
  const found = await detectConfigs(dir);
  assert.equal(found.length, 1);
  assert.equal(found[0].kind, "copilot-instructions");
});
