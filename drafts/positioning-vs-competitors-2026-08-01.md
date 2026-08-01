# Distribution draft — 2026-08-01

**Purpose:** short positioning post for HN comment / Reddit reply / Twitter thread,
now that three real competitors have appeared in the "AGENTS.md linter" lane in
the same week we tagged v0.1.0. Do NOT post without Naveen's sign-off.

---

## Short form (140–200 chars, for thread replies)

> agentsmd is the piece the new AGENTS.md linters are missing: a reusable
> GitHub Action that fails the PR on a grade floor, not just an editor
> squiggle. `uses: Naveen-Sai-Ganadi/agentsmd@v0.1.0` — one line, C-grade
> default.

## Medium form (Show HN comment / Reddit reply)

> **Why one more AGENTS.md tool?**
>
> The last week shipped three good linters — `agnix` (LSP-flavored),
> `agentlinter` (ESLint-flavored, 30 rules), `agent-audit` (security angle).
> They all stop at "here's a rule violation."
>
> `agentsmd` is opinionated about the next step: **your CI fails the PR when
> your AGENTS.md drops below a grade floor.** Six audit dimensions (clarity,
> coverage, structure, examples, guardrails, freshness), one letter grade,
> one exit code. Ships as a reusable GitHub Action:
>
> ```yaml
> - uses: Naveen-Sai-Ganadi/agentsmd@v0.1.0
>   with:
>     min-grade: B
>     fail-on: warn
> ```
>
> Same tool also does `sync` (one AGENTS.md → CLAUDE.md, .cursorrules,
> copilot-instructions, .windsurfrules with a "managed by agentsmd" banner)
> and `init` (scaffold from a repo scan). MIT, zero dependencies at runtime,
> v0.1.0 out this week.
>
> The GitHub Blog post about "2,500 repos" from July 28 is basically the
> rubric we're auditing against — we'll be mapping our dimensions 1:1 to
> that post in v0.1.1 so the grade means the same thing GitHub does.

## Long form (blog / changelog announcement, ~250 words)

> ### agentsmd v0.1.0 — one line of YAML, one grade floor for your AGENTS.md
>
> The AGENTS.md ecosystem got crowded this week. GitHub published a "lessons
> from 2,500 repositories" rubric. `agnix` shipped an LSP-plus-linter.
> `agentlinter` shipped 30 ESLint-style rules. `agent-audit` shipped 51
> security-focused rules. All good tools. All ending at "here's what's wrong."
>
> `agentsmd` is the tool that says **"…and here's when your PR fails."**
>
> **What v0.1.0 gives you today:**
>
> - `agentsmd audit` — six-dimension scorecard, 0–100, letter grade.
> - `agentsmd check` — the same, wired to a CI gate. `min-grade=B`,
>   `fail-on=warn`, JSON out for GitHub Job Summary.
> - **Reusable GitHub Action** — one line in your workflow, no bash glue:
>   `uses: Naveen-Sai-Ganadi/agentsmd@v0.1.0`.
> - `sync` — AGENTS.md is the single source; the other four configs are
>   generated with a banner. Dry-run by default.
> - `init` — scaffold AGENTS.md from a repo scan, merging existing rules.
> - **`version` / `--version` / `-v`** (0.1.1 preview) — because CI logs
>   should say which agentsmd they ran.
>
> **Why the CI gate matters:** editor squiggles teach; failing PRs enforce.
> If your team has agreed AGENTS.md matters, you want the same "your build is
> red" moment for it that you already have for lint and tests.
>
> Node.js 20+, MIT, no runtime deps. `npx agentsmd check .` to try it.
> Feedback and issues welcome — this is v0.1.0 and the roadmap is short.

---

## Positioning notes (internal — do not include in post)

- Lead with **CI gate + reusable Action** — that's the durable differentiator
  vs. agnix (LSP) and agentlinter (rule count).
- Cite the GitHub Blog post to borrow credibility for the rubric.
- Do NOT trash the competitors by name in the *long form* — the medium form
  names them respectfully to establish awareness.
- Do NOT post until decision #10 (npm publish) and #11 (post the earlier v0.1.0
  Show HN draft) are resolved, so we don't split attention.
