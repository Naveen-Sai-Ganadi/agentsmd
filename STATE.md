# STATE — agentsmd

Last updated: 2026-07-26 (Phase 2, Day 10 of build)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17)
- 2026-07-20 — `sync` command shipped (dry-run default, banner, 6 tests)
- 2026-07-21 — `init` command shipped (merge/blank modes, stack scan, 7 tests)
- 2026-07-22 — `lint` + `audit` shipped (6-dimension scorecard, 8 tests)
- **2026-07-26 — `check` CI mode + reusable GitHub Action shipped (roadmap #6)**
  - `src/check.ts`: pure `evaluateCheck(lint, audit, opts)` + `runCheck(root, opts)`; `parseGrade` / `parseFailOn` helpers.
  - CLI: `agentsmd check [path] [--min-grade=A|B|C|D|F] [--min-score=N] [--fail-on=error|warn|info] [--json]`. Exits 0 on pass, 1 on fail.
  - Renamed old `check` (config-file detector) to `agentsmd detect`. Breaking, but v0 — no external users yet.
  - `action.yml` composite GitHub Action at repo root. Inputs: `path`, `min-grade`, `min-score`, `fail-on`, `node-version`, `version`. Outputs: `passed`, `grade`, `score`. Runs from `source` mode (npm ci + build in the action checkout) by default; passing `version=<semver>` uses `npx agentsmd@<ver>` once we publish.
  - CI now has a `self-check` job that dogfoods the action against our own AGENTS.md at `min-grade=C`.
  - 7 new tests in `tests/check.test.ts` (missing-file, well-formed pass, min-grade=A fail path, fail-on=warn escalation, min-score override, parser guards). Total suite: 30 passing (up from 23).
  - Enabled `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` in tsconfig so tests can import `../src/check.ts` under Node 24's stable strip-types. Build still emits CJS to `dist/`.
  - README updated: quickstart shows `check` invocations and the reusable-Action drop-in YAML block.
  - Dogfood locally: `node dist/cli.js check . --json` on this repo → passed=true, grade=B, score=79.
  - `lint` + `build` + `test` green (30/30).

## In progress
- Roadmap item #6 (`check` CI + Action) complete. Queued next: `#7 README polish + quickstart + contributing` (screenshot, clearer install story, `CONTRIBUTING.md`). Then `#8 tag v0.1.0`.

## Blocked
- (none)

## Decisions needed (one-word answerable)
1. Publish name `agentsmd` on npm? (yes / rename)
2. Default `sync` behavior: keep `--apply` opt-in (safer), or flip to opt-out via `--dry-run`? (keep / flip)
3. `init` default: keep `merge` as default or flip to `blank`? (keep / flip)
4. Include Aider `.aider.conf.yml` and Continue `.continuerc` in v0.2? (yes / no)
5. `audit` grade floor for CI mode default (fail below C = 60)? (C / B)   ← still open; today shipped with default `C`.
6. Bump Swift/SwiftUI stack detection into v0.1 (was v0.2) after seeing `twostraws/SwiftAgents` traction? (yes / no)
7. Add `agentsmd drift` (stale-path/dead-script checker, à la `giacomo/agents-lint`) as a v0.2 command? (yes / no)   ← new, driven by 2026-07-26 research.
8. Action distribution: keep the composite at repo root only, or add a marketplace listing after v0.1.0? (repo / market)   ← new.

## Roadmap (v0.1.0, 2 weeks)
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [x] `sync` command (AGENTS.md as source of truth) — shipped 2026-07-20
4. [x] `init` command (scaffold AGENTS.md from repo scan) — shipped 2026-07-21
5. [x] `lint` + `audit` (6-dimension scorecard) — shipped 2026-07-22
6. [x] `check` CI mode + reusable GitHub Action — shipped 2026-07-26
7. [ ] README polish + quickstart + contributing — NEXT
8. [ ] Tag v0.1.0

## Metrics
- Stars: 0
- Open issues: 0 · Open PRs: 0
- CI: green (last successful run 2026-07-22 on `lint,audit` commit; today's push adds a `self-check` job — first run will be today's commit)
- npm downloads: n/a (unpublished)
- Local test count: 30 passing (up from 23)

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift = top-two complaints.
- 2026-07-21: competitor scan — two sync-focused tools, none targeting lint/audit.
- 2026-07-22: 5 fresh signals confirming AGENTS.md momentum.
- **2026-07-26:** 5 signals — `giacomo/agents-lint` (closest competitor: stale-reference lint, no sync), `AgentLint` marketplace action (paid-flavored, no sync), `agentlinter.com` (hosted SaaS), Build-AGENTS.md-from-Skills action (adjacent, integratable), Yurukusa gist / Claude Code issue #6235 with 5,200+ reactions on AGENTS.md ↔ CLAUDE.md drift. Full log: `drafts/research-2026-07-26.md`. Two lint-competitors are now live; positioning shifts to "lint + audit + sync + init, MIT, one binary" — the only tool with a real sync command.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md`
- `drafts/changelog-init-2026-07-21.md`
- `drafts/changelog-lint-audit-2026-07-22.md`
- `drafts/changelog-check-action-2026-07-26.md` — NEW: v0.0.4 release notes + 140-char reply + HN comment variant.

## Leads
See `leads.md`.

## Security-sensitive
- (none touched today) — `check` is pure orchestration over `lint`/`audit` (read-only). `action.yml` runs `npm ci` + `node dist/cli.js` inside `github.action_path` — no secrets, no network to third parties.
