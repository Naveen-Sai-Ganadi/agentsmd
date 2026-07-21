import { promises as fs } from "node:fs";
import * as path from "node:path";
type SourceKind =
  | "claude-md"
  | "cursorrules"
  | "copilot-instructions"
  | "windsurfrules";

const SOURCE_CANDIDATES: { kind: SourceKind; rel: string }[] = [
  { kind: "claude-md", rel: "CLAUDE.md" },
  { kind: "cursorrules", rel: ".cursorrules" },
  { kind: "copilot-instructions", rel: ".github/copilot-instructions.md" },
  { kind: "windsurfrules", rel: ".windsurfrules" },
];

export type InitAction = "create" | "skip-exists" | "overwrite";

export interface InitSource {
  kind: SourceKind;
  path: string;
  bytes: number;
}

export interface RepoContext {
  name: string;
  stack: string[];
}

export interface InitPlan {
  root: string;
  target: string;
  action: InitAction;
  mode: "merge" | "blank";
  sources: InitSource[];
  repo: RepoContext;
  rendered: string;
}

const STRIP_BANNER =
  /^(?:<!--\s*agentsmd:generated[^>]*-->|#\s*agentsmd:generated[^\n]*)\s*\n?/i;

function stripBanner(text: string): string {
  return text.replace(STRIP_BANNER, "").trimEnd();
}

async function readIfExists(p: string): Promise<string | null> {
  try {
    return await fs.readFile(p, "utf8");
  } catch {
    return null;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function scanRepo(root: string): Promise<RepoContext> {
  const stack: string[] = [];
  const name = path.basename(path.resolve(root));
  const pkg = await readIfExists(path.join(root, "package.json"));
  if (pkg) {
    stack.push("Node.js / npm");
    try {
      const parsed = JSON.parse(pkg);
      if (parsed.devDependencies?.typescript || parsed.dependencies?.typescript) {
        stack.push("TypeScript");
      }
      const testCmd: string | undefined = parsed.scripts?.test;
      if (testCmd) stack.push(`Tests: \`npm test\` (${testCmd.slice(0, 40)})`);
    } catch {
      // ignore malformed package.json
    }
  }
  if (await fileExists(path.join(root, "pyproject.toml"))) stack.push("Python (pyproject)");
  if (await fileExists(path.join(root, "requirements.txt"))) stack.push("Python (requirements.txt)");
  if (await fileExists(path.join(root, "Cargo.toml"))) stack.push("Rust / cargo");
  if (await fileExists(path.join(root, "go.mod"))) stack.push("Go modules");
  if (await fileExists(path.join(root, "Gemfile"))) stack.push("Ruby / bundler");
  return { name, stack };
}

function labelForSource(kind: SourceKind): string {
  switch (kind) {
    case "claude-md": return "CLAUDE.md";
    case "cursorrules": return ".cursorrules";
    case "copilot-instructions": return ".github/copilot-instructions.md";
    case "windsurfrules": return ".windsurfrules";
  }
}

export function renderInit(mode: "merge" | "blank", repo: RepoContext, sources: InitSource[], sourceBodies: Map<SourceKind, string>): string {
  const header = `# AGENTS.md\n\nGuidance for AI coding agents working in **${repo.name}**.\nManaged by \`agentsmd\` — edit this file, then run \`agentsmd sync --apply\` to propagate to CLAUDE.md, .cursorrules, .github/copilot-instructions.md, and .windsurfrules.\n`;

  const stackSection = repo.stack.length
    ? `\n## Stack\n\n${repo.stack.map((s) => `- ${s}`).join("\n")}\n`
    : "";

  const conventionsPlaceholder = `\n## Conventions\n\n- Prefer small, focused changes with tests.\n- Keep public APIs stable; document breaking changes in the changelog.\n- Ask before adding new dependencies.\n`;

  if (mode === "blank" || sources.length === 0) {
    return `${header}${stackSection}${conventionsPlaceholder}`;
  }

  const mergedBlocks: string[] = [];
  for (const src of sources) {
    const body = sourceBodies.get(src.kind);
    if (!body) continue;
    const cleaned = stripBanner(body).trim();
    if (!cleaned) continue;
    mergedBlocks.push(`### From ${labelForSource(src.kind)}\n\n${cleaned}\n`);
  }
  const mergedSection = mergedBlocks.length
    ? `\n## Merged existing rules\n\nThe following was imported from pre-existing config files. Review, dedupe, and delete the section headers once folded into the conventions above.\n\n${mergedBlocks.join("\n---\n\n")}`
    : "";

  return `${header}${stackSection}${conventionsPlaceholder}${mergedSection}`;
}

export interface PlanInitOptions {
  mode?: "merge" | "blank";
  force?: boolean;
}

export async function planInit(root: string, opts: PlanInitOptions = {}): Promise<InitPlan> {
  const mode = opts.mode ?? "merge";
  const target = path.join(root, "AGENTS.md");
  const existing = await readIfExists(target);
  const sourceBodies = new Map<SourceKind, string>();
  const sources: InitSource[] = [];
  for (const c of SOURCE_CANDIDATES) {
    const p = path.join(root, c.rel);
    const body = await readIfExists(p);
    if (body === null) continue;
    sourceBodies.set(c.kind, body);
    sources.push({ kind: c.kind, path: p, bytes: Buffer.byteLength(body, "utf8") });
  }
  const repo = await scanRepo(root);
  const rendered = renderInit(mode, repo, sources, sourceBodies);
  let action: InitAction;
  if (existing === null) action = "create";
  else if (opts.force) action = "overwrite";
  else action = "skip-exists";
  return { root, target, action, mode, sources, repo, rendered };
}

export async function applyInit(plan: InitPlan): Promise<InitPlan> {
  if (plan.action === "skip-exists") return plan;
  await fs.mkdir(path.dirname(plan.target), { recursive: true });
  await fs.writeFile(plan.target, plan.rendered, "utf8");
  return plan;
}
