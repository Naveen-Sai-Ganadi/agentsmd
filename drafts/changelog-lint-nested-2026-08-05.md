# Distribution draft — `lint --nested` (2026-08-05)

Do not post without explicit sign-off (decisions #10 / #11).

---

## Short (140 chars, for HN/Twitter reply)

`agentsmd lint --nested` — one command, every AGENTS.md in your
monorepo, one CI exit code. Union of issues, `--max-depth=N`. MIT.

---

## Medium (changelog / dev.to / Reddit r/ClaudeAI)

**`agentsmd lint --nested` — the same lint rules, applied to every
AGENTS.md in the tree.**

`agentsmd` already lints your root `AGENTS.md`: missing sections,
vague directives, unresolved `TODO`s, unsynced sibling configs, and
the folk-rule 200-line size budget from r/ClaudeCode + morphllm's
2026 field guide. In v0.1.0 that only ran against the file at the
repo root.

If you have a monorepo, that's almost never enough. OpenAI's own
repo carries 88 nested `AGENTS.md` files; Copilot CLI has an open
FR (`github/copilot-cli#1655`) asking for union-of-hierarchy
loading; VS Code Copilot has an open bug (`vscode#271489`) about
ignoring nested files entirely. Nearest-wins is now a baseline
expectation across every agent — but there was no way to *lint*
the pile from CI.

New in Unreleased:

```
agentsmd lint --nested .
agentsmd lint --nested . --max-depth=4 --json
```

- Discovers every `AGENTS.md` under `.` (same walker as `agentsmd
  tree` — skips `node_modules`, `dist`, dot-dirs, common build/cache
  dirs; `--max-depth=N` overrides the default 8).
- Runs the full lint rule set against each discovered file.
- Emits per-file issues + a rolled-up totals line
  (files / errors / warnings / info).
- Exits `1` when *any* nested file surfaces a lint `error` — drop
  it into GitHub Actions as-is.

Union semantics ("every issue counts") were the direct read of
`agentsmd/agents.md#53`, `anomalyco/opencode#7576`,
`copilot-cli#1655`, and the codegateway.dev 2026 monorepo playbook.

Next: `audit --nested` (per-file score + monorepo rollup) and
`check --nested` (CI gate that honors `--nested`). That trio ships
as **v0.1.1**.

---

## Long-form (blog post outline)

**Title:** "You have 12 CLAUDE.md files. Which one just failed CI?"

**Sections:**
1. Cold open — the 88-file OpenAI stat + a screenshot of `agentsmd
   tree` on a real monorepo.
2. Why the root-only lint is a lie in 2026 — cite copilot-cli#1655,
   vscode#271489, codex#12115, agents.md#53, opencode#7576.
3. `lint --nested` demo — 20 lines, per-file output, one exit code.
4. Design choice: union vs nearest — decision #15 reasoning.
5. Roadmap: `audit --nested` → `check --nested` → v0.1.1.
6. CTA: try it on your repo, open an issue with the tree count.
