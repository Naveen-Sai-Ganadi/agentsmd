#!/usr/bin/env node
import { detectConfigs, kindLabel } from "./detect";

const HELP = `agentsmd — manage AI-coding-agent config files

Usage:
  agentsmd <command> [path]

Commands:
  check [path]   Detect agent config files in the given repo (default: cwd)
  init           (planned) Scaffold AGENTS.md from repo scan
  sync           (planned) Sync AGENTS.md to CLAUDE.md / .cursorrules / etc.
  lint           (planned) Lint AGENTS.md for quality issues
  audit          (planned) Score AGENTS.md across 6 quality dimensions
  help           Show this help
`;

async function main(argv: string[]): Promise<number> {
  const [, , cmd = "help", ...rest] = argv;
  switch (cmd) {
    case "check": {
      const root = rest[0] ?? process.cwd();
      const files = await detectConfigs(root);
      if (files.length === 0) {
        console.log(`No agent config files detected in ${root}`);
        return 0;
      }
      console.log(`Detected ${files.length} agent config file(s) in ${root}:`);
      for (const f of files) console.log(`  - ${kindLabel(f.kind)}  (${f.path})`);
      return 0;
    }
    case "init":
    case "sync":
    case "lint":
    case "audit": {
      console.log(`\`${cmd}\` is planned for v0.1.0 — not yet implemented.`);
      return 0;
    }
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      return 0;
    default:
      console.error(`Unknown command: ${cmd}\n`);
      console.log(HELP);
      return 1;
  }
}

main(process.argv).then(
  (code) => process.exit(code),
  (err) => { console.error(err); process.exit(1); }
);
