# STATE — agentsmd

Last updated: 2026-07-21 (Phase 2, Day 5 of build)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17)
- 2026-07-20 — `sync` command shipped (dry-run default, banner, 6 tests)
- **2026-07-21 — `init` command shipped**
  - `src/init.ts`: `planInit` + `applyInit`, `merge` (default) and `blank` modes, stack scan (Node/TS/Python/Rust/Go/Ruby), `agentsmd:generated` banner stripped from imported bodies, `--force` override for existing files
  - CLI: `agentsmd init [path] [--apply] [--blank] [--force]` — dry-run preview of first 40 lines by default
  - 7 new tests in `tests/init.test.ts` (create-empty, stack-detect, merge, banner-strip, skip-exists no-op, force-overwrite, apply-writes)
  - README quickstart updated
  - `lint` + `test` green locally (16 tests total, 0 failing)

## In progress
- Roadmap item #4 (`init`) complete. Queued next: `lint` + `audit` (roadmap #5) — bumped ahead of `check` CI mode based on today's competitor scan (see Research log — sync-only tools already exist; lint/audit is our wedge).

## Blocked
- (none)

## Decisions needed (one-word answerable)
1. Publish name `agentsmd` on npm? (yes / rename)
2. Default `sync` behavior: keep `--apply` opt-in (safer), or flip to opt-out via `--dry-run`? (keep / flip)
3. `init` default: keep `merge` as default (current) or flip to `blank`? (keep / flip)   ← was decision #3 from yesterday, implemented as `merge` default with `--blank` opt-out; confirm or reverse.
4. Include Aider `.aider.conf.yml` and Continue `.continuerc` in v0.2? (yes / no)
5. Reprioritise: build `lint`+`audit` (roadmap #5) before `check` CI mode (roadmap #6)? (yes / no)   ← new, driven by competitor scan.

## Roadmap (v0.1.0, 2 weeks)
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [x] `sync` command (AGENTS.md as source of truth) — shipped 2026-07-20
4. [x] `init` command (scaffold AGENTS.md from repo scan) — shipped 2026-07-21
5. [ ] `lint` + `audit` (6-dimension scorecard) — NEXT (pending decision #5)
6. [ ] `check` CI mode + reusable GitHub Action
7. [ ] README polish + quickstart + contributing
8. [ ] Tag v0.1.0

## Metrics
- Stars: 0
- Open issues: 0 · Open PRs: 0
- CI: green (last run 2026-07-20 on `sync` commit; today's push will re-run)
- npm downloads: n/a (unpublished)

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift are the top-two complaints (`drafts/research-2026-07-20.md`).
- **2026-07-21: competitor scan** — two other sync-focused tools already exist in the space: `spxrogers/agentsync` (Claude Code + OpenCode + Codex sync) and `amtiYo/agents` (broader: MCP + skills + instructions). Neither appears (from public metadata) to target lint/audit — that's the differentiator to lean into. Full log + venue list in `drafts/research-2026-07-21.md`.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md`
- `drafts/changelog-init-2026-07-21.md` — NEW: v0.0.2 release notes and 140-char reply copy for the `init` command.

## Leads
See `leads.md`.

## Security-sensitive
- (none touched today) — `init` only reads existing text files and writes a single `AGENTS.md`. No auth, no network, no user data.
