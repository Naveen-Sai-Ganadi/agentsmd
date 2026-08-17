# Changelog

All notable changes to `agentsmd` are documented in this file.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- **`missing-frontmatter` / `invalid-frontmatter` / `empty-frontmatter` lint
  rules** — flag `AGENTS.md` files with no leading YAML frontmatter block
  (info), an unterminated opening `---` fence (warn), or a fenced block
  with none of the recognized keys `title` / `description` / `updated` /
  `owner` / `version` (info). Frontmatter enables *progressive disclosure*
  — agents can peek at metadata without loading the full file — per
  codegateway.dev's 2026 Codex playbook. The `structure` audit dimension
  awards a small (+5) bonus when a valid, keyed block is present, so
  well-annotated configs bank a fifth of a letter grade before being
  compared on structure. 3 new tests (67 passing total).
- **`version`** — new CLI command. Accepts `version`, `--version`, and `-v`.
  Prints `agentsmd <version>` (from `package.json`); add `--json` for
  `{ name, version, source }` machine output. Fills a small but obvious v0.1.0
  gap surfaced while dogfooding on external repos.
- **`doctor`** — env + repo diagnostic. Checks Node version (>=22),
  presence of `AGENTS.md` (with staleness in days + managed-banner flag),
  and lists detected sibling configs. Exits `1` when any check fails.
  Add `--json` for machine output. Complements `version` for quick
  install/setup verification.
- **`long-file` lint rule** — `info`-severity issue when `AGENTS.md`
  exceeds a 200-line budget (folk-rule from r/ClaudeCode + morphllm 2026
  field guide). The `structure` audit dimension applies a graduated
  penalty (up to −15) so oversized configs bleed points before failing CI.
- **`tree`** — new CLI command. Discovers nested `AGENTS.md` and
  `CLAUDE.md` files across a monorepo (skips `node_modules`, `dist`,
  dot-directories, and common build/cache dirs; `--max-depth=N` overrides
  the default 8-level cap). Text output indents each config by depth;
  `--json` emits a structured summary (`{ root, configs, totalAgentsMd,
  totalClaudeMd, maxDepth }`). Ships the discovery + `nearestConfig`
  primitive that the upcoming nested `lint` / `audit` / `check` will build
  on (v0.1.1 monorepo mode, STATE.md decision #12 = `mono`).
- **`lint --nested`** — apply the full lint rule set to every `AGENTS.md`
  discovered by `tree`. Reports per-file issues and a rolled-up totals
  line (files / errors / warnings / info); exits `1` when *any* nested
  file surfaces a lint `error`. Add `--max-depth=N` to bound traversal
  (default 8). Implements decision #15 = `all` (union of issues) —
  matches the codegateway 2026 monorepo playbook and the `long-file`
  rule's per-file framing. Second concrete step of monorepo mode;
  `audit --nested` and `check --nested` are the next two loop days.
- **`audit --nested`** — run the 6-dimension scorecard against every
  `AGENTS.md` discovered by `tree`, then roll up two monorepo-level
  numbers: `overall` (mean of per-file overall scores — typical health)
  and `lowest` (worst per-file score — weakest link, useful for CI gates
  that care about the sickest package). Per-file output shows each
  dimension score; `--json` returns the full structured report. Add
  `--max-depth=N` to bound traversal (default 8). Third vertical slice
  of monorepo mode — `check --nested` is the last remaining piece
  before v0.1.1 ships.
- **`check --nested`** — run the CI gate against every `AGENTS.md`
  discovered by `tree`. Weakest-link semantics: the monorepo fails when
  *any* nested file breaches the gate (lint errors at/above `--fail-on`
  or an audit score below the `--min-grade` / `--min-score` floor).
  Per-file `PASS ✓` / `FAIL ✗` lines call out the exact package to fix;
  a rolled-up line surfaces the same `overall` / `lowest` numbers as
  `audit --nested` plus aggregate lint counts. `--max-depth=N` bounds
  traversal (default 8); `--json` returns the full structured report.
  Fourth and final vertical slice of monorepo mode — closes the last
  piece of v0.1.1.

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
