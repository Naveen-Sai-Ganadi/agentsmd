#!/usr/bin/env node
import { detectConfigs, kindLabel } from "./detect";
import { planSync, applySync, ALL_TARGETS, SyncTarget } from "./sync";

const HELP = `agentsmd — manage AI-coding-agent config files

Usage:
  agentsmd <command> [path] [options]

Commands:
  check [path]           Detect agent config files in the given repo (default: cwd)
  sync  [path] [--apply] Preview (default) or apply syncing AGENTS.md → other configs
                         --targets=claude,cursor,copilot,windsurf   (default: all)
  init                   (planned) Scaffold AGENTS.md from repo scan
  lint                   (planned) Lint AGENTS.md for quality issues
  audit                  (planned) Score AGENTS.md across 6 quality dimensions
  help                   Show this help
`;

const TARGET_ALIASES: Record<string, SyncTarget> = {
  claude: "claude-md",
  "claude-md": "claude-md",
  cursor: "cursorrules",
  cursorrules: "cursorrules",
  copilot: "copilot-instructions",
  "copilot-instructions": "copilot-instructions",
  windsurf: "windsurfrules",
  windsurfrules: "windsurfrules",
};

function parseTargets(raw: string | undefined): SyncTarget[] {
  if (!raw) return ALL_TARGETS;
  const out: SyncTarget[] = [];
  for (const part of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
    const t = TARGET_ALIASES[part];
    if (!t) throw new Error(`Unknown sync target: ${part}`);
    if (!out.includes(t)) out.push(t);
  }
  return out;
}

interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

function parseArgs(rest: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (const arg of rest) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq === -1) flags[arg.slice(2)] = true;
      else flags[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

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
    case "sync": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const targets = parseTargets(typeof flags.targets === "string" ? flags.targets : undefined);
      const apply = flags.apply === true;
      const plan = await planSync(root, targets);
      const missing = plan.entries.every((e) => e.action === "skip-missing-source");
      if (missing) {
        console.error(`No AGENTS.md found at ${plan.source}. Nothing to sync.`);
        return 1;
      }
      const mode = apply ? "APPLY" : "DRY-RUN";
      console.log(`sync (${mode}) — source: ${plan.source}`);
      for (const e of plan.entries) {
        console.log(`  [${e.action.padEnd(9)}] ${e.path}`);
      }
      if (apply) {
        await applySync(root, plan);
        const changed = plan.entries.filter((e) => e.action === "create" || e.action === "update").length;
        console.log(`\nApplied ${changed} change(s).`);
      } else {
        console.log(`\nDry-run only. Re-run with --apply to write files.`);
      }
      return 0;
    }
    case "init":
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
