import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { planInit, applyInit } from "../src/init.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-init-"));
}

test("plan creates AGENTS.md in an empty repo (blank mode)", async () => {
  const dir = await mkTmp();
  const plan = await planInit(dir, { mode: "blank" });
  assert.equal(plan.action, "create");
  assert.equal(plan.mode, "blank");
  assert.equal(plan.sources.length, 0);
  assert.ok(plan.rendered.startsWith("# AGENTS.md"));
  assert.ok(plan.rendered.includes("## Conventions"));
  assert.ok(!plan.rendered.includes("## Merged existing rules"));
});

test("plan detects Node/TypeScript stack from package.json", async () => {
  const dir = await mkTmp();
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "sample",
      devDependencies: { typescript: "^5.0.0" },
      scripts: { test: "node --test" },
    }),
  );
  const plan = await planInit(dir);
  assert.ok(plan.repo.stack.some((s) => s.includes("Node")));
  assert.ok(plan.repo.stack.some((s) => s.includes("TypeScript")));
  assert.ok(plan.rendered.includes("## Stack"));
});

test("merge mode folds existing CLAUDE.md and .cursorrules into AGENTS.md", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "CLAUDE.md"), "# Claude rules\n\nUse tabs.\n");
  await fs.writeFile(path.join(dir, ".cursorrules"), "Prefer functional style.\n");
  const plan = await planInit(dir, { mode: "merge" });
  assert.equal(plan.sources.length, 2);
  assert.ok(plan.rendered.includes("## Merged existing rules"));
  assert.ok(plan.rendered.includes("Use tabs."));
  assert.ok(plan.rendered.includes("Prefer functional style."));
  assert.ok(plan.rendered.includes("### From CLAUDE.md"));
  assert.ok(plan.rendered.includes("### From .cursorrules"));
});

test("merge strips agentsmd:generated banner from imported sources", async () => {
  const dir = await mkTmp();
  await fs.writeFile(
    path.join(dir, "CLAUDE.md"),
    "<!-- agentsmd:generated — do not edit; sourced from AGENTS.md -->\n\n# Claude rules\n\nBody text.\n",
  );
  const plan = await planInit(dir, { mode: "merge" });
  assert.ok(!plan.rendered.includes("agentsmd:generated"));
  assert.ok(plan.rendered.includes("Body text."));
});

test("plan reports skip-exists when AGENTS.md already present, and applyInit is a no-op", async () => {
  const dir = await mkTmp();
  const existing = "# Existing\n\nHands off.\n";
  await fs.writeFile(path.join(dir, "AGENTS.md"), existing);
  const plan = await planInit(dir);
  assert.equal(plan.action, "skip-exists");
  await applyInit(plan);
  const after = await fs.readFile(path.join(dir, "AGENTS.md"), "utf8");
  assert.equal(after, existing);
});

test("force + apply overwrites an existing AGENTS.md", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), "old\n");
  const plan = await planInit(dir, { force: true, mode: "blank" });
  assert.equal(plan.action, "overwrite");
  await applyInit(plan);
  const after = await fs.readFile(path.join(dir, "AGENTS.md"), "utf8");
  assert.ok(after.startsWith("# AGENTS.md"));
  assert.ok(!after.startsWith("old"));
});

test("applyInit writes the rendered content to disk", async () => {
  const dir = await mkTmp();
  const plan = await planInit(dir, { mode: "blank" });
  await applyInit(plan);
  const written = await fs.readFile(path.join(dir, "AGENTS.md"), "utf8");
  assert.equal(written, plan.rendered);
});
