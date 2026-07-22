# STATE — agentsmd

Last updated: 2026-07-22 (Phase 2, Day 6 of build)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17)
- 2026-07-20 — `sync` command shipped (dry-run default, banner, 6 tests)
- 2026-07-21 — `init` command shipped (merge/blank modes, stack scan, 7 tests)
- **2026-07-22 — `lint` + `audit` shipped (roadmap #5)**
  - `src/lint.ts`: `lintAgentsMd` (missing-file, too-short/long, no-headings, missing-section hints, long-line, TODO/FIXME/TBD placeholder scanner, vague-directive detector, unsynced-sibling-config warning). Severity levels: error/warn/info.
  - `src/lint.ts`: `auditAgentsMd` — 6-dimension scorecard (completeness, specificity, structure, length, freshness, consistency), 0–100 per dimension + overall + A–F grade. Cross-checks `package.json` scripts for freshness.
  - CLI: `agentsmd lint [path] [--json]` (exit 1 on errors) and `agentsmd audit [path] [--json]`. Help text updated.
  - 8 new tests in `tests/lint.test.ts` (missing file, too-short + no-headings + vague, placeholder line numbers, unsynced sibling warning, banner acceptance, audit missing = F, audit rewards well-structured file).
  - README quickstart updated with `lint`/`audit` invocations; status line updated.
  - Dogfooded: running `agentsmd audit` on the repo's own AGENTS.md returned 79/100 (grade B) — signal that the file needs a `## Commands` code block and one more sibling reference.
  - `lint` + `test` green locally (23 tests total, 0 failing).

## In progress
- Roadmap item #5 (`lint` + `audit`) complete. Queued next: `check` CI mode + reusable GitHub Action (roadmap #6). Idea: reuse `lint --json` + `audit --json` inside the action so the workflow can gate on grade thresholds.

## Blocked
- (none)

## Decisions needed (one-word answerable)
1. Publish name `agentsmd` on npm? (yes / rename)
2. Default `sync` behavior: keep `--apply` opt-in (safer), or flip to opt-out via `--dry-run`? (keep / flip)
3. `init` default: keep `merge` as default or flip to `blank`? (keep / flip)
4. Include Aider `.aider.conf.yml` and Continue `.continuerc` in v0.2? (yes / no)
5. `audit` grade floor for CI mode default (fail below C = 60)? (C / B)   ← new, drives roadmap #6.
6. Bump Swift/SwiftUI stack detection into v0.1 (was v0.2) after seeing `twostraws/SwiftAgents` traction? (yes / no)   ← new, driven by 2026-07-22 research.

## Roadmap (v0.1.0, 2 weeks)
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [x] `sync` command (AGENTS.md as source of truth) — shipped 2026-07-20
4. [x] `init` command (scaffold AGENTS.md from repo scan) — shipped 2026-07-21
5. [x] `lint` + `audit` (6-dimension scorecard) — shipped 2026-07-22
6. [ ] `check` CI mode + reusable GitHub Action — NEXT
7. [ ] README polish + quickstart + contributing
8. [ ] Tag v0.1.0

## Metrics
- Stars: 0
- Open issues: 0 · Open PRs: 0
- CI: green (last successful run 2026-07-21 on `init` commit; today's push will re-run)
- npm downloads: n/a (unpublished)
- Local test count: 23 passing (up from 16 yesterday)

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift are the top-two complaints (`drafts/research-2026-07-20.md`).
- 2026-07-21: competitor scan — two other sync-focused tools exist; neither targets lint/audit (`drafts/research-2026-07-21.md`).
- **2026-07-22:** 5 fresh signals confirming AGENTS.md momentum: `agentsmd/agents.md` @ 23k stars, `FerroxLabs/agents-md` @ 630 stars (quality-graded AGENTS.md marketing angle), `google-labs-code/design.md` @ 26k (sibling format), `twostraws/SwiftAgents` @ 1.4k (language-specific AGENTS.md), `jsynowiec/node-typescript-boilerplate` @ 3k (boilerplate advertising "AGENTS.md included"). Full log in `drafts/research-2026-07-22.md`.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md`
- `drafts/changelog-init-2026-07-21.md`
- `drafts/changelog-lint-audit-2026-07-22.md` — NEW: v0.0.3 release notes for `lint` + `audit`, 140-char reply copy, HN comment variant.

## Leads
See `leads.md`.

## Security-sensitive
- (none touched today) — `lint` and `audit` are read-only: they read `AGENTS.md`, `package.json`, and sibling config files, and write nothing. No auth, no network, no user data.
