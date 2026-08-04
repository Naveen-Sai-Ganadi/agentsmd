import { promises as fs } from "node:fs";
import * as path from "node:path";
import { kindLabel } from "./detect.ts";
import type { AgentConfigKind } from "./detect.ts";

export interface NestedConfig {
  kind: AgentConfigKind;
  path: string;
  relPath: string;
  depth: number;
}

const NESTED_FILENAMES: { kind: AgentConfigKind; name: string }[] = [
  { kind: "agents-md", name: "AGENTS.md" },
  { kind: "claude-md", name: "CLAUDE.md" },
];

const DEFAULT_IGNORES = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  ".venv",
  "venv",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  "target",
  ".gradle",
  ".idea",
  ".vscode",
]);

export interface DiscoverOptions {
  maxDepth?: number;
  ignoreDirs?: Set<string>;
}

export async function discoverNested(
  root: string,
  opts: DiscoverOptions = {},
): Promise<NestedConfig[]> {
  const maxDepth = opts.maxDepth ?? 8;
  const ignoreDirs = opts.ignoreDirs ?? DEFAULT_IGNORES;
  const absRoot = path.resolve(root);
  const found: NestedConfig[] = [];
  await walk(absRoot, absRoot, 0, maxDepth, ignoreDirs, found);
  found.sort((a, b) => {
    if (a.depth !== b.depth) return a.depth - b.depth;
    if (a.relPath !== b.relPath) return a.relPath.localeCompare(b.relPath);
    return a.kind.localeCompare(b.kind);
  });
  return found;
}

async function walk(
  root: string,
  dir: string,
  depth: number,
  maxDepth: number,
  ignoreDirs: Set<string>,
  out: NestedConfig[],
): Promise<void> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isFile()) {
      for (const { kind, name } of NESTED_FILENAMES) {
        if (entry.name === name) {
          const full = path.join(dir, entry.name);
          const rel = path.relative(root, full) || entry.name;
          out.push({ kind, path: full, relPath: rel, depth });
        }
      }
    }
  }
  if (depth >= maxDepth) return;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    if (ignoreDirs.has(entry.name)) continue;
    await walk(root, path.join(dir, entry.name), depth + 1, maxDepth, ignoreDirs, out);
  }
}

// Nearest-wins lookup: given a file path inside root, return the closest
// ancestor config of the requested kind (default: agents-md). This is the
// primitive that a nested lint/audit/check will use to pick which AGENTS.md
// governs a given file.
export function nearestConfig(
  configs: NestedConfig[],
  filePath: string,
  kind: AgentConfigKind = "agents-md",
): NestedConfig | undefined {
  const abs = path.resolve(filePath);
  const candidates = configs
    .filter((c) => c.kind === kind)
    .map((c) => ({ c, dir: path.dirname(c.path) }))
    .filter(({ dir }) => abs === dir || abs.startsWith(dir + path.sep))
    .sort((a, b) => b.dir.length - a.dir.length);
  return candidates[0]?.c;
}

export interface TreeSummary {
  root: string;
  configs: NestedConfig[];
  totalAgentsMd: number;
  totalClaudeMd: number;
  maxDepth: number;
}

export async function buildTreeSummary(root: string, opts: DiscoverOptions = {}): Promise<TreeSummary> {
  const configs = await discoverNested(root, opts);
  const agents = configs.filter((c) => c.kind === "agents-md");
  const claudes = configs.filter((c) => c.kind === "claude-md");
  const maxDepth = configs.reduce((m, c) => Math.max(m, c.depth), 0);
  return {
    root: path.resolve(root),
    configs,
    totalAgentsMd: agents.length,
    totalClaudeMd: claudes.length,
    maxDepth,
  };
}

export function renderTree(summary: TreeSummary): string {
  const lines: string[] = [];
  lines.push(`tree — ${summary.root}`);
  lines.push(
    `  found: ${summary.totalAgentsMd} AGENTS.md, ${summary.totalClaudeMd} CLAUDE.md (max depth ${summary.maxDepth})`,
  );
  if (summary.configs.length === 0) {
    lines.push(`  (no nested configs found)`);
    return lines.join("\n");
  }
  for (const c of summary.configs) {
    const indent = "  " + "  ".repeat(c.depth);
    lines.push(`${indent}- ${kindLabel(c.kind)}  (${c.relPath})`);
  }
  return lines.join("\n");
}
