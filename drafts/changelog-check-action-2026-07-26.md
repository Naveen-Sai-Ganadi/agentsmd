# v0.0.4 — `check` CI mode + reusable GitHub Action

**Do not post without Naveen's approval.**

## Changelog copy (for GitHub Release notes)

**Highlights**
- New `agentsmd check` command — combined lint + audit gate for CI. Exits non-zero when lint errors are present or the audit score falls below a configurable floor.
- Reusable GitHub Action at repo root. Drop it into any workflow to fail PRs on AGENTS.md drift.
- Renamed the old `check` (config-file detector) to `agentsmd detect`. Breaking, but v0 — no external users to break yet.

**New**
- `agentsmd check [path] [--min-grade=A|B|C|D|F] [--min-score=N] [--fail-on=error|warn|info] [--json]`
- `action.yml` composite action. Inputs: `path`, `min-grade`, `min-score`, `fail-on`, `node-version`, `version`. Outputs: `passed`, `grade`, `score`.
- Self-check job in our own CI pipeline dogfoods the action against this repo's AGENTS.md.
- 7 new tests in `tests/check.test.ts`. Total suite now 30 passing.

**Under the hood**
- New `src/check.ts` splits the CI gate into a pure `evaluateCheck(lint, audit, opts)` for easy testing and a `runCheck(root, opts)` runner.
- Enabled `allowImportingTsExtensions` + `rewriteRelativeImportExtensions` in tsconfig so tests can strip-import `../src/check.ts` directly under Node 24's stable strip-types.

**Roadmap**
- ✅ #6 `check` + reusable Action
- ⏭️ #7 README polish + contributing
- ⏭️ #8 tag v0.1.0

---

## Short launch copy (140-char reply, no fabricated numbers)

> shipped `agentsmd check` — one CI step that lints & scores your AGENTS.md and fails the PR when it drifts. reusable action, MIT. WIP; feedback welcome.

## HN-comment variant (in reply to threads about AGENTS.md/CLAUDE.md drift)

> If you're already treating `AGENTS.md` as canonical, the missing piece is usually a CI gate — otherwise the file quietly rots and reviewers stop trusting it. I've been building `agentsmd` (open source, MIT) around exactly that: `sync` propagates from AGENTS.md to CLAUDE.md/.cursorrules/copilot-instructions/.windsurfrules, `lint` catches TODOs and vague directives, and `check` runs both as a single CI step with a configurable grade floor. There's a reusable GitHub Action in the repo — happy to hear what's missing.

Do NOT post. Awaiting sign-off.
