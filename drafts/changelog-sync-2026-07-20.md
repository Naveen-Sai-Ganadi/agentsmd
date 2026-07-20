# DRAFT — sync command changelog / launch reply

**Status:** DRAFT. Do not post until Naveen approves and the repo is public-ready.
**Where to post:** as a reply on the next HN / Reddit thread that complains about `CLAUDE.md` vs `AGENTS.md` drift. Not a standalone launch — save the launch for v0.1.0.

---

Building a small tool for exactly this: `agentsmd`. One command:

```
agentsmd sync .
```

Treats `AGENTS.md` as the source of truth and previews the diff for `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, and `.windsurfrules`. `--apply` writes them. Every generated file gets an `agentsmd:generated` banner so reviewers can tell it apart from a hand-authored config.

Pre-alpha, TypeScript, no deps, MIT. Repo: https://github.com/Naveen-Sai-Ganadi/agentsmd

Would love to know: does the "AGENTS.md as canonical, everything else derived" model match how you'd want it, or do you actually maintain each file separately on purpose?

---

## Notes for Naveen before posting
- Confirm the repo is public and README quickstart still works.
- Don't post twice in the same subreddit within a week.
- Swap the question at the end if the parent thread is more specific than generic drift.
