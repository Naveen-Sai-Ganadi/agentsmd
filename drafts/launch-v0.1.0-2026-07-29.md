# v0.1.0 launch content — DO NOT POST WITHOUT APPROVAL

## GitHub release copy
Already published as the body of https://github.com/Naveen-Sai-Ganadi/agentsmd/releases/tag/v0.1.0 (CHANGELOG.md).

## HN "Show HN" post (draft)

**Title:** Show HN: agentsmd — one AGENTS.md, and a CI gate that fails when it rots

**Body:**

Every AI coding agent now reads its own config file: Claude Code reads
CLAUDE.md, Cursor reads .cursorrules (or .cursor/rules), Copilot reads
.github/copilot-instructions.md, Windsurf reads .windsurfrules, and the
new cross-tool spec is AGENTS.md. Keep more than one of these tools in
the same repo and you end up maintaining the same rules in five files
(Claude Code issue #6235, ~5,270 reactions and still open).

Sync-only tools have started to appear (agent-sync, agentsync,
agent-kit, amtiYo/agents). They solve half of it: they can render the
sibling files. What they can't do is tell you when your one source of
truth has quietly rotted — stale paths, missing sections, unlabeled
security notes, no test/build commands. That is what agentsmd v0.1.0
adds on top.

Six commands, zero runtime deps:
- `init`  — scaffold an AGENTS.md from a repo scan (stack detection).
- `sync`  — render CLAUDE.md / .cursorrules / copilot-instructions /
            .windsurfrules from AGENTS.md (dry-run by default).
- `lint`  — style/consistency errors + warnings.
- `audit` — 6-dimension scorecard (0–100, A–F) covering structure,
            coverage, examples, freshness, cross-refs, security.
- `check` — combined CI gate.
- Reusable GitHub Action: `Naveen-Sai-Ganadi/agentsmd@v0.1.0` — fails
  the PR if the audit slips below your minimum grade or the linter
  reports errors. Sync tools don't do this.

npm publish is being held one more turn (feedback first). For now:
`npx github:Naveen-Sai-Ganadi/agentsmd@v0.1.0 check .`

Repo: https://github.com/Naveen-Sai-Ganadi/agentsmd

Would love feedback on the audit dimensions and on whether monorepo
support (nested AGENTS.md, nearest-wins) belongs in v0.1.1 or v0.2.

## 140-char reply variant (for HN/X threads about #6235)

> Wrote agentsmd for exactly this. One AGENTS.md, syncs the four
> siblings, and a GitHub Action fails your PR when it drifts. v0.1.0
> today.
> https://github.com/Naveen-Sai-Ganadi/agentsmd

## Changelog announcement (short-form)

> agentsmd v0.1.0 is out. One AGENTS.md → CLAUDE.md, .cursorrules,
> .github/copilot-instructions.md, .windsurfrules — plus a lint +
> audit CI gate so drift fails the PR instead of quietly rotting the
> repo. MIT, zero runtime deps, Node ≥22.
> https://github.com/Naveen-Sai-Ganadi/agentsmd/releases/tag/v0.1.0
