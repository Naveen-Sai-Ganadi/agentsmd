# Draft — HN "Show HN" post (DO NOT POST without Naveen's sign-off)

**Title:** Show HN: agentsmd – one CLI to keep AGENTS.md, CLAUDE.md, .cursorrules in sync

**Body:**

Every AI coding tool wants its own config file. My repos ended up with 3–5 near-duplicate rule files (AGENTS.md, CLAUDE.md, .cursorrules, .github/copilot-instructions.md, .windsurfrules) that drift the moment anyone edits one.

agentsmd is a small Node CLI that treats AGENTS.md as the source of truth and keeps the others aligned:

- `agentsmd check` — detects which agent config files exist in a repo
- `agentsmd sync` — propagates AGENTS.md to the other formats (symlink / import / copy strategies)
- `agentsmd init` — scaffolds AGENTS.md from a repo scan
- `agentsmd lint` / `audit` — flags common quality issues and scores your file across 6 dimensions
- `agentsmd check --ci` — a GitHub Action so drift fails CI

Pre-alpha; `check` works today, the rest lands in v0.1.0 over the next two weeks. Would love thoughts on:

1. Is anyone happy with the current symlink workaround, or is a real tool overdue?
2. Which config files besides the big 5 should v0.2 cover? (Aider, Continue, Roo…)
3. Would you use `agentsmd check` in CI even without sync?

Repo: https://github.com/Naveen-Sai-Ganadi/agentsmd

---
_Notes for Naveen before posting:_
- Wait until v0.1.0 is tagged and README has a quickstart GIF. Show HN with a stub CLI usually gets clobbered.
- Consider posting Tue–Thu 9am ET.
- If npm name collides, update the install line before posting.
