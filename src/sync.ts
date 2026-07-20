import { promises as fs } from "node:fs";
import * as path from "node:path";
export type SyncTarget =
  | "claude-md"
  | "cursorrules"
  | "copilot-instructions"
  | "windsurfrules";

export const ALL_TARGETS: SyncTarget[] = [
  "claude-md",
  "cursorrules",
  "copilot-instructions",
  "windsurfrules",
];

export const TARGET_REL: Record<SyncTarget, string> = {
  "claude-md": "CLAUDE.md",
  "cursorrules": ".cursorrules",
  "copilot-instructions": ".github/copilot-instructions.md",
  "windsurfrules": ".windsurfrules",
};

export const BANNER =
  "<!-- agentsmd:generated — do not edit; sourced from AGENTS.md -->";

export type SyncAction = "create" | "update" | "unchanged" | "skip-missing-source";

export interface SyncPlanEntry {
  target: SyncTarget;
  path: string;
  action: SyncAction;
  reason?: string;
}

export interface SyncPlan {
  source: string;
  entries: SyncPlanEntry[];
}

export function renderTarget(target: SyncTarget, source: string): string {
  const stripped = source.replace(/^<!--\s*agentsmd:generated[^>]*-->\s*\n?/i, "");
  if (target === "cursorrules" || target === "windsurfrules") {
    // Plain text formats — banner as a leading comment line.
    return `# agentsmd:generated — do not edit; sourced from AGENTS.md\n\n${stripped}`;
  }
  return `${BANNER}\n\n${stripped}`;
}

async function readIfExists(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

export async function planSync(
  root: string,
  targets: SyncTarget[] = ALL_TARGETS,
): Promise<SyncPlan> {
  const sourcePath = path.join(root, "AGENTS.md");
  const source = await readIfExists(sourcePath);
  if (source === null) {
    return {
      source: sourcePath,
      entries: targets.map((t) => ({
        target: t,
        path: path.join(root, TARGET_REL[t]),
        action: "skip-missing-source",
        reason: "AGENTS.md not found",
      })),
    };
  }
  const entries: SyncPlanEntry[] = [];
  for (const t of targets) {
    const outPath = path.join(root, TARGET_REL[t]);
    const rendered = renderTarget(t, source);
    const existing = await readIfExists(outPath);
    let action: SyncAction;
    if (existing === null) action = "create";
    else if (existing === rendered) action = "unchanged";
    else action = "update";
    entries.push({ target: t, path: outPath, action });
  }
  return { source: sourcePath, entries };
}

export async function applySync(
  root: string,
  plan: SyncPlan,
): Promise<SyncPlan> {
  const source = await readIfExists(plan.source);
  if (source === null) return plan;
  for (const entry of plan.entries) {
    if (entry.action === "unchanged" || entry.action === "skip-missing-source") continue;
    const rendered = renderTarget(entry.target, source);
    await fs.mkdir(path.dirname(entry.path), { recursive: true });
    await fs.writeFile(entry.path, rendered, "utf8");
  }
  return plan;
}
