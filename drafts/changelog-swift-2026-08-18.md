# Draft: changelog — Swift/SwiftUI stack detection (2026-08-18)

## Short (140 chars)

`agentsmd init` now detects Swift/SwiftUI/Xcode. Run it in your SwiftPM or Xcode repo and the generated AGENTS.md picks up the stack automatically.

## Medium (Show HN / thread reply)

New in `agentsmd` (Unreleased): `init` now recognizes Swift stacks.

- `Package.swift` → `Swift / SwiftPM`
- `*.xcodeproj` / `*.xcworkspace` → `Xcode project` / `Xcode workspace`
- `SwiftUI` string in `Package.swift` **or** `import SwiftUI` in a top-level `.swift` file → `SwiftUI`

`agentsmd init` writes these into the `## Stack` section of `AGENTS.md`, giving Claude Code / Cursor / Copilot immediate context on the codebase without you handwriting it. Zero-config, zero flags — `agentsmd init --mode blank` in a fresh Swift repo now produces a stack-aware `AGENTS.md` on day one.

## Long (v0.1.1 launch reply — reserved)

Save for the v0.1.1 launch reply on HN / r/ClaudeAI / r/Swift. Pitch: "the only AGENTS.md tool that knows what kind of repo you're in — Node, Python, Rust, Go, Ruby, and now Swift/SwiftUI/Xcode." Callout: no other lint/audit tool infers stack at all.

DO NOT POST — awaiting Naveen's sign-off (see decisions #10 / #11 in STATE.md).
