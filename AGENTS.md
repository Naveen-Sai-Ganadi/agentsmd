# AGENTS.md — agentsmd project

Instructions for AI coding agents working on this repo.

## Project
Node.js + TypeScript CLI. Source: `src/`. Tests: `tests/` using the Node.js built-in test runner. Build with `npm run build`, test with `npm test`.

## Conventions
- Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Strict TypeScript. No `any` without a comment explaining why.
- Prefer Node built-ins over new deps until v0.2. Every new dep needs a note in the PR.
- Every command needs at least one test covering the golden path.

## Style
- Two-space indent. Semicolons. Double quotes.
- Small files, small functions. If a file passes ~300 lines, split it.

## Guardrails
- Never publish to npm from an agent. Naveen tags and publishes releases.
- Never delete a config file the user cares about — `sync` mutations must be preview-then-apply.
