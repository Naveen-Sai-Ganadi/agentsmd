#!/usr/bin/env node
import { detectConfigs, kindLabel } from "./detect";
import { planSync, applySync, ALL_TARGETS, SyncTarget } from "./sync";
import { planInit, applyInit } from "./init";
import { lintAgentsMd, auditAgentsMd, LintSeverity } from "./lint";

const HELP = `agentsmd — manage AI-coding-agent config files

Usage:
  agentsmd <command> [path] [options]

Commands:
  check [path]           Detect agent config files in the given repo (default: cwd)
  sync  [path] [--apply] Preview (default) or apply syncing AGENTS.md → other configs
                         --targets=claude,cursor,copilot,windsurf   (default: all)
  init  [path] [--apply] Scaffold AGENTS.md from repo scan (dry-run by default)
                         --blank         start blank instead of merging existing rules
                         --force         overwrite an existing AGENTS.md (with --apply)
  lint  [path]           Lint AGENTS.md for quality issues (--json for machine output)
  audit [path]           Score AGENTS.md across 6 quality dimensions (--json)
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
    case "init": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const apply = flags.apply === true;
      const force = flags.force === true;
      const mode: "merge" | "blank" = flags.blank === true ? "blank" : "merge";
      const plan = await planInit(root, { mode, force });
      const modeLabel = apply ? "APPLY" : "DRY-RUN";
      console.log(`init (${modeLabel}) — target: ${plan.target}`);
      console.log(`  mode: ${plan.mode}${plan.sources.length ? ` (merging ${plan.sources.length} existing file(s))` : ""}`);
      if (plan.repo.stack.length) console.log(`  stack: ${plan.repo.stack.join(", ")}`);
      console.log(`  action: ${plan.action}`);
      if (plan.action === "skip-exists") {
        console.error(`\nAGENTS.md already exists. Re-run with --force --apply to overwrite.`);
        return apply ? 1 : 0;
      }
      if (apply) {
        await applyInit(plan);
        console.log(`\nWrote ${plan.target} (${Buffer.byteLength(plan.rendered, "utf8")} bytes).`);
        console.log(`Next: run \`agentsmd sync --apply\` to propagate to other configs.`);
      } else {
        console.log(`\n--- preview (first 40 lines) ---`);
        console.log(plan.rendered.split("\n").slice(0, 40).join("\n"));
        console.log(`--- end preview ---\n`);
        console.log(`Dry-run only. Re-run with --apply to write ${plan.target}.`);
      }
      return 0;
    }
    case "lint": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const report = await lintAgentsMd(root);
      if (flags.json === true) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`lint — ${report.target}`);
        if (!report.exists) {
          console.error(`AGENTS.md not found.`);
        } else {
          console.log(`  bytes: ${report.bytes}, issues: ${report.issues.length}`);
        }
        const order: LintSeverity[] = ["error", "warn", "info"];
        for (const sev of order) {
          for (const iss of report.issues.filter((i) => i.severity === sev)) {
            const loc = iss.line ? `:${iss.line}` : "";
            console.log(`  [${sev.toUpperCase().padEnd(5)}] ${iss.rule}${loc} — ${iss.message}`);
          }
        }
        if (report.issues.length === 0) console.log(`  no issues found ✓`);
      }
      const hasError = report.issues.some((i) => i.severity === "error");
      return hasError ? 1 : 0;
    }
    case "audit": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const report = await auditAgentsMd(root);
      if (flags.json === true) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`audit — ${report.target}`);
        console.log(`  overall: ${report.overall}/100  (grade ${report.grade})`);
        for (const d of report.dimensions) {
          console.log(`  - ${d.dimension.padEnd(13)} ${String(d.score).padStart(3)}/100  ${d.notes.join(" ")}`);
        }
        const errs = report.lint.issues.filter((i) => i.severity === "error").length;
        const warns = report.lint.issues.filter((i) => i.severity === "warn").length;
        console.log(`  lint: ${errs} error(s), ${warns} warning(s)`);
      }
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
