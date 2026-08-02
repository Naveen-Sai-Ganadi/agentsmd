# Draft — `agentsmd doctor` announcement (2026-08-02)

Do NOT post without Naveen's sign-off. This covers the small `doctor` command
shipped today (on `main`, still Unreleased for the coming v0.1.1 cut).

---

## Short (140-char thread reply / status)

`agentsmd doctor` is live on main — one command tells you your Node version,
AGENTS.md age, banner status, and which sibling configs exist. Exits 1 on
issues so you can drop it in a pre-push hook.

## Medium (Show HN comment / dev.to snippet)

New in agentsmd (unreleased, on main): `agentsmd doctor`.

```
$ npx agentsmd doctor .
doctor — .
  agentsmd: agentsmd 0.1.0
  node:     v22.5.0 (ok, required >=22)
  AGENTS.md: 883 bytes, modified 16d ago
  siblings: CLAUDE.md, .cursorrules
  checks:
    [ OK  ] node-version         v22.5.0 (>=22 required)
    [ OK  ] agents-md-present    883 bytes at ./AGENTS.md
    [ OK  ] sibling-configs      2 sibling config(s): CLAUDE.md, .cursorrules
  status: OK ✓
```

Pairs with today's `agentsmd version` — install-time smoke test in one line.
`--json` for CI. Non-zero exit when a check fails (missing AGENTS.md, wrong
Node, etc.) so you can wire it into a git hook or a pipeline step.

## Long (blog / changelog explainer)

**Why doctor?** Two weeks of dogfooding on external repos surfaced the same
question every install: *"is this actually set up right?"* — Node too old, no
`AGENTS.md`, banner missing, staleness unknown. `agentsmd lint` answers the
quality question. `agentsmd doctor` answers the setup question.

**What it checks (v0.1.1):**
- Node runtime (>= 22)
- `AGENTS.md` presence, size, last-modified age (in days)
- Presence of the `<!-- agentsmd:managed -->` banner
- Which sibling configs are wired up

**Exit codes:** `0` when everything's green, `1` when any check fails. Meant
to slot into pre-push hooks or a first CI step next to `agentsmd check`.

**What it doesn't do (yet):** no npm-published version check, no npm-registry
lookup, no drift detection between AGENTS.md and its rendered siblings. Those
are candidates for v0.2 depending on decision #12 (mono vs drift).

---

## Ship checklist (when v0.1.1 is cut)

- [ ] Bump `package.json` version 0.1.0 → 0.1.1
- [ ] Move `[Unreleased]` block in `CHANGELOG.md` under `## [0.1.1] — <date>`
- [ ] Tag & push
- [ ] Publish npm (if decision #10 = now)
- [ ] Post the short thread + Show HN comment above
