# agentsmd

Universal manager, linter, and sync tool for AI-coding-agent config files.

Keep `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, and `.windsurfrules` in sync — from a single source of truth.

> **Status:** pre-alpha. `detect`, `sync`, `init`, `lint`, `audit`, and `check` (CI gate) are all functional. Reusable GitHub Action shipped in v0.0.4.

## Quickstart

```sh
# See which agent config files exist in this repo
agentsmd detect .

# Scaffold AGENTS.md — dry-run preview first, then apply
agentsmd init .                # merges any pre-existing rule files
agentsmd init . --apply        # write it
agentsmd init . --blank --apply  # start blank instead of merging

# Preview what would change (dry-run is the default; safe to run anywhere)
agentsmd sync .

# Actually write the derived files
agentsmd sync . --apply

# Sync only a subset
agentsmd sync . --apply --targets=claude,cursor

# Lint AGENTS.md for common quality issues
agentsmd lint .
agentsmd lint . --json

# Score AGENTS.md across 6 quality dimensions
agentsmd audit .

# CI gate: combined lint + audit with pass/fail exit codes
agentsmd check .
agentsmd check . --min-grade=B --fail-on=warn
agentsmd check . --json
```

## Use in GitHub Actions

Drop this into a workflow to gate PRs on `AGENTS.md` quality:

```yaml
- uses: Naveen-Sai-Ganadi/agentsmd@main
  with:
    path: .
    min-grade: C          # A|B|C|D|F, default C (score >= 60)
    fail-on: error        # error|warn|info, default error
    # min-score: 75       # optional numeric override
```

The step exits non-zero when lint errors are present or the audit falls below the floor.
Outputs `passed`, `grade`, and `score` are available for downstream steps.

Every generated file starts with an `agentsmd:generated` banner so you (and reviewers) can tell it apart from a hand-written config.

## Why

Every coding assistant wants its own config file. Teams end up with 3–5 near-duplicate rule files that drift, contradict each other, and rot. `agentsmd` treats `AGENTS.md` as the source of truth and keeps the rest aligned.

## Install

```sh
npm install -g agentsmd
```

Or run without installing (once published):

```sh
npx agentsmd check .
```

## Commands (planned surface)

| Command | Purpose |
|---|---|
| `agentsmd detect [path]` | Detect which agent config files exist in a repo |
| `agentsmd init` | Scaffold `AGENTS.md` from a repo scan |
| `agentsmd sync` | Sync `AGENTS.md` → the other four files |
| `agentsmd lint` | Lint `AGENTS.md` for common quality issues |
| `agentsmd audit` | Score `AGENTS.md` across 6 quality dimensions |
| `agentsmd check` | CI gate: run lint + audit and fail below thresholds |

## Roadmap to v0.1.0

See [`STATE.md`](./STATE.md).

## License

MIT © Naveen Ganadi
