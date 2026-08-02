import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { runDoctor } from "../src/doctor.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-doctor-"));
}

test("runDoctor flags too-old Node versions", async () => {
  const root = await mkTmp();
  const report = await runDoctor(root, "v18.19.0");
  assert.equal(report.node.ok, false);
  assert.equal(report.ok, false);
  const nodeCheck = report.checks.find((c) => c.name === "node-version");
  assert.ok(nodeCheck && !nodeCheck.ok);
});

test("runDoctor accepts Node 22+", async () => {
  const root = await mkTmp();
  const report = await runDoctor(root, "v22.5.0");
  assert.equal(report.node.ok, true);
});

test("runDoctor reports AGENTS.md absence", async () => {
  const root = await mkTmp();
  const report = await runDoctor(root, "v22.5.0");
  assert.equal(report.agentsMd.present, false);
  const check = report.checks.find((c) => c.name === "agents-md-present");
  assert.ok(check && !check.ok);
  assert.match(check.detail, /agentsmd init/);
});

test("runDoctor detects AGENTS.md, siblings, and banner", async () => {
  const root = await mkTmp();
  await fs.writeFile(
    path.join(root, "AGENTS.md"),
    "<!-- agentsmd:managed -->\n# Project\n\nTest.\n",
  );
  await fs.writeFile(path.join(root, "CLAUDE.md"), "# Claude\n");
  await fs.writeFile(path.join(root, ".cursorrules"), "cursor rules\n");
  const report = await runDoctor(root, "v22.5.0");
  assert.equal(report.agentsMd.present, true);
  assert.ok(report.agentsMd.bytes > 0);
  assert.equal(report.agentsMd.hasBanner, true);
  const kinds = report.configs.map((c) => c.kind).sort();
  assert.deepEqual(kinds, ["agents-md", "claude-md", "cursorrules"]);
  assert.equal(report.ok, true);
});

test("runDoctor exposes agentsmd version info", async () => {
  const root = await mkTmp();
  const report = await runDoctor(root, "v22.5.0");
  assert.equal(report.agentsmd.name, "agentsmd");
  // version may be a real semver or "unknown" when running from stripped-types tests
  assert.ok(typeof report.agentsmd.version === "string" && report.agentsmd.version.length > 0);
});
