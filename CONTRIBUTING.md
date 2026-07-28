# Contributing to agentsmd

Thanks for looking! `agentsmd` is pre-v0.1.0 and moving fast. Small, focused PRs get merged quickly.

## Ground rules

- **Every command needs a test** covering at least the golden path.
- **Conventional commits.** `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`. The subject line becomes the changelog entry.
- **No new runtime dependencies until v0.2** unless a maintainer signs off. Node built-ins first. If you must add one, note it in the PR body.
- **Strict TypeScript.** No `any` without a comment explaining why.
- **`sync` and `init` must stay preview-then-apply.** Never mutate a user's files without `--apply`.

## Dev loop

```sh
git clone https://github.com/Naveen-Sai-Ganadi/agentsmd
cd agentsmd
npm ci
npm run lint       # tsc --noEmit
npm test           # node --test on tests/*.test.ts
npm run build      # emits dist/
node dist/cli.js check .   # dogfood
```

Node ≥ 22 is required (we use the stable `--experimental-strip-types` for tests and `node:test` as the runner).

## Project layout

```
src/
  cli.ts        # argv parser + dispatch
  detect.ts     # config-file detection (all 5 types)
  init.ts       # scaffold AGENTS.md from a repo scan
  sync.ts       # AGENTS.md → other configs, plan/apply
  lint.ts       # rules + 6-dimension audit
  check.ts      # CI gate composed from lint + audit
tests/
  *.test.ts     # one file per command, node --test
action.yml      # reusable composite GitHub Action
STATE.md        # canonical roadmap + daily status
```

Keep each `src/*.ts` under ~300 lines. If it's growing, split it.

## Adding a new command

1. Add `src/<name>.ts` exporting a pure `planFoo` (returns a structured result) and, when it mutates, `applyFoo`.
2. Wire it in `src/cli.ts` with a `case "<name>":` block and a help entry.
3. Add `tests/<name>.test.ts` covering: missing input, golden path, at least one error path.
4. Update `README.md` (the command table + a flag cheatsheet line) and `STATE.md` (Done + Roadmap).
5. Run `npm run lint && npm test && npm run build` before pushing.

## Adding a new config-file target to `sync`

1. Add the target constant in `src/sync.ts` and a renderer.
2. Add it to `TARGET_ALIASES` in `src/cli.ts` so `--targets=<alias>` works.
3. Add a test that plans and applies it, and a second test that verifies the banner survives an unrelated edit.

## Reporting bugs

Please include:

- OS + Node version (`node --version`)
- The command you ran and the full output
- A minimal reproduction repo if the failure depends on repo shape

## Security

If you find a security issue, please email the maintainer instead of opening a public issue. `agentsmd` is read-mostly and does not touch secrets, but the reusable Action runs `npm ci` inside CI runners — treat that surface conservatively.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
