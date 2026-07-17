# STATE — agentsmd

Last updated: 2026-07-17 (Phase 2, Day 1 of build)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17):
  - TypeScript project, strict tsconfig, npm scripts (build/lint/test)
  - `src/detect.ts` — detection engine for all 5 config file types
  - `src/cli.ts` — CLI entry with functional `check` command; `init`/`sync`/`lint`/`audit` stubbed
  - `tests/detect.test.ts` — 3 tests (empty dir, dual detection, nested copilot-instructions), all green
  - GitHub Actions CI (Node 20 & 22 matrix: lint + build + test)
  - README, MIT LICENSE, AGENTS.md (self-hosting the tool's own concept), .gitignore
  - STATE.md moved into the repo

## In progress
- Roadmap item #2: real detection wired to `check` command (this ships in the initial commit — file-detection engine + CLI plumbing complete). Next roadmap item queued: `sync` command.

## Blocked
- (none)

## Decisions needed
1. Publish name `agentsmd` on npm? (yes / rename) — reserving on npm not yet done
2. Bundle a `--dry-run` flag by default for `sync`? (yes / no)
3. Include Aider's `.aider.conf.yml` and Continue's `.continuerc` in v0.2? (yes / no)

## Roadmap (v0.1.0, 2 weeks)
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [ ] `sync` command (AGENTS.md as source of truth)
4. [ ] `init` command (scaffold AGENTS.md from repo scan)
5. [ ] `lint` + `audit` (6-dimension scorecard)
6. [ ] `check` CI mode + reusable GitHub Action
7. [ ] README polish + quickstart + contributing
8. [ ] Tag v0.1.0

## Metrics
- Stars: 0 (repo just created)
- CI: green on first push (target)
- npm downloads: n/a (unpublished)

## Research log
- 2026-07-17: HN thread on "AGENTS.md is the new .env.example" (search pending — see drafts/research-2026-07-17.md)
- 2026-07-17: r/ClaudeCode discussion of CLAUDE.md sprawl across monorepos
- 2026-07-17: OpenAI Codex CLI now reads AGENTS.md natively (docs update noted)
- 2026-07-17: Cursor "Rules for AI" feature getting per-directory nesting (Reddit r/cursor)
- 2026-07-17: GitHub Copilot workspace instructions doc updated to reference `.github/copilot-instructions.md`
  → Detailed links + summaries in `drafts/research-2026-07-17.md`

## Leads
See `leads.md`.
