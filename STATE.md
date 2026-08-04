# STATE — agentsmd

Last updated: 2026-08-04 (Phase 3, Day 6 post-v0.1.0 — `tree` command shipped as first vertical slice of monorepo mode; mono wedge uncontested for a 5th consecutive scan)

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
- 2026-08-01 — `version` / `--version` / `-v` CLI command shipped (commit `07f7996`, CI run #7 green). 3 new tests (38 passing total).
- 2026-08-02 — `agentsmd doctor` command shipped (commit `acdc61c`). Env + repo diagnostic, `--json`, exit 1 on failure. 5 new tests (43 passing total).
- 2026-08-03 — `long-file` lint rule + `structure`-dimension penalty shipped (commit `ce6d5ad`). 3 new tests (46 passing total). First lint tool in the market to encode the 200-line rule as a check.
- **2026-08-04 — `agentsmd tree` command shipped (first vertical slice of monorepo mode).** New `src/tree.ts` module exports `discoverNested()`, `nearestConfig()`, `buildTreeSummary()`, and `renderTree()`. Walks the repo (default max depth 8, `--max-depth=N` override), skips `node_modules`, `dist`, `build`, `out`, `.next`, `.turbo`, `.cache`, `coverage`, `target`, `.venv`, `venv`, `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.gradle`, `.idea`, `.vscode`, and every dot-directory. Text output indents each config by depth; `--json` emits a structured summary. `nearestConfig()` implements nearest-ancestor lookup — the primitive that `lint --nested`, `audit --nested`, `check --nested` will consume next. **6 new tests (52 passing total)**, tsc clean. README `## Commands` table + CHANGELOG "Unreleased" both updated; docs-consistency test extended to require `tree` in the README + CLI switch. Distribution draft: `drafts/changelog-tree-2026-08-04.md`. Research: `drafts/research-2026-08-04.md`. First concrete step on the last uncontested lane (5th-consecutive-scan competitor gap).
- 2026-07-29 — v0.1.0 TAGGED (roadmap #8, closes Phase 2 MVP). Annotated tag `v0.1.0` on `main` (commit `287c957`). GitHub Release: <https://github.com/Naveen-Sai-Ganadi/agentsmd/releases/tag/v0.1.0>.

## In progress
- Still waiting on Naveen's sign-off for **decision #10** (publish v0.1.0 to npm) and **decision #11** (post the launch draft).
- **Decision #12 (v0.1.1 focus) is confirmed `mono`** by 5 consecutive competitor scans + two dated 2026 signals of real demand (`agentsmd/agents.md#53`, `anomalyco/opencode#7576`). Today's `tree` command is the first concrete step; `lint --nested` / `check --nested` are the next two loop days.
- `version`, `doctor`, the 200-line `long-file` rule, and now `tree` are all on `main` as small dogfood-driven wins. All four roll into `0.1.1` alongside `--nested` for `lint` / `audit` / `check`.
- If "publish now" (decision #10) → single command: `npm publish --access public`. Version stays at `0.1.0` — the four Unreleased items bump to `0.1.1` when `--nested` ships.

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
8. Action distribution: keep the composite at repo root only, or add a marketplace listing after v0.1.0? (repo / market)
9. After v0.1.0, add `agentsmd import --from-agents-dir` to sync from `amtiYo/agents` `.agents/` layout too? (yes / no)
10. **PRIMARY** — Publish v0.1.0 to npm now, or hold until we have a first external star/issue? (now / hold)
11. Post the v0.1.0 Show HN draft (`drafts/launch-v0.1.0-2026-07-29.md`) today, or hold until after npm decision? (post / hold)
12. v0.1.1 focus: monorepo mode or the `drift` command? (mono / drift) — **Recommendation held: `mono`.** Today's `tree` ship is the first vertical slice; recommend collapsing this decision to "confirmed" unless Naveen disagrees.
13. Map the six `audit` dimensions 1:1 to GitHub's 2026-07-28 "2,500 repos" rubric in the README? (yes / no) — pure documentation work, ~1 hour, huge trust win.
14. When v0.1.1 ships, request GitHub Marketplace listing for the reusable Action? Blocks on decision #8 (repo / market) and needs a release image. (yes / no)
15. **NEW** — For `lint --nested`, apply lint rules to every discovered `AGENTS.md` (union of issues), or only the nearest ancestor of the changed files in a PR? (all / nearest) — codegateway.dev's 2026 playbook and the `long-file` rule both argue for `all`; the CI-latency argument is thin at monorepo scale we've seen so far.

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
- [x] `version` / `--version` / `-v` CLI command (2026-08-01, commit `07f7996`).
- [x] `doctor` command (2026-08-02, commit `acdc61c`).
- [x] `long-file` lint rule + `structure` audit penalty (2026-08-03, commit `ce6d5ad`).
- [x] `tree` command — nested `AGENTS.md` / `CLAUDE.md` discovery + `nearestConfig` primitive (2026-08-04).

### v0.1.1 remaining work (targeted for next 2-3 loop days)
- `lint --nested`: apply every lint rule to every nested `AGENTS.md` discovered by `tree`; aggregate report by relative path. Depends on decision #15 (all / nearest).
- `audit --nested`: per-file score + a rolled-up monorepo score.
- `check --nested`: CI gate honors `--nested` and fails when *any* discovered file breaches the gate.
- **Ship as v0.1.1** once nested `check` lands — bundles the last four Unreleased items.

### v0.2 candidates
- Swift/SwiftUI stack detection (decision #6).
- Aider `.aider.conf.yml` + Continue `.continuerc` sync targets (decision #4).
- `import --from-agents-dir` for `.agents/` layout (decision #9).
- `agentsmd drift` (decision #7).
- Frontmatter presence check (per codegateway.dev's 2026 playbook — progressive-disclosure lookup).

## Metrics
- Stars: 0 · Forks: 0 · Watchers: 0 · Open issues: 0 · Open PRs: 0 (unchanged since v0.1.0 — we haven't distributed yet)
- CI: green (last 8 runs on `main` all `success`; today's `tree` commit will be run #9 — expected green, tsc clean + 52/52 local pass)
- npm downloads: n/a (unpublished; **decision #10 is the gate**)
- Local test count: **52 passing**, 0 failing (+6 from today's `tree` tests)
- `agentsmd check .` on this repo (at v0.1.0): passed=true, grade=B, score=79
- Releases: **1** — `v0.1.0` (2026-07-29)

## Research log
- 2026-07-17: initial signals (see `drafts/research-2026-07-17.md`)
- 2026-07-20: monorepo CLAUDE.md sprawl and AGENTS.md/CLAUDE.md drift = top-two complaints.
- 2026-07-21: competitor scan — two sync-focused tools, none targeting lint/audit.
- 2026-07-22: 5 fresh signals confirming AGENTS.md momentum.
- 2026-07-26: 5 signals — `giacomo/agents-lint`, AgentLint marketplace action, `agentlinter.com` (hosted SaaS), Build-AGENTS.md-from-Skills action, Claude Code #6235 (5,200+ reactions). Two lint-competitors live.
- 2026-07-28: 5 signals — `GowayLee/agent-sync`, `amtiYo/agents`, `dallay/agentsync`, Claude Code #6235 at 5,270+ reactions, yurukusa gist. Sync commodifying.
- 2026-07-29: 5 signals — `earezki/agent-kit`, `codex.danielvaughan.com`, `morphllm.com` (60,000+ repos claim), `amux.io` monorepo guidance, `agentlinter.com` still no CI Action. Full log: `drafts/research-2026-07-29.md`.
- 2026-08-01: 5 signals — GitHub Blog "lessons from 2,500 AGENTS.md repos", `agent-sh/agnix`, `seojoonkim/agentlinter`, Harness.io "Agent-Native Repo", `HeadyZhang/agent-audit`. Full log: `drafts/research-2026-08-01.md`.
- 2026-08-02: 5 signals — morphllm 88-nested-files data, codegateway "monorepo templates", "AGENTS.md Field Guide 2026", `agentlint.app` (33 checks / single-file), morphllm Reddit aggregation. Full log: `drafts/research-2026-08-02.md`.
- 2026-08-03: 5 signals — XDA Developers "200-line CLAUDE.md was the worst decision", Anthropic 200-line guidance, GitHub Blog 2,500-repo rubric, `agnix` jumped to 444 rules (single-file only), `packmind/context-evaluator`. Full log: `drafts/research-2026-08-03.md`.
- **2026-08-04:** 5 signals — `agentsmd/agents.md#53` (spec-repo user asks about nested nearest-wins), `anomalyco/opencode#7576` (open FR for auto-selection of nested `AGENTS.md`), codegateway.dev 2026 Codex playbook (lookup order + monorepo templates + frontmatter progressive disclosure), `morphllm.com/agents-md-guide` (persistent thought-leader), Cem Karaca Medium (1,207-line CLAUDE.md = ~42k tokens per turn — direct 200-line-rule endorsement). Full log: `drafts/research-2026-08-04.md`. **Takeaway:** monorepo/nested lane still 100% uncontested (5th consecutive scan), and today produced the first two dated 2026 signals of *real user demand* for nearest-wins (not just our inference from OpenAI's 88 nested files). `tree` is the smallest possible bet on that wedge.

## Distribution drafts (do not post without approval)
- `drafts/launch-post-hn-2026-07-17.md`
- `drafts/changelog-sync-2026-07-20.md`
- `drafts/changelog-init-2026-07-21.md`
- `drafts/changelog-lint-audit-2026-07-22.md`
- `drafts/changelog-check-action-2026-07-26.md`
- `drafts/changelog-readme-contributing-2026-07-28.md`
- `drafts/launch-v0.1.0-2026-07-29.md` — Show HN post + 140-char reply + short-form changelog announcement.
- `drafts/positioning-vs-competitors-2026-08-01.md` — positioning against agnix / agentlinter / agent-audit wave.
- `drafts/changelog-doctor-2026-08-02.md` — short/medium/long-form for `doctor`.
- `drafts/changelog-long-file-2026-08-03.md` — short/medium/long-form for the 200-line rule.
- **`drafts/changelog-tree-2026-08-04.md`** — NEW: short/medium/long-form for `tree`. Positioning: "first concrete step on monorepo mode — the last uncontested lane."

## Leads
See `leads.md`. (Still empty — no external engagement yet.)

## Security-sensitive
- (none touched today) — `tree` performs bounded read-only directory walks (max depth 8 by default, hard-coded ignore list covers `node_modules`, `.git`, dot-dirs, build/cache dirs). No file *contents* are read, no network, no shell exec, no user-supplied input parsed beyond an integer `--max-depth` flag. Safe to ship without a security review. Note: the ignore list is currently non-configurable — flag for future review if a user requests a repo layout that shadows one of our ignored dir names (e.g., a real project package literally named `dist`).
