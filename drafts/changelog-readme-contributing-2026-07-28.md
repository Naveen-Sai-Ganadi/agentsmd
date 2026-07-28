# Draft: v0.0.5 changelog + short-form variants (2026-07-28)

**Status:** DRAFT. Do NOT post without Naveen's explicit approval.

---

## Long form — GitHub release notes (v0.0.5)

### agentsmd v0.0.5 — README polish, CONTRIBUTING guide, docs-consistency tests

Docs cycle. No behavior changes.

**What's new**

- **README rewrite.** New "The problem" section shows the five-file drift concretely. Quickstart trimmed to a 30-second npx one-liner sequence. Command reference is now a table, not prose. Added a comparison matrix vs. `agents-lint`, AgentLint marketplace action, and `agentlinter.com`.
- **`CONTRIBUTING.md`.** Dev loop, project layout, conventions ("every command needs a test", "no new runtime deps until v0.2"), a checklist for adding a new command, and a checklist for adding a new `sync` target.
- **Docs-consistency tests (`tests/docs.test.ts`).** New tests fail CI if:
  - README stops referencing an implemented command,
  - CLI stops implementing a command referenced by README,
  - README's GitHub Action snippet drifts from `action.yml` inputs,
  - CONTRIBUTING.md is missing key sections,
  - README references a removed/renamed flag.

**Numbers**

- Tests: 35 passing (up from 30).
- `agentsmd check .` on this repo: `passed=true`, `grade=B`, `score=79`.
- CI: green.

**Next**

- v0.1.0 tag with the current command surface + docs.

---

## Short form — reply to `giacomo/agents-lint` or similar threads (140 chars)

> Just shipped agentsmd v0.0.5 — the only AGENTS.md tool that combines sync + lint + audit + a CI gate. Docs + CONTRIBUTING now landed.

## Short form — HN "Show HN" comment variant (draft for future launch)

> agentsmd is a single Node CLI + reusable GitHub Action that keeps AGENTS.md, CLAUDE.md, .cursorrules, .github/copilot-instructions.md, and .windsurfrules in sync from AGENTS.md as the source of truth, then lints and scores it, and fails your PR if it rots below a chosen grade. Symlink-based sync tools can't do the "fail the PR" part; that's the wedge. MIT, ~1k lines of TS, zero runtime deps.
