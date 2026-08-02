import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const README = readFileSync(join(ROOT, "README.md"), "utf8");
const CONTRIB_PATH = join(ROOT, "CONTRIBUTING.md");
const CLI_SRC = readFileSync(join(ROOT, "src/cli.ts"), "utf8");

const COMMANDS = ["detect", "init", "sync", "lint", "audit", "check", "doctor"] as const;

test("README references every implemented command", () => {
  for (const cmd of COMMANDS) {
    assert.match(README, new RegExp(`agentsmd ${cmd}\\b`), `README missing 'agentsmd ${cmd}'`);
  }
});

test("cli help lists every command documented in README", () => {
  for (const cmd of COMMANDS) {
    assert.match(CLI_SRC, new RegExp(`case "${cmd}":`), `cli.ts missing case for '${cmd}'`);
  }
});

test("CONTRIBUTING.md exists and covers the dev loop", () => {
  assert.ok(existsSync(CONTRIB_PATH), "CONTRIBUTING.md is missing");
  const contrib = readFileSync(CONTRIB_PATH, "utf8");
  for (const needle of ["npm ci", "npm test", "npm run build", "Conventional commits"]) {
    assert.ok(contrib.includes(needle), `CONTRIBUTING.md missing '${needle}'`);
  }
});

test("README GitHub Action snippet matches action.yml inputs", () => {
  const action = readFileSync(join(ROOT, "action.yml"), "utf8");
  for (const input of ["path:", "min-grade:", "fail-on:"]) {
    assert.ok(action.includes(input), `action.yml missing declared input '${input}'`);
    assert.ok(README.includes(input), `README missing action input '${input}'`);
  }
});

test("README does not reference removed/renamed commands", () => {
  // Old `check` (config-file detector) was renamed to `detect` in v0.0.4.
  // Guard against future accidental reintroduction of stale flag names.
  assert.doesNotMatch(README, /agentsmd\s+check\s+--list\b/, "README references removed --list flag");
});
