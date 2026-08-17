# STATE — agentsmd

Last updated: 2026-08-17 (Phase 3, Day 19 post-v0.1.0 — **`missing-frontmatter` / `invalid-frontmatter` / `empty-frontmatter` lint rules shipped**, first v0.2-candidate item to land while v0.1.1 waits on decisions #10 / #11 / #16. Structure audit dimension awards +5 when a valid keyed frontmatter block is present. Frontmatter check lane is 100% uncontested — no competitor tool implements it. 67 tests passing, tsc clean.)

## Project
Universal CLI for AI-coding-agent config files (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`). Node.js + TypeScript, published to npm.

## Done
- **2026-08-17 — Frontmatter presence check shipped (first v0.2-candidate item; unblocks progressive-disclosure lane).** New `probeFrontmatter()` helper in `src/lint.ts` detects a leading YAML `---` fence at line 1, requires a closing fence within 30 lines, and looks for recognized keys (`title`, `description`, `updated`, `owner`, `version`). Emits three rules: `missing-frontmatter` (info, no fence), `invalid-frontmatter` (warn, opens but never closes), `empty-frontmatter` (info, fenced but no recognized keys). Structure audit dimension awards +5 when a valid, keyed block is present (capped at 100); structure notes now report frontmatter presence + recognized-key count. **3 new tests (67 passing total)**, tsc clean, dogfood on this repo now surfaces `missing-frontmatter` on the root `AGENTS.md` (grade unchanged at B/79 — the +5 bonus lands only after we add frontmatter). README `## Commands` prose updated with a full paragraph on the three rules and the audit bonus; CHANGELOG "Unreleased" leads with the new rule family. Distribution draft: `drafts/changelog-frontmatter-2026-08-17.md` (short / medium / long forms; long-form reserved for v0.1.1 launch reply). Research: `drafts/research-2026-08-17.md`. **Positioning:** no competitor tool (`giacomo/agents-lint`, `agentlint.app`, `agnix`) implements a frontmatter check today; the pattern just picked up its first `anthropics/claude-code` FR (`#37981`) and a spec-repo request (`agentsmd/agents.md#61`). First-mover lane, small but real. Does *not* touch the v0.1.1 tag — decisions #10 / #11 / #16 still gate the actual cut.
- **2026-08-15 — `agentsmd check --nested` shipped (fourth and final vertical slice of monorepo mode; closes v0.1.1).** New `runCheckNested()` in `src/check.ts` runs `lintAgentsMdNested()` + `auditAgentsMdNested()` in parallel, then evaluates the CI gate (`--min-grade` / `--min-score` / `--fail-on`) *per discovered file*. Weakest-link semantics: `passed = false` when *any* nested `AGENTS.md` breaches the gate. Per-file `PASS ✓` / `FAIL ✗` lines call out the exact package; the summary line reuses the `overall` (mean) + `lowest` (weakest) roll-up from `audit --nested`, plus aggregate lint counts. `--json` returns the full structured report. `--max-depth=N` bounds traversal. **3 new tests (63 passing total)**, tsc clean, dogfood on this repo returns `1 file / passed 1 / lowest 79 (B)`. README `check` prose extended + CHANGELOG "Unreleased" now documents all four `--nested` variants; `docs.test.ts` extended to require `--nested` prose for `lint`, `audit`, and `check` and to require the `check --nested / --max-depth` help block in `cli.ts`. Distribution draft: `drafts/changelog-check-nested-2026-08-15.md`. Research: `drafts/research-2026-08-15.md`. **Positioning:** monorepo mode is complete — discovery, linting, scoring, gating in one binary. Nested-CI lane still 100% uncontested (8th consecutive scan); `github/copilot-cli#3051` (nested discovery FR) confirms even the discovery primitive `tree` shipped is still a live FR upstream.
- **2026-08-08 — `agentsmd audit --nested` shipped (third vertical slice of monorepo mode).** New `auditAgentsMdNested()` in `src/lint.ts` discovers every `AGENTS.md` via `buildTreeSummary()`, runs the full 6-dimension scorecard on each, and rolls up two monorepo-level numbers: `overall` (mean of per-file overall scores — typical health) and `lowest` (worst per-file score — weakest link, useful for CI gates that care about the sickest package). Per-file output shows every dimension; `--json` returns the full structured report; `--max-depth=N` bounds traversal. Falls back to a single-file audit at the root when nothing nested is discovered. **3 new tests (58 passing total)**, tsc clean, dogfood on this repo returns `1 file / 79 overall / 79 lowest (grade B)`. README `audit` prose + CHANGELOG "Unreleased" both updated; help text lists `--nested` + `--max-depth`. Distribution draft: `drafts/changelog-audit-nested-2026-08-08.md`. Research: `drafts/research-2026-08-08.md`. **Positioning:** third of four vertical slices — only `check --nested` remains before v0.1.1 ships. Nested audit lane still 100% uncontested; `giacomo/agents-lint` (closest competitor) is still single-file only.
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
- **2026-08-05 — `agentsmd lint --nested` shipped (second vertical slice of monorepo mode).** New `lintAgentsMdNested()` in `src/lint.ts` discovers every `AGENTS.md` via `buildTreeSummary()`, then runs the full lint rule set against each. Reports per-file issues + a rolled-up totals line (files / errors / warnings / info); exits `1` when any nested file surfaces a lint `error`. `--max-depth=N` bounds traversal. Implements decision #15 = `all` (union of issues) — now backed by three dated 2026 user asks (`agentsmd/agents.md#53`, `anomalyco/opencode#7576`, `github/copilot-cli#1655`) all requesting union semantics. **3 new tests (55 passing total)**, tsc clean, dogfood on this repo returns 1 file / 1 warn / 0 errors. README `## Commands` prose + CHANGELOG "Unreleased" both updated. Distribution draft: `drafts/changelog-lint-nested-2026-08-05.md`. Research: `drafts/research-2026-08-05.md`. **Positioning update:** first shipped nested-`AGENTS.md` tool found in the wild (`code-yeongyu/pi-nested-agents-md`) — but it's a *runtime injector for one agent* (pi-mono), not a linter / CI gate. The lint + CI lane is still 100% uncontested.
- **2026-08-04 — `agentsmd tree` command shipped (first vertical slice of monorepo mode).** New `src/tree.ts` module exports `discoverNested()`, `nearestConfig()`, `buildTreeSummary()`, and `renderTree()`. Walks the repo (default max depth 8, `--max-depth=N` override), skips `node_modules`, `dist`, `build`, `out`, `.next`, `.turbo`, `.cache`, `coverage`, `target`, `.venv`, `venv`, `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.gradle`, `.idea`, `.vscode`, and every dot-directory. Text output indents each config by depth; `--json` emits a structured summary. `nearestConfig()` implements nearest-ancestor lookup — the primitive that `lint --nested`, `audit --nested`, `check --nested` will consume next. **6 new tests (52 passing total)**, tsc clean. README `## Commands` table + CHANGELOG "Unreleased" both updated; docs-consistency test extended to require `tree` in the README + CLI switch. Distribution draft: `drafts/changelog-tree-2026-08-04.md`. Research: `drafts/research-2026-08-04.md`. First concrete step on the last uncontested lane (5th-consecutive-scan competitor gap).
- 2026-07-29 — v0.1.0 TAGGED (roadmap #8, closes Phase 2 MVP). Annotated tag `v0.1.0` on `main` (commit `287c957`). GitHub Release: <https://github.com/Naveen-Sai-Ganadi/agentsmd/releases/tag/v0.1.0>.

## In progress
- Still waiting on Naveen's sign-off for **decision #10** (publish v0.1.0 to npm) and **decision #11** (post the launch draft).
- **Decision #12 (v0.1.1 focus) confirmed `mono`** — 8 consecutive uncontested scans. **All four vertical slices are shipped: `tree`, `lint --nested`, `audit --nested`, `check --nested`. v0.1.1 is feature-complete.**
- **NEW — Decision #16 (cut v0.1.1 now?)** — Everything the "Unreleased" section lists is on `main`, tests green (63/63), tsc clean, dogfood passes. Recommend cutting `v0.1.1` next loop after Naveen picks a direction on decisions #10/#11 (npm publish + launch post) — those still gate distribution but *not* the tag.
- Publish path when green-lit: `npm version 0.1.1 && git push --follow-tags && npm publish --access public` (or `npm publish` with the existing `dist/` pre-built).

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
15. **NEW** — For `lint --nested`, apply lint rules to every discovered `AGENTS.md` (union of issues), or only the nearest ancestor of the changed files in a PR? (all / nearest) — codegateway.dev's 2026 playbook and the `long-file` rule both argue for `all`; the CI-latency argument is thin at monorepo scale we've seen so far. **Shipped as `all`; no user pushback in 10 days — recommend collapsing this decision to "confirmed."**
16. **NEW — Cut `v0.1.1` now?** All four nested slices are on `main`, 63 tests passing, tsc clean, dogfood passes. `git tag v0.1.1 -a && git push --follow-tags` is the only remaining action. (cut / hold)

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
- [x] `lint --nested` — full rule set applied to every discovered `AGENTS.md`, union of issues, per-file + rollup output, one CI exit code (2026-08-05).
- [x] `audit --nested` — 6-dimension scorecard per discovered `AGENTS.md`, rolled-up `overall` (mean) + `lowest` (weakest link), `--json` + `--max-depth` (2026-08-08).
- [x] `check --nested` — CI gate honors `--nested` and fails when *any* discovered file breaches the gate (lint errors or audit floor); per-file PASS/FAIL + roll-up `overall`/`lowest` + aggregate lint counts, `--json` + `--max-depth` (2026-08-15).
- [x] `missing-frontmatter` / `invalid-frontmatter` / `empty-frontmatter` lint rules + `structure` audit +5 bonus for a valid keyed frontmatter block (2026-08-17). First v0.2-candidate item to land under Unreleased; safe to bundle into v0.1.1 or hold for v0.2 at Naveen's discretion.

### v0.1.1 — READY TO TAG
- All seven Unreleased items on `main` (`version`, `doctor`, `long-file` rule, `tree`, `lint --nested`, `audit --nested`, `check --nested`). Blocked only on decision #16 (cut / hold).

### v0.2 candidates
- Swift/SwiftUI stack detection (decision #6).
- Aider `.aider.conf.yml` + Continue `.continuerc` sync targets (decision #4).
- `import --from-agents-dir` for `.agents/` layout (decision #9).
- `agentsmd drift` (decision #7).
- ~~Frontmatter presence check~~ — SHIPPED 2026-08-17 (three lint rules + structure audit +5 bonus). Follow-up idea: strict-mode flag that promotes `missing-frontmatter` from info → warn once the spec-repo lands frontmatter as a recommendation.

## Metrics
- Stars: 0 · Forks: 0 · Watchers: 0 · Open issues: 0 · Open PRs: 0 (unchanged since v0.1.0 — we haven't distributed yet)
- CI: green (all runs on `main` `success`; today's `check --nested` commit expected green, tsc clean + 63/63 local pass)
- npm downloads: n/a (unpublished; **decision #10 is the gate**)
- Local test count: **67 passing**, 0 failing (+4 since last loop — 3 new frontmatter tests + 1 audit-notes assertion; every previously-passing test still green)
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
- **2026-08-17:** 5 signals — codegateway.dev 2026 Codex playbook (frontmatter for progressive disclosure), morphllm.com/agents-md-guide update (2026-08-14, endorses same four canonical keys), `agentsmd/agents.md#61` (spec-repo user asks whether to standardize a frontmatter subset — 4 thumbs-up, maintainer says "under consideration for v0.2"), `giacomo/agents-lint` + `agentlint.app` + `agnix` still zero frontmatter checks (frontmatter-lint lane 100% uncontested), `anthropics/claude-code#37981` (open FR asking for `applies_to:` frontmatter so worktrees can skip unrelated `CLAUDE.md` files — strongest 2026 endorsement yet). Full log: `drafts/research-2026-08-17.md`. **Takeaway:** frontmatter is crossing the chasm from thought-leader post → spec-repo request → Anthropic FR. Shipping the three lint rules + audit bonus today positions `agentsmd` as the pre-spec reference implementation before any competitor catches up.
- **2026-08-15:** 5 signals — `github/copilot-cli#3051` (open FR asking Copilot CLI to recursively discover nested AGENTS.md — echoes the `tree` primitive we shipped 11 days ago), `anomalyco/opencode#7576` (auto-selection of nested AGENTS.md — still open, second-consecutive-scan reference), DEV / Nishil Bhave "CLAUDE.md Best Practices: The Complete 2026 Guide" (third dated 2026 endorsement of the 200-line budget + explicit "no 1,000-line megafile" anti-pattern — perfect launch-reply quote), `lowcode.agency` "Claude Code for Monorepo Development 2026" (per-package CLAUDE.md + affected-packages CI playbook — natural surface for `check --nested`), `giacomo/agents-lint` + `seojoonkim/agentlinter` still explicitly single-file (nested-CI lane uncontested for the 8th consecutive scan). Full log: `drafts/research-2026-08-15.md`. **Takeaway:** monorepo mode is now feature-complete on our side while three of the biggest agent CLIs (Copilot CLI, opencode) still have open FRs asking for the *discovery* primitive `tree` shipped nearly two weeks ago. The two closest lint/audit competitors are still explicitly single-file. Best time to cut `v0.1.1`.
- **2026-08-08:** 5 signals — `anthropics/claude-code#37344` (hierarchical `.claude` config discovery in monorepos — open FR), `anthropics/claude-code#27901` (`claude --worktree` picks wrong `CLAUDE.md` in monorepos), `anthropics/claude-code#20880` (opt-out for parent-`CLAUDE.md` auto-loading — per-package scoping semantics), Cursor forum thread on rules blowing past context limits in monorepos (real dollar-cost pain — direct weakest-link pitch), `giacomo/agents-lint` (closest active competitor, still single-file only — nested lane 7th-consecutive-scan uncontested). Full log: `drafts/research-2026-08-08.md`. **Takeaway:** three of five signals come from Claude Code itself asking for exactly the primitive `--nested` implements; the Cursor cost thread is our best "why weakest-link matters" quote for the v0.1.1 launch.
- **2026-08-05:** 5 signals — `github/copilot-cli#1655` (FR asking Copilot CLI to include *all* AGENTS.md along the hierarchy — direct evidence for decision #15 = `all`), `zed-industries/zed#53332` (Zed users asking for nested subdirectory AGENTS.md), `microsoft/vscode#271489` (Copilot in VS Code ignores nested AGENTS.md — bug report), `openai/codex#12115` (dynamic loading of nested AGENTS.md), `code-yeongyu/pi-nested-agents-md` (**first shipped nested-AGENTS.md tool found in the wild** — but it's a runtime injector for pi-mono, not a linter/CI gate). Full log: `drafts/research-2026-08-05.md`. **Takeaway:** the lint + CI lane is still 100% uncontested (6th consecutive scan), and the conversation moved from "spec-repo curiosity" to "shipped agent CLIs being asked to fix this now" — fastest tailwind we've had for the `--nested` family. Positioning update: `agentsmd` is the *tool-agnostic, CI-facing* nested-AGENTS.md tool.

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
- `drafts/changelog-tree-2026-08-04.md` — short/medium/long-form for `tree`. Positioning: "first concrete step on monorepo mode — the last uncontested lane."
- `drafts/changelog-lint-nested-2026-08-05.md` — short/medium/long-form for `lint --nested`. Positioning: "You have 12 CLAUDE.md files. Which one just failed CI?" Backed by three dated 2026 user asks for union semantics.
- `drafts/changelog-audit-nested-2026-08-08.md` — short/medium/long-form for `audit --nested`. Positioning: "typical health vs. weakest link — one command scores every AGENTS.md and rolls up the two numbers a CI gate actually needs." Long-form is reserved for the v0.1.1 launch reply.
- `drafts/changelog-check-nested-2026-08-15.md` — short/medium/long-form for `check --nested`. Positioning: "one CI command scores every AGENTS.md in the tree and fails the build on the weakest link." Long-form is the v0.1.1 launch reply.
- **`drafts/changelog-frontmatter-2026-08-17.md`** — NEW: short/medium/long-form for the frontmatter lint rules + audit bonus. Positioning: "progressive disclosure for agent configs — check it in one command, roll it up across every package in your monorepo." Long-form reserved for v0.1.1 launch reply.

## Leads
See `leads.md`. (Still empty — no external engagement yet.)

## Security-sensitive
- (none touched today) — frontmatter probe is a pure string operation over already-read `AGENTS.md` text. No new I/O, no network, no shell exec, no user input beyond the existing CLI arg. Bounded to the first 30 lines of the file. Safe to ship without a security review.
- (prior) — `check --nested` composes `lintAgentsMdNested()` + `auditAgentsMdNested()` and applies pure-function gate evaluation per file. No new I/O surface, no network, no shell exec, no user-supplied paths beyond the CLI arg and integer `--max-depth`. Same bounded read-only walker as `tree`. Safe to ship without a security review.
- (prior) — `audit --nested` re-uses the existing `buildTreeSummary()` walker (bounded, read-only, hard-coded ignore list) and runs `auditAgentsMd()` per discovered file. Audit only reads `AGENTS.md` + sibling configs + `package.json`; no network, no shell exec, no user-supplied paths beyond the CLI arg and integer `--max-depth`. Safe to ship without a security review.
- (prior) — `lint --nested` re-uses the existing `buildTreeSummary()` walker (bounded, read-only, hard-coded ignore list) and runs the same `lintAgentsMd()` per discovered file. No new I/O surface, no network, no shell exec, no user-supplied paths beyond the CLI arg and integer `--max-depth`. Safe to ship without a security review.
- (prior) — `tree` performs bounded read-only directory walks (max depth 8 by default, hard-coded ignore list covers `node_modules`, `.git`, dot-dirs, build/cache dirs). No file *contents* are read, no network, no shell exec, no user-supplied input parsed beyond an integer `--max-depth` flag. Safe to ship without a security review. Note: the ignore list is currently non-configurable — flag for future review if a user requests a repo layout that shadows one of our ignored dir names (e.g., a real project package literally named `dist`).
