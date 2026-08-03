import { test } from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { lintAgentsMd, auditAgentsMd } from "../src/lint.ts";

async function mkTmp(): Promise<string> {
  return await fs.mkdtemp(path.join(os.tmpdir(), "agentsmd-lint-"));
}

test("lint reports missing-file when AGENTS.md is absent", async () => {
  const dir = await mkTmp();
  const report = await lintAgentsMd(dir);
  assert.equal(report.exists, false);
  assert.equal(report.issues.length, 1);
  assert.equal(report.issues[0].rule, "missing-file");
  assert.equal(report.issues[0].severity, "error");
});

test("lint flags too-short, no-headings, and vague directives", async () => {
  const dir = await mkTmp();
  await fs.writeFile(path.join(dir, "AGENTS.md"), "write good code, follow best practices");
  const report = await lintAgentsMd(dir);
  assert.equal(report.exists, true);
  const rules = report.issues.map((i) => i.rule);
  assert.ok(rules.includes("too-short"));
  assert.ok(rules.includes("no-headings"));
  assert.ok(rules.some((r) => r === "vague-directive"));
});

test("lint detects unresolved TODO/FIXME placeholders with line numbers", async () => {
  const dir = await mkTmp();
  const body = `# AGENTS.md

## Project
A sample project.

## Commands
- TODO: add build command
- FIXME: describe test setup
`;
  await fs.writeFile(path.join(dir, "AGENTS.md"), body);
  const report = await lintAgentsMd(dir);
  const placeholders = report.issues.filter((i) => i.rule === "placeholder");
  assert.equal(placeholders.length, 2);
  assert.ok(placeholders.every((p) => typeof p.line === "number" && p.line! > 0));
});

test("lint warns about unsynced sibling configs (no agentsmd banner)", async () => {
  const dir = await mkTmp();
  await fs.writeFile(
    path.join(dir, "AGENTS.md"),
    "# AGENTS.md\n\n## Project\nx\n\n## Stack\nNode\n\n## Commands\n```bash\nnpm test\n```\n\n## Conventions\n- Rule one.\n",
  );
  await fs.writeFile(path.join(dir, "CLAUDE.md"), "# CLAUDE.md\nStale copy without banner.\n");
  const report = await lintAgentsMd(dir);
  assert.ok(report.issues.some((i) => i.rule === "unsynced-config"));
});

test("lint accepts sibling configs that carry the agentsmd banner", async () => {
  const dir = await mkTmp();
  await fs.writeFile(
    path.join(dir, "AGENTS.md"),
    "# AGENTS.md\n\n## Project\nx\n\n## Stack\nNode\n\n## Commands\n```bash\nnpm test\n```\n\n## Conventions\n- Rule.\n",
  );
  await fs.writeFile(
    path.join(dir, "CLAUDE.md"),
    "<!-- agentsmd:generated from AGENTS.md — do not edit -->\n# CLAUDE.md\nOK.\n",
  );
  const report = await lintAgentsMd(dir);
  assert.equal(report.issues.filter((i) => i.rule === "unsynced-config").length, 0);
});

test("lint flags long-file (info) when AGENTS.md exceeds the 200-line budget", async () => {
  const dir = await mkTmp();
  const header = `# AGENTS.md\n\n## Project\nA project.\n\n## Stack\nNode.\n\n## Commands\n\`\`\`bash\nnpm test\n\`\`\`\n\n## Conventions\n`;
  const filler = Array.from({ length: 250 }, (_, i) => `- Rule ${i + 1}: keep things concrete.`).join("\n");
  await fs.writeFile(path.join(dir, "AGENTS.md"), header + filler + "\n");
  const report = await lintAgentsMd(dir);
  const longFile = report.issues.find((i) => i.rule === "long-file");
  assert.ok(longFile, "expected a long-file issue");
  assert.equal(longFile!.severity, "info");
  assert.match(longFile!.message, /200/);
});

test("lint does not flag long-file for a small AGENTS.md", async () => {
  const dir = await mkTmp();
  await fs.writeFile(
    path.join(dir, "AGENTS.md"),
    "# AGENTS.md\n\n## Project\nx\n\n## Stack\nNode\n\n## Commands\n```bash\nnpm test\n```\n\n## Conventions\n- Rule.\n",
  );
  const report = await lintAgentsMd(dir);
  assert.equal(report.issues.filter((i) => i.rule === "long-file").length, 0);
});

test("audit structure dimension penalizes AGENTS.md over the line budget", async () => {
  const dirSmall = await mkTmp();
  const small = `# AGENTS.md\n\n## Project\nx.\n\n## Stack\nNode.\n\n## Commands\n\`\`\`bash\nnpm test\n\`\`\`\n\n## Conventions\n- Rule.\n`;
  await fs.writeFile(path.join(dirSmall, "AGENTS.md"), small);
  const smallReport = await auditAgentsMd(dirSmall);
  const smallStructure = smallReport.dimensions.find((d) => d.dimension === "structure")!.score;

  const dirBig = await mkTmp();
  const filler = Array.from({ length: 300 }, (_, i) => `- Rule ${i + 1}: keep things concrete.`).join("\n");
  await fs.writeFile(path.join(dirBig, "AGENTS.md"), small + filler + "\n");
  const bigReport = await auditAgentsMd(dirBig);
  const bigStructure = bigReport.dimensions.find((d) => d.dimension === "structure")!.score;

  assert.ok(bigStructure < smallStructure, `expected big-file structure (${bigStructure}) < small-file structure (${smallStructure})`);
});

test("audit returns 0/F when AGENTS.md is missing", async () => {
  const dir = await mkTmp();
  const report = await auditAgentsMd(dir);
  assert.equal(report.exists, false);
  assert.equal(report.overall, 0);
  assert.equal(report.grade, "F");
  assert.equal(report.dimensions.length, 6);
});

test("audit rewards a well-structured AGENTS.md across all six dimensions", async () => {
  const dir = await mkTmp();
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify({ name: "x", scripts: { build: "tsc", test: "node --test", lint: "tsc --noEmit" } }),
  );
  const body = `# AGENTS.md

## Project
This project is a TypeScript CLI.

## Stack
- Node.js 22
- TypeScript 5.x

## Commands
\`\`\`bash
npm run build
npm test
npm run lint
\`\`\`

## Conventions
- Use conventional commits.
- Prefer async/await over promises.
- No default exports.

## Testing rules
- Every new module ships with tests.
- Do not commit skipped tests.
`;
  await fs.writeFile(path.join(dir, "AGENTS.md"), body);
  const report = await auditAgentsMd(dir);
  assert.equal(report.exists, true);
  assert.ok(report.overall >= 75, `expected overall >= 75, got ${report.overall}`);
  assert.ok(["A", "B"].includes(report.grade));
  const dims = Object.fromEntries(report.dimensions.map((d) => [d.dimension, d.score]));
  assert.equal(dims.completeness, 100);
  assert.ok(dims.structure >= 60);
  assert.ok(dims.length === 100);
  assert.ok(dims.freshness >= 70);
  assert.equal(dims.consistency, 100);
});
