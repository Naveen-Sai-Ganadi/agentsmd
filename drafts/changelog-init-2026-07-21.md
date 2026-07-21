# Draft — v0.0.2 changelog / short-form announcement (do NOT post without approval)

## Suggested venues
- GitHub release notes (once tagged)
- One-line reply on the Ralphable "config war" comment thread, only if someone asks "how do I bootstrap AGENTS.md?"

## Draft copy (140 chars)

> agentsmd now scaffolds AGENTS.md for you: `agentsmd init .` merges any existing CLAUDE.md/.cursorrules/.windsurfrules into a single source-of-truth file. Dry-run by default. https://github.com/Naveen-Sai-Ganadi/agentsmd

## Draft copy (long, for release notes)

**v0.0.2 — `init` command**

`agentsmd init [path]` scaffolds an `AGENTS.md` from a repo scan.

- **Merge mode (default):** folds any pre-existing `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, and `.windsurfrules` into one file, under a `## Merged existing rules` section for you to dedupe.
- **Blank mode (`--blank`):** starts fresh with a conventions template.
- **Dry-run by default:** prints the first 40 lines of the proposed file. Add `--apply` to write.
- **Won't clobber:** refuses if `AGENTS.md` already exists. `--force --apply` overrides.
- **Stack detection:** notes Node/TypeScript/Python/Rust/Go/Ruby in the scaffolded Stack section.
- 7 new tests (16 total, all green).

Next up: `lint` + `audit` — the actual differentiator vs. the sync-only tools that already exist.

## Notes for Naveen before posting

- Two other sync tools showed up in today's research (spxrogers/agentsync, amtiYo/agents). We should read them before positioning `agentsmd` as "the" solution.
- The 140-char copy above is safe to post because it makes no comparative claim.
