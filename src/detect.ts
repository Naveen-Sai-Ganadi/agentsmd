import { promises as fs } from "node:fs";
import * as path from "node:path";

export type AgentConfigKind =
  | "agents-md"
  | "claude-md"
  | "cursorrules"
  | "copilot-instructions"
  | "windsurfrules";

export interface AgentConfigFile {
  kind: AgentConfigKind;
  path: string;
}

const KNOWN: { kind: AgentConfigKind; rel: string }[] = [
  { kind: "agents-md", rel: "AGENTS.md" },
  { kind: "claude-md", rel: "CLAUDE.md" },
  { kind: "cursorrules", rel: ".cursorrules" },
  { kind: "copilot-instructions", rel: ".github/copilot-instructions.md" },
  { kind: "windsurfrules", rel: ".windsurfrules" },
];

export async function detectConfigs(root: string): Promise<AgentConfigFile[]> {
  const found: AgentConfigFile[] = [];
  for (const { kind, rel } of KNOWN) {
    const p = path.join(root, rel);
    try {
      const st = await fs.stat(p);
      if (st.isFile()) found.push({ kind, path: p });
    } catch {
      // not present
    }
  }
  return found;
}

export function kindLabel(kind: AgentConfigKind): string {
  switch (kind) {
    case "agents-md": return "AGENTS.md";
    case "claude-md": return "CLAUDE.md";
    case "cursorrules": return ".cursorrules";
    case "copilot-instructions": return ".github/copilot-instructions.md";
    case "windsurfrules": return ".windsurfrules";
  }
}
