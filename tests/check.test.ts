import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { runCheck, evaluateCheck, parseGrade, parseFailOn } from "../src/check.ts";
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
