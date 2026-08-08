# Distribution draft — `agentsmd audit --nested` (2026-08-08)

**Do not post.** Awaiting Naveen's sign-off.

---

## Short-form (tweet / Bluesky / LinkedIn one-liner, ≤240 chars)

`agentsmd audit --nested` — one command scores every `AGENTS.md` in your monorepo on 6 dimensions, then rolls up two numbers: `overall` (typical health) and `lowest` (weakest link — the package that will silently bleed context in every session).

---

## Medium-form (changelog card / release-notes bullet)

**New in `agentsmd`: `audit --nested`.**

Runs the 6-dimension quality scorecard (completeness, specificity, structure, length, freshness, consistency) against every `AGENTS.md` discovered in your repo tree, then rolls up two monorepo-level numbers:

- **`overall`** — mean of per-file scores. Answer to "how healthy is our config as a whole?"
- **`lowest`** — worst per-file score. Answer to "which package is bleeding context on every session?"

Per-file output shows each dimension for each discovered file; `--json` returns the full structured report. `--max-depth=N` bounds traversal (default 8; skips `node_modules`, `dist`, dot-directories, and common build/cache dirs).

Pairs with `agentsmd tree` and `agentsmd lint --nested`. Third of four vertical slices of monorepo mode — `check --nested` is the last piece before v0.1.1 ships.

```sh
$ agentsmd audit --nested .
audit --nested — /repo
  files: 4, overall: 71/100 (grade C), lowest: 42/100
  AGENTS.md — 82/100 (grade B)
    - completeness  100/100
    - specificity    80/100
    ...
  packages/web/AGENTS.md — 42/100 (grade D)   ← weakest link
    ...
```

---

## Long-form (Show HN reply / dev blog paragraph — reserve for v0.1.1 launch)

Anthropic's own 2026 review of 2,500 `AGENTS.md` repos, the codegateway 2026 Codex playbook, morphllm's 88-nested-files data, and multiple open FRs on Claude Code (#37344, #27901, #20880), Copilot CLI (#1655), Zed (#53332), VS Code (#271489), and OpenAI Codex (#12115) all point at the same wound: **agent config in a monorepo is a per-package problem, but every shipped tool treats it as a single-file problem.**

`agentsmd audit --nested` is the smallest useful primitive for that world. It runs the 6-dimension scorecard on every discovered `AGENTS.md`, gives you per-package scores, and rolls up two numbers a CI gate can actually key off of: the *mean* (are we drifting overall?) and the *lowest* (do we have a package that's bleeding 40k tokens of stale rules every session, à la the recent Cursor forum thread on unscoped rule loading?).

Combined with `agentsmd lint --nested` and the upcoming `agentsmd check --nested`, this is monorepo mode. Not a runtime injector for one agent — a tool-agnostic, CI-facing lint + audit + gate for the whole `AGENTS.md` family.

Roadmap: `check --nested` next loop day, then cut v0.1.1.
