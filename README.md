# agentsmd

**One source of truth for every AI coding agent's config file.**

`AGENTS.md` → `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `.windsurfrules`. Lint it, score it, sync it, gate PRs on it.

[![CI](https://github.com/Naveen-Sai-Ganadi/agentsmd/actions/workflows/ci.yml/badge.svg)](https://github.com/Naveen-Sai-Ganadi/agentsmd/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-blue.svg)](package.json)

> **Status:** pre-alpha, working toward v0.1.0. All six commands (`detect`, `init`, `sync`, `lint`, `audit`, `check`) plus a reusable GitHub Action are functional and dogfooded on this repo.

---

## The problem

Every coding assistant wants its own rules file:

```
your-repo/
├── AGENTS.md                              # OpenAI Codex, Cursor (new), Zed, Sourcegraph…
├── CLAUDE.md                              # Claude Code, Claude for VS Code
├── .cursorrules                           # Cursor (legacy)
├── .github/copilot-instructions.md        # GitHub Copilot
└── .windsurfrules                         # Windsurf
```

Five files. Near-duplicate content. They drift. Reviewers see one; the assistant reads another. `agentsmd` treats `AGENTS.md` as the source of truth and keeps the rest aligned — with a lint + audit gate that fails CI if the source rots.

## Quickstart (30 seconds)

```sh
# 1. See which agent config files your repo already has
npx agentsmd detect .

# 2. Scaffold AGENTS.md by merging whatever's there
npx agentsmd init . --apply

# 3. Generate the other four from AGENTS.md
npx agentsmd sync . --apply

# 4. Score what you just wrote
npx agentsmd audit .
```

> `sync` and `init` default to dry-run. You always see the diff before anything is written.

Every generated file starts with an `agentsmd:generated` banner, so reviewers can tell it apart from a hand-written config at a glance.

## Commands

| Command | What it does | Default |
|---|---|---|
| `agentsmd detect [path]` | List which agent config files exist in the repo | read-only |
| `agentsmd init [path]` | Scaffold `AGENTS.md` from a repo scan (merges existing rules) | dry-run |
| `agentsmd sync [path]` | Sync `AGENTS.md` → the other four files | dry-run |
| `agentsmd lint [path]` | Lint `AGENTS.md` for structure + quality issues | text output |
| `agentsmd audit [path]` | Score `AGENTS.md` across 6 dimensions (clarity, coverage, structure, examples, guardrails, freshness) | letter grade |
| `agentsmd check [path]` | CI gate: `lint` + `audit` with pass/fail exit codes | fails below `C` |
| `agentsmd version` | Print version (`--version` / `-v` also work; add `--json` for machine output) | text |

Add `--json` to `lint`, `audit`, or `check` for machine-readable output.

### Flag cheatsheet

```sh
# init: start fresh instead of merging existing rules
agentsmd init . --blank --apply

# sync: pick a subset of targets
agentsmd sync . --apply --targets=claude,cursor

# check: tighten the CI gate
agentsmd check . --min-grade=B --fail-on=warn
agentsmd check . --min-score=75 --json
```

## Use in GitHub Actions

Drop this into a workflow to gate PRs on `AGENTS.md` quality:

```yaml
- uses: Naveen-Sai-Ganadi/agentsmd@main
  with:
    path: .
    min-grade: C          # A|B|C|D|F  (default C, ≥ 60)
    fail-on: error        # error|warn|info  (default error)
    # min-score: 75       # optional numeric override
    # version: 0.0.4      # once published to npm, pins the CLI version
```

The step exits non-zero when lint errors are present or the audit falls below the floor. Outputs `passed`, `grade`, and `score` are available to downstream steps.

## How it compares

| | agentsmd | `agents-lint` | AgentLint (marketplace) | agentlinter.com |
|---|---|---|---|---|
| `sync` (one source → five files) | ✅ | ❌ | ❌ | ❌ |
| `init` (scaffold from a repo scan) | ✅ | ❌ | ❌ | partial |
| `lint` (structure + quality rules) | ✅ | ✅ (stale refs only) | ✅ | ✅ |
| `audit` (letter-grade scorecard) | ✅ | ❌ | partial | ✅ |
| CI action / gate | ✅ | ❌ | ✅ | hosted only |
| Local, one-binary, MIT | ✅ | ✅ | ❌ | ❌ |

## Install

```sh
npm install -g agentsmd     # once published
# or, no install:
npx agentsmd check .
```

## Contributing

Bug reports, feature ideas, and PRs welcome — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the dev loop, coding conventions, and how to add a new command.

## Roadmap

Public roadmap and daily status: [`STATE.md`](./STATE.md).

## License

MIT © Naveen Ganadi
