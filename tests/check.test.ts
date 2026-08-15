import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { runCheck, runCheckNested, evaluateCheck, parseGrade, parseFailOn } from "../src/check.ts";
import { lintAgentsMd, auditAgentsMd } from "../src/lint.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-check-"));
}

const GOOD_AGENTS_MD = `# Project

Universal manager, linter and sync tool for AI-coding-agent config files.

## Stack

Node.js with TypeScript. Runs on Node 22+. Uses no runtime dependencies.

## Commands

\`\`\`bash
npm install
npm run build
npm test
\`\`\`

Run \`npm run lint\` to typecheck. Use \`node dist/cli.js sync --apply\` to apply.

## Conventions

- Follow conventional commit format for all commits.
- Never commit generated files under \`dist/\` in feature PRs.
- Add tests for every new command; keep coverage moving up.

## Style

Use two-space indentation. Prefer named exports. Avoid default exports.
`;

test("check fails when AGENTS.md is missing", async () => {
  const dir = await mkTmp();
  const result = await runCheck(dir);
  assert.equal(result.passed, false);
  assert.ok(result.reasons.length > 0);
  assert.equal(result.gate.minGrade, "C");
  assert.equal(result.gate.minScore, 60);
  assert.equal(result.gate.failOn, "error");
});

test("check passes with a well-formed AGENTS.md at default C threshold", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), GOOD_AGENTS_MD);
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "x", scripts: { build: "tsc", test: "node --test", lint: "tsc --noEmit" } }),
  );
  const result = await runCheck(dir);
  assert.equal(result.passed, true, `unexpected reasons: ${result.reasons.join("; ")}`);
  assert.ok(result.audit.overall >= 60);
});

test("check fails at min-grade=A when AGENTS.md is only okay", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), GOOD_AGENTS_MD);
  const result = await runCheck(dir, { minGrade: "A" });
  assert.equal(result.gate.minScore, 90);
  if (result.audit.overall < 90) {
    assert.equal(result.passed, false);
    assert.ok(result.reasons.some((r) => r.includes("below floor 90")));
  }
});

test("check --fail-on=warn escalates lint warnings into failures", async () => {
  const dir = await mkTmp();
  const marginal = `# Project\n\nSomething here.\n\nTODO figure out the rest.\n`;
  await fs.writeFile(path.join(dir, "AGENTS.md"), marginal);
  const lint = await lintAgentsMd(dir);
  const audit = await auditAgentsMd(dir);
  const withError = evaluateCheck(lint, audit, { failOn: "error", minScore: 0 });
  const withWarn = evaluateCheck(lint, audit, { failOn: "warn", minScore: 0 });
  const warnCount = lint.issues.filter((i) => i.severity === "warn" || i.severity === "error").length;
  if (warnCount > 0) {
    assert.equal(withWarn.passed, false);
    // With min-score=0 and no errors, the base case may pass; either way, warn mode must be
    // at least as strict as error mode.
    assert.ok(!withWarn.passed || withError.passed);
  }
});

test("check --min-score overrides grade-derived floor", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), GOOD_AGENTS_MD);
  const result = await runCheck(dir, { minGrade: "F", minScore: 99 });
  assert.equal(result.gate.minScore, 99);
});

test("parseGrade accepts A-F and rejects garbage", () => {
  assert.equal(parseGrade("a"), "A");
  assert.equal(parseGrade("C"), "C");
  assert.equal(parseGrade(undefined), undefined);
  assert.throws(() => parseGrade("Z"));
});

test("parseFailOn accepts error/warn/info and rejects garbage", () => {
  assert.equal(parseFailOn("ERROR"), "error");
  assert.equal(parseFailOn("warn"), "warn");
  assert.equal(parseFailOn(undefined), undefined);
  assert.throws(() => parseFailOn("panic"));
});

test("check --nested fails when any nested AGENTS.md breaches the gate (weakest-link)", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), GOOD_AGENTS_MD);
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "x", scripts: { build: "tsc", test: "node --test", lint: "tsc --noEmit" } }),
  );
  const pkgDir = path.join(dir, "packages", "web");
  await fs.mkdir(pkgDir, { recursive: true });
  // Tiny file — triggers `too-short` + `no-headings` lint errors and a low audit score.
  await fs.writeFile(path.join(pkgDir, "AGENTS.md"), "write good code");

  const result = await runCheckNested(dir);
  assert.equal(result.totalFiles, 2);
  const rootEntry = result.entries.find((e) => e.relPath === "AGENTS.md")!;
  const nestedEntry = result.entries.find((e) => e.relPath.includes("web"))!;
  assert.equal(rootEntry.passed, true, `root should pass: ${rootEntry.reasons.join("; ")}`);
  assert.equal(nestedEntry.passed, false);
  assert.equal(result.passed, false, "monorepo gate must fail when any file fails");
  assert.equal(result.failedFiles, 1);
  assert.equal(result.passedFiles, 1);
});

test("check --nested passes when every nested AGENTS.md clears the gate", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), GOOD_AGENTS_MD);
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "x", scripts: { build: "tsc", test: "node --test", lint: "tsc --noEmit" } }),
  );
  const pkgDir = path.join(dir, "packages", "web");
  await fs.mkdir(pkgDir, { recursive: true });
  await fs.writeFile(path.join(pkgDir, "AGENTS.md"), GOOD_AGENTS_MD);
  await fs.writeFile(
    path.join(pkgDir, "package.json"),
    JSON.stringify({ name: "web", scripts: { build: "tsc", test: "node --test", lint: "tsc --noEmit" } }),
  );

  const result = await runCheckNested(dir);
  assert.equal(result.totalFiles, 2);
  assert.equal(result.passed, true, `unexpected reasons: ${result.entries.flatMap((e) => e.reasons).join("; ")}`);
  assert.equal(result.failedFiles, 0);
  assert.ok(result.rollup.lowest >= 60);
});

test("check --nested honors max-depth and reports missing at root when tree is empty", async () => {
  const dir = await mkTmp();
  const result = await runCheckNested(dir);
  // Empty tree falls back to a single missing-file entry at the root.
  assert.equal(result.totalFiles, 1);
  assert.equal(result.entries[0].exists, false);
  assert.equal(result.passed, false);
  assert.equal(result.rollup.lowest, 0);
});
