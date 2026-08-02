# Changelog

All notable changes to `agentsmd` are documented in this file.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **`version`** — new CLI command. Accepts `version`, `--version`, and `-v`.
  Prints `agentsmd <version>` (from `package.json`); add `--json` for
  `{ name, version, source }` machine output. Fills a small but obvious v0.1.0
  gap surfaced while dogfooding on external repos.
- **`doctor`** — env + repo diagnostic. Checks Node version (>=22),
  presence of `AGENTS.md` (with staleness in days + managed-banner flag),
  and lists detected sibling configs. Exits `1` when any check fails.
  Add `--json` for machine output. Complements `version` for quick
  install/setup verification.

## [0.1.0] — 2026-07-29

First tagged release. `AGENTS.md` is the single source of truth; every other
agent config file (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`,
`.windsurfrules`) is rendered from it and kept honest by the linter, auditor,
and CI gate.

### Added
- **`sync`** — render sibling agent-config files from `AGENTS.md`. Dry-run by
  default; `--apply` writes. Emits a "managed by agentsmd" banner and strips
  any existing banner before re-render to avoid duplication.
- **`init`** — scaffold an `AGENTS.md` for a repo. Scans the tree, detects the
  stack (Node/TS, Python, Go, Rust, Swift, monorepo) and existing agent files.
  `--mode merge` (default) preserves an existing `AGENTS.md`; `--mode blank`
  starts fresh.
- **`lint`** — style/consistency checks with `error` / `warning` / `info` levels.
- **`audit`** — 6-dimension scorecard (structure, coverage, examples, freshness,
  cross-refs, security) → 0–100 score and A–F grade.
- **`check`** — combined CI gate. Non-zero exit when audit falls under
  `--min-grade` (default `C`) or `--min-score`, or when `lint` reports errors.
- **Reusable GitHub Action** (`action.yml`) — composite action wrapping `check`
  with `path`, `min-grade`, `min-score`, and `fail-on` inputs.
- **Docs consistency tests** — CI-enforced parity between `README.md`, `CLI`
  commands, `CONTRIBUTING.md`, and `action.yml` so documentation cannot rot
  silently as commands evolve.

### Notes
- Node ≥22 required (uses `--experimental-strip-types` for TS tests, no build
  step for the test runner).
- Zero runtime dependencies — the published tarball ships only `dist/`,
  `README.md`, and `LICENSE`.
- Not yet published to npm. Use via `npx github:Naveen-Sai-Ganadi/agentsmd` or
  clone and `npm link`.

### Known limitations (tracked for v0.2)
- Aider (`.aider.conf.yml`) and Continue (`.continuerc`) are not yet sync
  targets.
- No `drift` command yet (stale-path / dead-script checker).
- No `import --from-agents-dir` yet for repos using an `.agents/` layout.
