# agentsmd

Universal manager, linter, and sync tool for AI-coding-agent config files.

Keep `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, and `.windsurfrules` in sync — from a single source of truth.

> **Status:** pre-alpha. `check` and `sync` are functional; `init`, `lint`, `audit` land in v0.1.0.

## Quickstart

```sh
# See which agent config files exist in this repo
agentsmd check .

# Preview what would change (dry-run is the default; safe to run anywhere)
agentsmd sync .

# Actually write the derived files
agentsmd sync . --apply

# Sync only a subset
agentsmd sync . --apply --targets=claude,cursor
```

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
| `agentsmd check [path]` | Detect which agent config files exist in a repo |
| `agentsmd init` | Scaffold `AGENTS.md` from a repo scan |
| `agentsmd sync` | Sync `AGENTS.md` → the other four files |
| `agentsmd lint` | Lint `AGENTS.md` for common quality issues |
| `agentsmd audit` | Score `AGENTS.md` across 6 quality dimensions |

## Roadmap to v0.1.0

See [`STATE.md`](./STATE.md).

## License

MIT © Naveen Ganadi
