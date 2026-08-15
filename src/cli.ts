#!/usr/bin/env node
import { detectConfigs, kindLabel } from "./detect";
import { planSync, applySync, ALL_TARGETS, SyncTarget } from "./sync";
import { planInit, applyInit } from "./init";
import { lintAgentsMd, lintAgentsMdNested, auditAgentsMd, auditAgentsMdNested, LintSeverity } from "./lint";
import { runCheck, runCheckNested, parseGrade, parseFailOn } from "./check";
import { readVersion } from "./version";
import { runDoctor } from "./doctor";
import { buildTreeSummary, renderTree } from "./tree";

const HELP = `agentsmd — manage AI-coding-agent config files

Usage:
  agentsmd <command> [path] [options]

Commands:
  detect [path]          Detect agent config files in the given repo (default: cwd)
  sync   [path] [--apply] Preview (default) or apply syncing AGENTS.md → other configs
                         --targets=claude,cursor,copilot,windsurf   (default: all)
  init   [path] [--apply] Scaffold AGENTS.md from repo scan (dry-run by default)
                         --blank         start blank instead of merging existing rules
                         --force         overwrite an existing AGENTS.md (with --apply)
  lint   [path]          Lint AGENTS.md for quality issues (--json for machine output)
                         --nested        lint every AGENTS.md discovered in the tree
                         --max-depth=N   traversal depth for --nested (default 8)
  audit  [path]          Score AGENTS.md across 6 quality dimensions (--json)
                         --nested        audit every AGENTS.md discovered in the tree
                         --max-depth=N   traversal depth for --nested (default 8)
  check  [path]          CI gate: lint + audit with pass/fail (for GitHub Actions).
                         --min-grade=A|B|C|D|F   audit floor (default C = 60)
                         --min-score=N           override numeric floor (0-100)
                         --fail-on=error|warn|info  lint severity to fail on (default error)
                         --nested        run the gate against every AGENTS.md in the tree
                         --max-depth=N   traversal depth for --nested (default 8)
                         --json                  machine-readable output
  version                Print version (also: --version, -v; add --json for machine output)
  doctor [path]          Diagnose env + repo (Node version, configs, AGENTS.md staleness).
                         --json                  machine-readable output
  tree   [path]          Discover nested AGENTS.md / CLAUDE.md (monorepo layout).
                         --json                  machine-readable output
                         --max-depth=N           traversal depth (default 8)
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
    case "version":
    case "--version":
    case "-v": {
      const { flags } = parseArgs(rest);
      const info = await readVersion();
      if (flags.json === true) {
        console.log(JSON.stringify(info, null, 2));
      } else {
        console.log(`${info.name} ${info.version}`);
      }
      return 0;
    }
    case "detect": {
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
    case "check": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const minGrade = parseGrade(typeof flags["min-grade"] === "string" ? flags["min-grade"] : undefined);
      const minScore =
        typeof flags["min-score"] === "string" ? Number.parseInt(flags["min-score"], 10) : undefined;
      const failOn = parseFailOn(typeof flags["fail-on"] === "string" ? flags["fail-on"] : undefined);
      if (flags.nested === true) {
        const maxDepthRaw = typeof flags["max-depth"] === "string" ? flags["max-depth"] : undefined;
        const maxDepth = maxDepthRaw ? Number.parseInt(maxDepthRaw, 10) : undefined;
        const nested = await runCheckNested(root, { minGrade, minScore, failOn, maxDepth });
        if (flags.json === true) {
          console.log(JSON.stringify(nested, null, 2));
        } else {
          console.log(`check --nested — ${nested.root}`);
          console.log(
            `  gate: min-grade=${nested.gate.minGrade} (>=${nested.gate.minScore}), fail-on=${nested.gate.failOn}`,
          );
          console.log(
            `  files: ${nested.totalFiles}, passed: ${nested.passedFiles}, failed: ${nested.failedFiles}`,
          );
          console.log(
            `  rollup: overall ${nested.rollup.overall}/100 (grade ${nested.rollup.grade}), lowest ${nested.rollup.lowest}/100, lint ${nested.rollup.totalErrors}e/${nested.rollup.totalWarnings}w/${nested.rollup.totalInfos}i`,
          );
          for (const entry of nested.entries) {
            const status = entry.passed ? "PASS ✓" : "FAIL ✗";
            const existsTag = entry.exists ? "" : " (missing)";
            console.log(
              `  [${status}] ${entry.relPath}${existsTag} — audit ${entry.audit}/100 (${entry.grade}), lint ${entry.lintErrors}e/${entry.lintWarnings}w/${entry.lintInfos}i`,
            );
            for (const r of entry.reasons) console.log(`      - ${r}`);
          }
          console.log(`  status: ${nested.passed ? "PASS ✓" : "FAIL ✗"}`);
        }
        return nested.passed ? 0 : 1;
      }
      const result = await runCheck(root, { minGrade, minScore, failOn });
      if (flags.json === true) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`check — ${result.target}`);
        console.log(
          `  gate: min-grade=${result.gate.minGrade} (>=${result.gate.minScore}), fail-on=${result.gate.failOn}`,
        );
        console.log(`  audit: ${result.audit.overall}/100  (grade ${result.audit.grade})`);
        const errs = result.lint.issues.filter((i) => i.severity === "error").length;
        const warns = result.lint.issues.filter((i) => i.severity === "warn").length;
        const infos = result.lint.issues.filter((i) => i.severity === "info").length;
        console.log(`  lint:  ${errs} error(s), ${warns} warning(s), ${infos} info`);
        if (result.passed) {
          console.log(`  status: PASS ✓`);
        } else {
          console.log(`  status: FAIL ✗`);
          for (const r of result.reasons) console.log(`    - ${r}`);
        }
      }
      return result.passed ? 0 : 1;
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
      const order: LintSeverity[] = ["error", "warn", "info"];
      if (flags.nested === true) {
        const maxDepthRaw = typeof flags["max-depth"] === "string" ? flags["max-depth"] : undefined;
        const maxDepth = maxDepthRaw ? Number.parseInt(maxDepthRaw, 10) : undefined;
        const nested = await lintAgentsMdNested(root, { maxDepth });
        if (flags.json === true) {
          console.log(JSON.stringify(nested, null, 2));
        } else {
          console.log(`lint --nested — ${nested.root}`);
          console.log(
            `  files: ${nested.totalFiles}, errors: ${nested.totalErrors}, warnings: ${nested.totalWarnings}, info: ${nested.totalInfos}`,
          );
          for (const entry of nested.entries) {
            const header = entry.exists
              ? `${entry.relPath} — ${entry.bytes} bytes, ${entry.issues.length} issue(s)`
              : `${entry.relPath} — MISSING`;
            console.log(`  ${header}`);
            for (const sev of order) {
              for (const iss of entry.issues.filter((i) => i.severity === sev)) {
                const loc = iss.line ? `:${iss.line}` : "";
                console.log(`    [${sev.toUpperCase().padEnd(5)}] ${iss.rule}${loc} — ${iss.message}`);
              }
            }
            if (entry.exists && entry.issues.length === 0) console.log(`    no issues ✓`);
          }
        }
        return nested.totalErrors > 0 ? 1 : 0;
      }
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
      if (flags.nested === true) {
        const maxDepthRaw = typeof flags["max-depth"] === "string" ? flags["max-depth"] : undefined;
        const maxDepth = maxDepthRaw ? Number.parseInt(maxDepthRaw, 10) : undefined;
        const nested = await auditAgentsMdNested(root, { maxDepth });
        if (flags.json === true) {
          console.log(JSON.stringify(nested, null, 2));
        } else {
          console.log(`audit --nested — ${nested.root}`);
          console.log(
            `  files: ${nested.totalFiles}, overall: ${nested.overall}/100 (grade ${nested.grade}), lowest: ${nested.lowest}/100`,
          );
          for (const entry of nested.entries) {
            if (!entry.exists) {
              console.log(`  ${entry.relPath} — MISSING (F)`);
              continue;
            }
            console.log(
              `  ${entry.relPath} — ${entry.overall}/100 (grade ${entry.grade})`,
            );
            for (const d of entry.dimensions) {
              console.log(
                `    - ${d.dimension.padEnd(13)} ${String(d.score).padStart(3)}/100`,
              );
            }
          }
        }
        return 0;
      }
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
    case "doctor": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const report = await runDoctor(root);
      if (flags.json === true) {
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.log(`doctor — ${report.target}`);
        console.log(`  agentsmd: ${report.agentsmd.name} ${report.agentsmd.version}`);
        console.log(`  node:     ${report.node.version} (${report.node.ok ? "ok" : "TOO OLD"}, required ${report.node.required})`);
        if (report.agentsMd.present) {
          const age = report.agentsMd.lastModifiedDaysAgo;
          const ageStr = age === null ? "" : `, modified ${age}d ago`;
          const banner = report.agentsMd.hasBanner ? ", managed banner ✓" : "";
          console.log(`  AGENTS.md: ${report.agentsMd.bytes} bytes${ageStr}${banner}`);
        } else {
          console.log(`  AGENTS.md: NOT FOUND (run \`agentsmd init --apply\`)`);
        }
        const siblings = report.configs.filter((c) => c.kind !== "agents-md");
        if (siblings.length === 0) {
          console.log(`  siblings: none`);
        } else {
          console.log(`  siblings: ${siblings.map((c) => c.label).join(", ")}`);
        }
        console.log(`  checks:`);
        for (const c of report.checks) {
          console.log(`    [${c.ok ? " OK  " : "FAIL "}] ${c.name.padEnd(20)} ${c.detail}`);
        }
        console.log(`  status: ${report.ok ? "OK ✓" : "ISSUES FOUND ✗"}`);
      }
      return report.ok ? 0 : 1;
    }
    case "tree": {
      const { positional, flags } = parseArgs(rest);
      const root = positional[0] ?? process.cwd();
      const maxDepthRaw = typeof flags["max-depth"] === "string" ? flags["max-depth"] : undefined;
      const maxDepth = maxDepthRaw ? Number.parseInt(maxDepthRaw, 10) : undefined;
      const summary = await buildTreeSummary(root, { maxDepth });
      if (flags.json === true) {
        console.log(JSON.stringify(summary, null, 2));
      } else {
        console.log(renderTree(summary));
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
