# Frontmatter presence check — distribution drafts (2026-08-17)

> Status: DRAFT — do not post without Naveen's sign-off. Ships one lint rule family (`missing-frontmatter` / `invalid-frontmatter` / `empty-frontmatter`) plus a small `structure` audit bonus. First v0.2-candidate item to land after the v0.1.1 monorepo family.

---

## Short (Twitter/X, ≤ 280 chars)

New in `agentsmd`: `missing-frontmatter` lint rule. Your `AGENTS.md` should let an agent skim `title` / `description` / `updated` before loading 200 lines of context. codegateway 2026's progressive-disclosure pattern, now a one-command CI check.

---

## Medium (Show HN reply / Reddit r/ClaudeAI reply, 60–120 words)

`agentsmd` now lints for a leading YAML frontmatter block in `AGENTS.md`.

Three new rules:
- `missing-frontmatter` (info) — no `---` fence at line 1
- `invalid-frontmatter` (warn) — opens but never closes within 30 lines
- `empty-frontmatter` (info) — fenced block with no recognized keys (`title`, `description`, `updated`, `owner`, `version`)

The `structure` audit dimension awards +5 when a valid, keyed block is present. Rationale: progressive disclosure. Agents (and humans) can peek at what a config *is* without loading the whole file. Pattern popularized by codegateway.dev's 2026 Codex playbook.

---

## Long (blog / launch post, ~300 words) — RESERVED for the v0.1.1 launch reply

Every `AGENTS.md` in the wild starts the same way: the agent CLI loads the whole file just to figure out whether it's the right one. In a monorepo with 20+ packages, that's tens of thousands of tokens burned per turn before a single line of user code has been read.

The 2026 codegateway.dev Codex playbook proposed a fix borrowed from static-site generators: a YAML frontmatter block at the top of every `AGENTS.md` with a fixed set of metadata keys (`title`, `description`, `updated`, `owner`, `version`). An agent can now decide "is this the config I want?" in one 200-byte peek instead of a 15,000-byte load. Anthropic's morphllm field guide picked up the same pattern in July.

`agentsmd` now encodes this as three lint rules:

- `missing-frontmatter` (info) — no `---` at line 1. Points you at the pattern without failing CI.
- `invalid-frontmatter` (warn) — opens with `---` but never closes within 30 lines. Almost always a copy-paste bug; failing CI is fine here.
- `empty-frontmatter` (info) — fenced block with none of the recognized keys. Reminds you to fill it in instead of shipping a decorative fence.

The `structure` audit dimension awards +5 when a valid, keyed block is present — enough to nudge a B+ config to A- but never enough to hide a real problem.

Combined with the four `--nested` slices (`tree`, `lint`, `audit`, `check`), `agentsmd` is now the first tool that runs the frontmatter check *per package in a monorepo* and fails the weakest link. One binary. One CI job. Every agent config in the tree scored.

---

## Positioning line

> "Progressive disclosure for agent configs — check it in one command, roll it up across every package in your monorepo."

---

## Not for posting — internal note

- No competitor scan hit in today's research produced a frontmatter-aware `AGENTS.md` linter. `giacomo/agents-lint` still doesn't touch frontmatter. `agentlint.app` (33 checks) has no frontmatter rule as of today's snapshot. First-mover lane, small but real.
- This ships as v0.2-candidate material; safe to land on `main` under "Unreleased" without gating v0.1.1's tag (STATE.md decision #16 still governs the actual cut).
