# Distribution draft — `agentsmd tree` (2026-08-04)

Do NOT post. Awaits Naveen's sign-off (decisions #10 and #11 still open).

Positioning: **first concrete step on monorepo mode — the last
uncontested lane in the AGENTS.md tool space.** Every named competitor
(agnix, agentlinter, agent-audit, agents-lint, agentlint.app,
packmind/context-evaluator) still ships single-file / repo-root only.
Even the canonical `agentsmd/agents.md` spec repo has an open user
question (#53) about which nested `AGENTS.md` should win.

## Short (Twitter / Bluesky / Mastodon, ≤280 chars)

Shipped `agentsmd tree`: one command to find every nested `AGENTS.md`
and `CLAUDE.md` in a monorepo, ignoring `node_modules` / `dist` / etc.
First step toward per-package lint + audit + CI-gate. Free, MIT, Node.
`npx agentsmd tree .`

## Medium (LinkedIn / DEV.to / short blog, ~150 words)

OpenAI's own repo carries 88 nested `AGENTS.md` files. Cursor, Codex,
Claude Code and Copilot all handle nesting slightly differently, and
`agentsmd/agents.md#53` shows even the spec's own users are unsure
which file wins where.

`agentsmd tree` (shipped today, on `main`) is the first step toward
fixing this from the CI side. One command walks your repo, skips the
usual noise (`node_modules`, `dist`, dot-dirs, common build/cache
folders), and prints an indented map of every nested `AGENTS.md` and
`CLAUDE.md`. `--json` for machine output. `--max-depth=N` if your
monorepo is deeper than 8.

Next up (v0.1.1): `agentsmd lint --nested` and `check --nested`, using
the same discovery + nearest-wins primitive so your CI gate fails when
the `packages/api/AGENTS.md` you rely on drifts.

## Long (Show HN / launch-post follow-up section)

### `agentsmd tree` — see your monorepo's agent-config layout in one command

If you work on a monorepo that has landed AGENTS.md (or is still
handing every agent CLAUDE.md), you have probably lost a few hours
this month to "which config actually applied here?" OpenAI's own repo
now carries 88 nested AGENTS.md files. Codex, Cursor, Claude Code and
Copilot each pick their governing file slightly differently — the
canonical `agentsmd/agents.md` spec deliberately leaves discovery up
to the consumer.

`agentsmd tree` is the smallest bet we can make on fixing this:

```
$ npx agentsmd tree .
tree — /Users/you/your-repo
  found: 4 AGENTS.md, 1 CLAUDE.md (max depth 3)
  - AGENTS.md  (AGENTS.md)
    - AGENTS.md  (packages/api/AGENTS.md)
    - CLAUDE.md  (packages/legacy/CLAUDE.md)
    - AGENTS.md  (packages/web/AGENTS.md)
      - AGENTS.md  (packages/web/plugins/AGENTS.md)
```

- Skips `node_modules`, `dist`, `build`, `out`, `.next`, `.turbo`,
  `.cache`, `coverage`, `target`, `.venv`, `venv`, `__pycache__`,
  `.pytest_cache`, `.mypy_cache`, `.gradle`, `.idea`, `.vscode`, and
  every hidden directory by default.
- `--max-depth=N` overrides the 8-level cap for absurdly deep trees.
- `--json` emits `{ root, configs, totalAgentsMd, totalClaudeMd,
  maxDepth }` for CI dashboards.

Under the hood it ships a `discoverNested()` + `nearestConfig()`
primitive — the same one that `agentsmd lint --nested`, `audit
--nested` and `check --nested` will call in v0.1.1 (targeted for next
week, per STATE.md decision #12 = `mono`). No competitor (agnix,
agentlinter, agent-audit, agents-lint, agentlint.app,
packmind/context-evaluator) currently ships nested support.

MIT, Node ≥22, `npm i -g agentsmd` (npm publish still gated on Naveen
— decision #10). Feedback and monorepo layouts to break it against
welcome on GitHub.
