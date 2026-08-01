# STATE — agentsmd

Last updated: 2026-08-01 (Phase 3, Day 3 post-v0.1.0 — `version` command shipped, competitor wave logged)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- Phase 1 research + proposals (2026-07-14)
- Phase 2 kick-off — repo scaffolded (2026-07-17)
- 2026-07-20 — `sync` command shipped (dry-run default, banner, 6 tests)
- 2026-07-21 — `init` command shipped (merge/blank modes, stack scan, 7 tests)
- 2026-07-22 — `lint` + `audit` shipped (6-dimension scorecard, 8 tests)
- 2026-07-26 — `check` CI mode + reusable GitHub Action shipped (roadmap #6)
- 2026-07-28 — README polish + `CONTRIBUTING.md` + docs-consistency tests (roadmap #7, 35 tests passing)
- **2026-08-01 — `version` / `--version` / `-v` CLI command shipped** (commit `07f7996`, CI run #7 green in 33s). Reads name+version from nearest `package.json`; `--json` for machine output. 3 new tests (38 passing total). CHANGELOG "Unreleased" entry added. First user-facing change since v0.1.0 tag.
- **2026-07-29 — v0.1.0 TAGGED (roadmap #8, closes Phase 2 MVP)**
  - `package.json` + `package-lock.json` bumped `0.0.1 → 0.1.0`.
  - `CHANGELOG.md` created — full Keep-a-Changelog entry for v0.1.0 covering all six commands + Action + docs-test suite + known v0.2 gaps.
  - Commit `287c957` on `main`. Annotated tag `v0.1.0` pushed to origin.
  - GitHub Release published: <https://github.com/Naveen-Sai-Ganadi/agentsmd/releases/tag/v0.1.0>
  - CI run #6 on the release commit: `success` in 37s (35 tests green, lint clean, build clean).
  - Dogfooded on the tag: `agentsmd check .` → passed=true, grade=B, score=79.

## In progress
- Still waiting on Naveen's sign-off for **decision #10** (publish v0.1.0 to npm) and **decision #11** (post the launch draft).
- **Decision #12 (v0.1.1 focus) is now urgent** — three real competitors landed in the same 7-day window as v0.1.0 (see Research log 2026-08-01). Recommend `mono` — see decisions section.
- Small quality-of-life gaps found while dogfooding — `version` command shipped today; `agentsmd doctor` (env + repo diagnostic) is a candidate for 0.1.1.
- If "publish now" (decision #10) → single command: `npm publish --access public` (repo already has `prepublishOnly: npm run build` and `files: ["dist", "README.md", "LICENSE"]`). Version stays at `0.1.0` — today's `version` command lands in the CHANGELOG "Unreleased" section and will bump to `0.1.1` when the next real feature ships.

## Blocked
- (none)

## Decisions needed (one-word answerable)
1. Publish name `agentsmd` on npm? (yes / rename)
2. Default `sync` behavior: keep `--apply` opt-in (safer), or flip to opt-out via `--dry-run`? (keep / flip)
3. `init` default: keep `merge` as default or flip to `blank`? (keep / flip)
4. Include Aider `.aider.conf.yml` and Continue `.continuerc` in v0.2? (yes / no)
5. `audit` grade floor for CI mode default (fail below C = 60)? (C / B)
6. Bump Swift/SwiftUI stack detection into v0.1 (was v0.2) after seeing `twostraws/SwiftAgents` traction? (yes / no) — moot for 0.1.0, keep for 0.1.1
7. Add `agentsmd drift` (stale-path/dead-script checker, à la `giacomo/agents-lint`) as a v0.2 command? (yes / no)
8. Action distribution: keep the composite at repo root only, or add a marketplace listing after v0.1.0? (repo / market) — **NOW ACTIONABLE**
9. After v0.1.0, add `agentsmd import --from-agents-dir` to sync from `amtiYo/agents` `.agents/` layout too? (yes / no)
10. **PRIMARY** — Publish v0.1.0 to npm now, or hold until we have a first external star/issue? (now / hold)
11. **NEW** — Post the v0.1.0 Show HN draft (`drafts/launch-v0.1.0-2026-07-29.md`) today, or hold until after npm decision? (post / hold)
12. **NEW** — v0.1.1 focus: monorepo mode (nested AGENTS.md, nearest-wins) or the `drift` command? (mono / drift)
    → **Recommendation: `mono`.** `agnix` and `agentlinter` both landed lint/rule-count stories this week; monorepo policy-as-code is our uncontested wedge. `drift` overlaps `agnix` more.
13. **NEW** — Map the six `audit` dimensions 1:1 to GitHub's 2026-07-28 "2,500 repos" rubric in the README? (yes / no) — pure documentation work, ~1 hour, huge trust win.
14. **NEW** — When v0.1.1 ships, request GitHub Marketplace listing for the reusable Action? Blocks on decision #8 (repo / market) and needs a release image. (yes / no)

## Roadmap
### v0.1.0 (2 weeks) — DONE
1. [x] Repo + scaffold (CI, TS, README, MIT, STATE.md)
2. [x] File detection engine (all 5 types)
3. [x] `sync` command — 2026-07-20
4. [x] `init` command — 2026-07-21
5. [x] `lint` + `audit` — 2026-07-22
6. [x] `check` CI mode + reusable GitHub Action — 2026-07-26
7. [x] README polish + quickstart + contributing — 2026-07-28
8. [x] **Tag v0.1.0 — 2026-07-29 ✓**

### Unreleased (already on `main`)
- [x] `version` / `--version` / `-v` CLI command (2026-08-01, commit `07f7996`) — will ship with the next tagged release.

### v0.1.1 candidates (pick one, awaiting decision #12 — recommend `mono`)
- **Monorepo mode:** nested `AGENTS.md` discovery + nearest-wins for `lint`/`audit`/`check`. Driven by amux.io + morphllm 2026 guidance that monorepos are the default AGENTS.md deployment shape. **Uncontested by the 2026-08-01 competitor wave.**
- `agentsmd drift`: stale path + dead script checker. Now overlaps `agnix` more directly after 2026-07-30 release.
- (stretch) `agentsmd doctor`: env + repo diagnostic (Node version, detected configs, banner presence, staleness). Small; would pair well with `version` from today.

### v0.2 candidates
- Swift/SwiftUI stack detection (decision #6).
- Aider `.aider.conf.yml` + Continue `.continuerc` sync targets (decision #4).
- `import --from-agents-dir` for `.agents/` layout (decision #9).

## Metrics
- Stars: 0 · Forks: 0 · Watchers: 0 · Open issues: 0 · Open PRs: 0 (unchanged since v0.1.0 — we haven't distributed yet)
- CI: green (last 7 runs on `main` all `success`; today's `version` commit #7 passed in 33s)
- npm downloads: n/a (unpublished; **decision #10 is the gate**)
- Local test count: **38 passing**, 0 failing (+3 from `version.test.ts`)
- `agentsmd check .` on this repo (at v0.1.0): passed=true, grade=B, score=79
- Releases: **1** — `v0.1.0` (2026-07-29)

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift = top-two complaints.
- 2026-07-21: competitor scan — two sync-focused tools, none targeting lint/audit.
- 2026-07-22: 5 fresh signals confirming AGENTS.md momentum.
- 2026-07-26: 5 signals — `giacomo/agents-lint`, AgentLint marketplace action, `agentlinter.com` (hosted SaaS), Build-AGENTS.md-from-Skills action, Claude Code #6235 (5,200+ reactions). Two lint-competitors live.
- 2026-07-28: 5 signals — `GowayLee/agent-sync`, `amtiYo/agents`, `dallay/agentsync`, Claude Code #6235 at 5,270+ reactions, yurukusa gist. Sync commodifying.
- **2026-07-29:** 5 signals — `earezki/agent-kit` (yet-another sync tool), `codex.danielvaughan.com` cross-tool portability post, `morphllm.com` spec guide (claims **60,000+ repos carry AGENTS.md** across Codex/Cursor/Copilot/Gemini/Aider/Windsurf/Zed), `amux.io` monorepo guidance (nested nearest-wins is the default), `agentlinter.com` still no CI Action. Full log: `drafts/research-2026-07-29.md`. **Takeaway:** sync side now has ~5 tools and is fully commodified; lint+audit+CI-gate niche is still uncontested. v0.1.0 planted the flag at the right moment.
- **2026-08-01:** 5 signals — GitHub Blog "lessons from 2,500 AGENTS.md repos" (official rubric now exists), `agent-sh/agnix` (new LSP+lint competitor), `seojoonkim/agentlinter` ("ESLint for AI Agents", 30 rules), Harness.io "Agent-Native Repo" post (enterprise legitimization), `HeadyZhang/agent-audit` (security-flavored CI gate on PyPI). Full log: `drafts/research-2026-08-01.md`. **Takeaway:** the lint/CI-gate lane went from uncontested to actively contested in one week. Our durable wedge narrows to (a) monorepo policy-as-code (favors decision #12 = `mono`) and (b) explicit alignment with the GitHub Blog rubric (decision #13). Positioning draft: `drafts/positioning-vs-competitors-2026-08-01.md`.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md`
- `drafts/changelog-init-2026-07-21.md`
- `drafts/changelog-lint-audit-2026-07-22.md`
- `drafts/changelog-check-action-2026-07-26.md`
- `drafts/changelog-readme-contributing-2026-07-28.md`
- **`drafts/launch-v0.1.0-2026-07-29.md`** — Show HN post + 140-char reply + short-form changelog announcement, all keyed to the "sync is commodifying, we're the only one that fails your PR" wedge.
- **`drafts/positioning-vs-competitors-2026-08-01.md`** — NEW: short/medium/long-form positioning against the 2026-08-01 competitor wave (agnix, agentlinter, agent-audit). Leads on CI gate + reusable Action as the durable diff.

## Leads
See `leads.md`. (Still empty — no external engagement yet.)

## Security-sensitive
- (none touched today) — `version` command only reads local `package.json` files by walking up from `dist/`. No network, no shell, no user input parsed. Safe to ship without a security review.
