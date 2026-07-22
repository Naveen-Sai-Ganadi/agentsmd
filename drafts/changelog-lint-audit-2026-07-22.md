# Draft: v0.0.3 changelog — `lint` + `audit`

**Do not publish until Naveen approves.**

---

## agentsmd v0.0.3 — the quality pass

`AGENTS.md` sync is only half the battle. The other half is knowing whether your file is any good in the first place.

**New commands:**

- `agentsmd lint [path]` — scans `AGENTS.md` for common quality issues: missing file, no headings, too-short / too-long, unresolved TODO/FIXME/TBD, vague directives ("write good code", "best practices"), long lines, and out-of-sync sibling configs. Emits human output by default, `--json` for CI.
- `agentsmd audit [path]` — six-dimension scorecard (0–100 per dimension + overall grade A–F):
  - **completeness** — required-section coverage
  - **specificity** — bullets, code blocks, penalises vague phrases
  - **structure** — heading count and hierarchy
  - **length** — sweet spot 500–8000 bytes
  - **freshness** — cross-checked against `package.json` scripts and unresolved placeholders
  - **consistency** — sibling configs (`CLAUDE.md`, `.cursorrules`, etc.) carrying the `agentsmd:generated` banner

Exit code 1 on `lint` errors — drop it into your CI:

```yaml
- run: npx agentsmd lint . --json > agents-lint.json
```

Ships with 8 new tests. `lint` + `test` green. No breaking changes.

Install: `npm install -g agentsmd@0.0.3` (pending publish approval).

---

## 140-char reply copy

> agentsmd v0.0.3: `lint` + `audit` for AGENTS.md. 6-dimension scorecard (completeness, specificity, structure, length, freshness, consistency). CI-ready via `--json`.

## HN Show comment variant (240 chars)

> Follow-up to the sync tool: added `agentsmd lint` and `agentsmd audit`. Audit scores your AGENTS.md 0–100 across completeness, specificity, structure, length, freshness, and consistency with sibling configs. `--json` output for CI gates.
