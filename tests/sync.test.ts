import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { planSync, applySync, renderTarget, ALL_TARGETS, TARGET_REL } from "../src/sync.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-sync-"));
}

const SOURCE = "# AGENTS.md\n\nHello agents.\n";

test("plan reports skip-missing-source when AGENTS.md absent", async () => {
  const dir = await mkTmp();
  const plan = await planSync(dir);
  assert.equal(plan.entries.length, ALL_TARGETS.length);
  for (const e of plan.entries) assert.equal(e.action, "skip-missing-source");
});

test("plan marks all targets as create on first run", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), SOURCE);
  const plan = await planSync(dir);
  for (const e of plan.entries) assert.equal(e.action, "create");
});

test("apply writes rendered targets with banner", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), SOURCE);
  const plan = await planSync(dir);
  await applySync(dir, plan);
  const claude = await fs.readFile(path.join(dir, TARGET_REL["claude-md"]), "utf8");
  assert.ok(claude.startsWith("<!-- agentsmd:generated"));
  assert.ok(claude.includes("Hello agents."));
  const cursor = await fs.readFile(path.join(dir, TARGET_REL["cursorrules"]), "utf8");
  assert.ok(cursor.startsWith("# agentsmd:generated"));
  const copilot = await fs.readFile(path.join(dir, TARGET_REL["copilot-instructions"]), "utf8");
  assert.ok(copilot.includes("Hello agents."));
});

test("re-plan after apply reports unchanged", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), SOURCE);
  await applySync(dir, await planSync(dir));
  const plan2 = await planSync(dir);
  for (const e of plan2.entries) assert.equal(e.action, "unchanged");
});

test("edit to AGENTS.md flips one target to update", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), SOURCE);
  await applySync(dir, await planSync(dir));
  await fs.writeFile(path.join(dir, "AGENTS.md"), SOURCE + "\nMore rules.\n");
  const plan = await planSync(dir, ["claude-md"]);
  assert.equal(plan.entries[0].action, "update");
});

test("renderTarget strips existing banner to avoid duplication", () => {
  const withBanner = "<!-- agentsmd:generated — do not edit; sourced from AGENTS.md -->\n\n# Body\n";
  const out = renderTarget("claude-md", withBanner);
  const bannerCount = out.match(/agentsmd:generated/g)?.length ?? 0;
  assert.equal(bannerCount, 1);
});
