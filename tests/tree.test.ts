import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import {
  discoverNested,
  nearestConfig,
  buildTreeSummary,
  renderTree,
} from "../src/tree.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-tree-"));
}

test("discoverNested returns empty for empty dir", async () => {
  const dir = await mkTmp();
  const found = await discoverNested(dir);
  assert.equal(found.length, 0);
});

test("discoverNested finds root + nested AGENTS.md across packages", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), "# root");
  await fs.mkdir(path.join(dir, "packages/api"), { recursive: true });
  await fs.mkdir(path.join(dir, "packages/web"), { recursive: true });
  await fs.writeFile(path.join(dir, "packages/api/AGENTS.md"), "# api");
  await fs.writeFile(path.join(dir, "packages/web/CLAUDE.md"), "# web claude");
  const found = await discoverNested(dir);
  const rels = found.map((c) => c.relPath).sort();
  assert.deepEqual(rels, [
    "AGENTS.md",
    path.join("packages/api", "AGENTS.md"),
    path.join("packages/web", "CLAUDE.md"),
  ].sort());
  const summary = await buildTreeSummary(dir);
  assert.equal(summary.totalAgentsMd, 2);
  assert.equal(summary.totalClaudeMd, 1);
  assert.equal(summary.maxDepth, 2);
});

test("discoverNested skips node_modules, dist, and dot-directories", async () => {
  const dir = await mkTmp();
  await fs.mkdir(path.join(dir, "node_modules/foo"), { recursive: true });
  await fs.writeFile(path.join(dir, "node_modules/foo/AGENTS.md"), "nope");
  await fs.mkdir(path.join(dir, "dist"), { recursive: true });
  await fs.writeFile(path.join(dir, "dist/AGENTS.md"), "nope");
  await fs.mkdir(path.join(dir, ".hidden"), { recursive: true });
  await fs.writeFile(path.join(dir, ".hidden/AGENTS.md"), "nope");
  await fs.writeFile(path.join(dir, "AGENTS.md"), "# root");
  const found = await discoverNested(dir);
  assert.equal(found.length, 1);
  assert.equal(found[0].relPath, "AGENTS.md");
});

test("nearestConfig returns the closest ancestor AGENTS.md", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), "# root");
  await fs.mkdir(path.join(dir, "packages/api/src"), { recursive: true });
  await fs.writeFile(path.join(dir, "packages/api/AGENTS.md"), "# api");
  const configs = await discoverNested(dir);
  const nearApi = nearestConfig(configs, path.join(dir, "packages/api/src/index.ts"));
  assert.ok(nearApi);
  assert.equal(nearApi!.relPath, path.join("packages/api", "AGENTS.md"));
  const nearRoot = nearestConfig(configs, path.join(dir, "README.md"));
  assert.ok(nearRoot);
  assert.equal(nearRoot!.relPath, "AGENTS.md");
});

test("nearestConfig returns undefined outside root when no ancestor", async () => {
  const dir = await mkTmp();
  await fs.mkdir(path.join(dir, "packages/api"), { recursive: true });
  await fs.writeFile(path.join(dir, "packages/api/AGENTS.md"), "# api");
  const configs = await discoverNested(dir);
  const outside = nearestConfig(configs, path.join(dir, "docs/x.md"));
  assert.equal(outside, undefined);
});

test("renderTree emits a nested layout summary", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), "# root");
  await fs.mkdir(path.join(dir, "packages/api"), { recursive: true });
  await fs.writeFile(path.join(dir, "packages/api/AGENTS.md"), "# api");
  const summary = await buildTreeSummary(dir);
  const rendered = renderTree(summary);
  assert.match(rendered, /tree — /);
  assert.match(rendered, /found: 2 AGENTS\.md, 0 CLAUDE\.md/);
  assert.match(rendered, /AGENTS\.md {2}\(AGENTS\.md\)/);
  assert.match(rendered, /packages[\\/]api[\\/]AGENTS\.md/);
});
