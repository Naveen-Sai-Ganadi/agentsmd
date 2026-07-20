# STATE — agentsmd

Last updated: 2026-07-20 (Phase 2, Day 4 of build)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17)
- **2026-07-20 — `sync` command shipped**
  - `src/sync.ts`: `planSync` (dry-run diff) + `applySync` (write) with per-target renderer and `agentsmd:generated` banner
  - CLI: `agentsmd sync [path] [--apply] [--targets=...]` — dry-run by default (respects guardrail: never mutate configs the user cares about without preview)
  - 6 new tests in `tests/sync.test.ts` covering missing source, first-run create, apply-writes, unchanged detection, edit → update, banner idempotence
  - README: quickstart section with real commands
  - `lint` + `test` green locally (9 tests total, 0 failing)

## In progress
- Roadmap item #3 (`sync`) complete. Queued next: `init` (scaffold `AGENTS.md` from repo scan) — should key off existing rule files if any are present.

## Blocked
- (none)

## Decisions needed (one-word answerable)
1. Publish name `agentsmd` on npm? (yes / rename)
2. Default `sync` behavior: keep `--apply` opt-in (safer), or flip to opt-out via `--dry-run`? (keep / flip)
3. `init` should merge any pre-existing `CLAUDE.md` / `.cursorrules` into `AGENTS.md`, or start blank? (merge / blank)
4. Include Aider `.aider.conf.yml` and Continue `.continuerc` in v0.2? (yes / no)

## Roadmap (v0.1.0, 2 weeks)
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [x] `sync` command (AGENTS.md as source of truth) — shipped 2026-07-20
4. [ ] `init` command (scaffold AGENTS.md from repo scan) — NEXT
5. [ ] `lint` + `audit` (6-dimension scorecard)
6. [ ] `check` CI mode + reusable GitHub Action
7. [ ] README polish + quickstart + contributing
8. [ ] Tag v0.1.0

## Metrics
- Stars: 0
- Open issues: 0 · Open PRs: 0
- CI: green (last run 2026-07-17 on scaffold commit; today's push will re-run)
- npm downloads: n/a (unpublished)

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: Fresh scan — monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift are the top-two complaints; Cursor and Copilot both now support nested per-directory rule files (flag for v0.2). Details in `drafts/research-2026-07-20.md`.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md` — NEW: short reply for the next drift-complaint thread, points to the shipped `sync` command.

## Leads
See `leads.md`.

## Security-sensitive
- (none touched today) — `sync` only reads/writes plain-text config files; no auth, no network, no user data.
