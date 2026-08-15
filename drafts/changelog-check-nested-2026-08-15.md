# Distribution draft — `check --nested` (2026-08-15)

**Do not post without Naveen's explicit sign-off.**

Positioning: fourth and final vertical slice of monorepo mode; closes v0.1.1. The story is now "one CI command scores every AGENTS.md in the tree and fails the build on the weakest link."

---

## Short-form (140 chars, for X/Bluesky/HN reply)

> `agentsmd check --nested` — one CI gate for every AGENTS.md in your monorepo. Weakest file fails the build. Zero deps, MIT.

## Medium-form (changelog blurb, ~80 words)

> **`agentsmd check --nested`** is live. Point it at a monorepo root and it runs the full lint + audit gate against every discovered `AGENTS.md` — per-package pass/fail lines call out exactly which package to fix, and a rolled-up `overall` / `lowest` line surfaces the two numbers a CI gate actually needs (typical health vs. weakest link). Non-zero exit when *any* file breaches your `--min-grade` / `--fail-on` gate. Ships alongside `tree`, `lint --nested`, `audit --nested` — monorepo mode is now complete.

## Long-form (blog / v0.1.1 launch reply, ~350 words)

> ### What changes in v0.1.1

> If you have twelve `AGENTS.md` files spread across a monorepo, three things are true at once:
>
> 1. Your coding agents use the *nearest* one when they edit a file (this is how Codex, Cursor, Copilot, Zed, and most Claude Code setups now work — Copilot CLI is still catching up in [#3051](https://github.com/github/copilot-cli/issues/3051)).
> 2. Nobody scores all of them. Existing linters check one file at a time.
> 3. The weakest file is the one that costs you an incident — the package with the drifted build command, the stale test path, the 1,200-line context bloat.
>
> `agentsmd check --nested` fixes the third one.
>
> Point it at your repo:
>
> ```sh
> npx agentsmd check . --nested --min-grade=B
> ```
>
> It walks the tree (skipping `node_modules`, `dist`, dot-dirs, and the usual caches — same walker as `agentsmd tree`), runs the six-dimension audit and the full lint rule set against every discovered `AGENTS.md`, then evaluates the CI gate per file. Per-package `PASS ✓` / `FAIL ✗` lines tell you exactly which package to fix. Two roll-up numbers land on the summary line: `overall` (mean per-file score — typical health) and `lowest` (worst per-file score — the weakest-link number CI gates should key off).
>
> Weakest-link semantics: the monorepo fails when **any** nested file breaches the gate. That's the pattern the 2026 "lean root + per-package" playbooks ([DEV / Nishil Bhave](https://dev.to/nishilbhave/claudemd-best-practices-the-complete-2026-guide-435j), [Low/Code monorepo guide](https://www.lowcode.agency/blog/claude-code-monorepo)) have been converging on.
>
> Add `--json` for CI wiring; `--max-depth=N` to bound traversal; `--fail-on=warn` when you want a stricter gate.
>
> This closes monorepo mode. Discovery (`tree`), linting (`lint --nested`), scoring (`audit --nested`), gating (`check --nested`) — one binary, MIT, no runtime dependencies, no hosted SaaS. `v0.1.1` bundles all six Unreleased items when we publish.

---

## Reserved for launch

The long-form section above is reserved for the `v0.1.1` release notes / Show HN reply.
