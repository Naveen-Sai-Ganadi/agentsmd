# Distribution draft — `long-file` rule (2026-08-03)

Not posted. Awaits Naveen's sign-off (decisions #10 npm-publish and #11 launch-post are still gating any external announcement).

---

## Short (Twitter/X, Bluesky, Mastodon — 240 chars)

`agentsmd v0.1.1-preview`: new `long-file` lint rule. Flags any AGENTS.md over 200 lines — the threshold Anthropic itself recommends, and where the community reports Claude Code hallucinations tick up. Now on `main`.

## Medium (LinkedIn / dev.to short-form)

**New in agentsmd on `main`: the 200-line rule, encoded.**

Anthropic's own CLAUDE.md guidance says keep it under 200 lines. XDA Developers ran the natural experiment and confirmed it. r/ClaudeCode has been folk-ruling it for months.

Nobody had encoded it as a lint check. Now `agentsmd lint` does:

```
info  long-file  AGENTS.md is 247 lines; agents skim better under 200.
                 Consider extracting deep-dives into linked docs.
```

And `agentsmd audit` applies a graduated penalty (up to −15) on the `structure` dimension when you exceed the budget — so an oversized config drops from A to B before CI catches it.

Info-severity by default so it never fails a build on its own; use `--fail-on=info` or a stricter `--min-grade` when you're ready to enforce.

Ship: [commit ce6d5ad](https://github.com/Naveen-Sai-Ganadi/agentsmd/commit/ce6d5ad) · [CHANGELOG](https://github.com/Naveen-Sai-Ganadi/agentsmd/blob/main/CHANGELOG.md#unreleased).

## Long (Show HN companion / blog note)

**Title:** agentsmd now enforces the 200-line AGENTS.md rule

Every AI-coding-agent context file starts life short and useful. Six months in it's 800 lines, three of them still say TODO, and Claude Code silently starts dropping instructions past line ~200.

That failure mode has three receipts:

1. Anthropic's official CLAUDE.md guidance: aim for under 200 lines; a "high-signal" file is 80–120.
2. XDA Developers, [June 2026](https://www.xda-developers.com/gave-claude-code-200-line-claudemd-worst-decision-made/): a 200-line CLAUDE.md measurably degraded response quality, focus, and hallucination rate.
3. The r/ClaudeCode and r/ClaudeAI folk-rule that's been circulating all year.

None of the existing lint tools (`agnix`, `agentlint.app`, `agents-lint`) had encoded this as a check. They lint content quality; nobody linted **shape**.

`agentsmd` now does. As of today's `main`:

- **`lint`** emits a new `long-file` info-severity issue when `AGENTS.md` exceeds 200 lines. Message includes the actual line count and a nudge toward extracting deep-dives into linked docs.
- **`audit`** applies a graduated penalty on the `structure` dimension: −5 per 40 lines over budget, capped at −15. Oversized configs bleed grade before they get failed in CI.
- **`check`** picks both up automatically — no new flags needed. `check --fail-on=info` lets you enforce the budget as a hard gate.

Why info and not error by default? Because the rule is folk wisdom formalized. A 250-line AGENTS.md isn't wrong the way a missing `## Commands` section is wrong — it's inefficient. We warn, we penalize the grade, but we don't fail your build unless you opt in.

Ship: [commit ce6d5ad](https://github.com/Naveen-Sai-Ganadi/agentsmd/commit/ce6d5ad). 46 tests passing. Rolls into v0.1.1 alongside whichever big feature closes decision #12.

**Repo:** <https://github.com/Naveen-Sai-Ganadi/agentsmd>
