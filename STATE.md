# STATE — agentsmd

Last updated: 2026-07-28 (Phase 2, Day 12 of build)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17)
- 2026-07-20 — `sync` command shipped (dry-run default, banner, 6 tests)
- 2026-07-21 — `init` command shipped (merge/blank modes, stack scan, 7 tests)
- 2026-07-22 — `lint` + `audit` shipped (6-dimension scorecard, 8 tests)
- 2026-07-26 — `check` CI mode + reusable GitHub Action shipped (roadmap #6)
- **2026-07-28 — README polish + `CONTRIBUTING.md` + docs-consistency tests (roadmap #7)**
  - `README.md` rewritten: hero line, badges row, concrete "The problem" section with the five-file tree, 30-second `npx` quickstart, command table, flag cheatsheet, GitHub Action snippet, comparison matrix vs. `agents-lint` / AgentLint / `agentlinter.com`.
  - `CONTRIBUTING.md` created: dev loop, project layout, "every command needs a test" + "no new runtime deps until v0.2" rules, add-a-command checklist, add-a-sync-target checklist, security note.
  - `tests/docs.test.ts`: 5 new tests that fail CI if (a) README stops referencing an implemented command, (b) CLI stops implementing a documented command, (c) README's Action snippet drifts from `action.yml` inputs, (d) `CONTRIBUTING.md` loses its dev-loop sections, (e) a removed flag reappears. Prevents doc rot as we approach v0.1.0.
  - `lint` + `build` + `test` green. Tests: **35 passing** (up from 30, +5 docs tests).
  - Dogfood: `node dist/cli.js check .` → passed=true, grade=B, score=79. No behavior/API changes.

## In progress
- Roadmap #7 complete. Queued next: **#8 tag v0.1.0** (bump `package.json` to 0.1.0, cut GitHub release with combined changelog, verify Action still runs from a tag). No further code required for v0.1.0 unless dogfooding surfaces an issue.

## Blocked
- (none)

## Decisions needed (one-word answerable)
1. Publish name `agentsmd` on npm? (yes / rename)
2. Default `sync` behavior: keep `--apply` opt-in (safer), or flip to opt-out via `--dry-run`? (keep / flip)
3. `init` default: keep `merge` as default or flip to `blank`? (keep / flip)
4. Include Aider `.aider.conf.yml` and Continue `.continuerc` in v0.2? (yes / no)
5. `audit` grade floor for CI mode default (fail below C = 60)? (C / B)
6. Bump Swift/SwiftUI stack detection into v0.1 (was v0.2) after seeing `twostraws/SwiftAgents` traction? (yes / no)
7. Add `agentsmd drift` (stale-path/dead-script checker, à la `giacomo/agents-lint`) as a v0.2 command? (yes / no)
8. Action distribution: keep the composite at repo root only, or add a marketplace listing after v0.1.0? (repo / market)
9. **NEW** — After v0.1.0, add `agentsmd import --from-agents-dir` to sync from `amtiYo/agents` `.agents/` layout too? (yes / no)
10. **NEW** — Publish v0.1.0 to npm now, or hold until we have a first external star/issue? (now / hold)

## Roadmap (v0.1.0, 2 weeks)
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [x] `sync` command (AGENTS.md as source of truth) — 2026-07-20
4. [x] `init` command (scaffold AGENTS.md from repo scan) — 2026-07-21
5. [x] `lint` + `audit` (6-dimension scorecard) — 2026-07-22
6. [x] `check` CI mode + reusable GitHub Action — 2026-07-26
7. [x] README polish + quickstart + contributing — 2026-07-28
8. [ ] Tag v0.1.0 — NEXT

## Metrics
- Stars: 0 · Forks: 0 · Watchers: 0
- Open issues: 0 · Open PRs: 0
- CI: green (last 5 runs on `main` all `success`; today's push will be run #6).
- npm downloads: n/a (unpublished; decision needed — see #10).
- Local test count: **35 passing** (up from 30, +5 docs-consistency tests today).
- `agentsmd check .` on this repo: passed=true, grade=B, score=79.

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift = top-two complaints.
- 2026-07-21: competitor scan — two sync-focused tools, none targeting lint/audit.
- 2026-07-22: 5 fresh signals confirming AGENTS.md momentum.
- 2026-07-26: 5 signals — `giacomo/agents-lint`, AgentLint marketplace action, `agentlinter.com` (hosted SaaS), Build-AGENTS.md-from-Skills action, Claude Code #6235 (5,200+ reactions). Two lint-competitors live.
- **2026-07-28:** 5 signals — `GowayLee/agent-sync` (OCaml, symlink), `amtiYo/agents` (broader `.agents/` scope covering MCP + skills + instructions), `dallay/agentsync` (third symlink-sync CLI), Claude Code #6235 up to **5,270+ reactions**, yurukusa gist documents five operator-side sync patterns. Full log: `drafts/research-2026-07-28.md`. **Takeaway:** three symlink-sync tools now exist — sync is commodifying. Our moat tightens to *"the only tool that fails your PR when AGENTS.md rots"* (lint + audit + `check` gate). `amtiYo/agents` is the biggest positioning threat: broader scope (MCP + skills), noted as a v0.2 direction.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md`
- `drafts/changelog-init-2026-07-21.md`
- `drafts/changelog-lint-audit-2026-07-22.md`
- `drafts/changelog-check-action-2026-07-26.md`
- `drafts/changelog-readme-contributing-2026-07-28.md` — NEW: v0.0.5 release notes + 140-char reply + updated HN comment variant with the "symlink can't fail your PR" wedge.

## Leads
See `leads.md`.

## Security-sensitive
- (none touched today) — docs cycle only. No code path changes.
