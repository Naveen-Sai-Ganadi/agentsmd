import { promises as fs } from "node:fs";
import * as path from "node:path";
type SiblingKind = "claude-md" | "cursorrules" | "copilot-instructions" | "windsurfrules";
const SIBLING_CONFIGS: { kind: SiblingKind; rel: string }[] = [
  { kind: "claude-md", rel: "CLAUDE.md" },
  { kind: "cursorrules", rel: ".cursorrules" },
  { kind: "copilot-instructions", rel: ".github/copilot-instructions.md" },
  { kind: "windsurfrules", rel: ".windsurfrules" },
];

async function detectSiblings(root: string): Promise<{ kind: SiblingKind; path: string }[]> {
  const out: { kind: SiblingKind; path: string }[] = [];
  for (const { kind, rel } of SIBLING_CONFIGS) {
    const p = path.join(root, rel);
    try {
      const st = await fs.stat(p);
      if (st.isFile()) out.push({ kind, path: p });
    } catch {
      // absent
    }
  }
  return out;
}

export type LintSeverity = "error" | "warn" | "info";

export interface LintIssue {
  rule: string;
  severity: LintSeverity;
  message: string;
  line?: number;
}

export interface LintReport {
  target: string;
  exists: boolean;
  bytes: number;
  issues: LintIssue[];
}

const REQUIRED_SECTION_HINTS: { name: string; patterns: RegExp[] }[] = [
  { name: "project/overview", patterns: [/^#{1,3}\s.*(project|overview|about|summary)/im] },
  { name: "stack/tech", patterns: [/^#{1,3}\s.*(stack|tech|technolog|architecture)/im, /\b(node|python|rust|go|typescript|javascript)\b/i] },
  { name: "commands/scripts", patterns: [/^#{1,3}\s.*(command|script|build|test|run)/im, /```(bash|sh|shell)?[\s\S]*?```/] },
  { name: "conventions/rules", patterns: [/^#{1,3}\s.*(convention|rule|style|guideline|do not|dos and don)/im] },
];

const VAGUE_PHRASES = [
  /write (good|clean|nice) code/i,
  /best practices/i,
  /follow the rules/i,
  /be careful/i,
  /make it work/i,
];

const LONG_LINE_LIMIT = 240;
const MIN_USEFUL_BYTES = 200;
const MAX_HEALTHY_BYTES = 15_000;

export async function lintAgentsMd(root: string): Promise<LintReport> {
  const target = path.join(root, "AGENTS.md");
  const issues: LintIssue[] = [];
  let text: string | null = null;
  try {
    text = await fs.readFile(target, "utf8");
  } catch {
    return {
      target,
      exists: false,
      bytes: 0,
      issues: [
        { rule: "missing-file", severity: "error", message: "AGENTS.md not found. Run `agentsmd init --apply` to scaffold one." },
      ],
    };
  }

  const bytes = Buffer.byteLength(text, "utf8");
  const lines = text.split("\n");

  if (bytes < MIN_USEFUL_BYTES) {
    issues.push({
      rule: "too-short",
      severity: "warn",
      message: `AGENTS.md is only ${bytes} bytes; expected ≥ ${MIN_USEFUL_BYTES} for useful guidance.`,
    });
  }
  if (bytes > MAX_HEALTHY_BYTES) {
    issues.push({
      rule: "too-long",
      severity: "warn",
      message: `AGENTS.md is ${bytes} bytes; consider splitting or trimming (over ${MAX_HEALTHY_BYTES}).`,
    });
  }

  const headingCount = lines.filter((l) => /^#{1,6}\s/.test(l)).length;
  if (headingCount === 0) {
    issues.push({
      rule: "no-headings",
      severity: "error",
      message: "AGENTS.md has no markdown headings; agents rely on section structure.",
    });
  } else if (headingCount < 3) {
    issues.push({
      rule: "few-headings",
      severity: "info",
      message: `Only ${headingCount} heading(s); consider more sections for skimmability.`,
    });
  }

  for (const req of REQUIRED_SECTION_HINTS) {
    const hit = req.patterns.some((p) => p.test(text!));
    if (!hit) {
      issues.push({
        rule: `missing-section:${req.name}`,
        severity: "warn",
        message: `No content matching "${req.name}" detected.`,
      });
    }
  }

  lines.forEach((line, i) => {
    if (line.length > LONG_LINE_LIMIT) {
      issues.push({
        rule: "long-line",
        severity: "info",
        message: `Line exceeds ${LONG_LINE_LIMIT} chars (${line.length}).`,
        line: i + 1,
      });
    }
    if (/\bTODO\b|\bTBD\b|\bFIXME\b|<PLACEHOLDER>/i.test(line)) {
      issues.push({
        rule: "placeholder",
        severity: "warn",
        message: `Unresolved placeholder marker on this line.`,
        line: i + 1,
      });
    }
  });

  for (const vague of VAGUE_PHRASES) {
    const m = text.match(vague);
    if (m) {
      issues.push({
        rule: "vague-directive",
        severity: "info",
        message: `Vague phrase "${m[0]}" — prefer concrete, checkable rules.`,
      });
    }
  }

  const others = await detectSiblings(root);
  const sourceText = text;
  if (others.length > 0) {
    let banneredCount = 0;
    for (const c of others) {
      try {
        const otherText = await fs.readFile(c.path, "utf8");
        if (/agentsmd:generated/i.test(otherText)) banneredCount++;
        else {
          issues.push({
            rule: "unsynced-config",
            severity: "warn",
            message: `${path.relative(root, c.path)} exists but has no agentsmd banner — likely out of sync. Run \`agentsmd sync --apply\`.`,
          });
        }
      } catch {
        // ignore read failure on sibling
      }
    }
    if (banneredCount === others.length && others.length > 0 && sourceText.length < MIN_USEFUL_BYTES) {
      // covered by too-short
    }
  }

  return { target, exists: true, bytes, issues };
}

export type AuditDimension =
  | "completeness"
  | "specificity"
  | "structure"
  | "length"
  | "freshness"
  | "consistency";

export interface DimensionScore {
  dimension: AuditDimension;
  score: number; // 0-100
  notes: string[];
}

export interface AuditReport {
  target: string;
  exists: boolean;
  overall: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  dimensions: DimensionScore[];
  lint: LintReport;
}

function grade(score: number): AuditReport["grade"] {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

export async function auditAgentsMd(root: string): Promise<AuditReport> {
  const lint = await lintAgentsMd(root);
  const target = lint.target;

  if (!lint.exists) {
    return {
      target,
      exists: false,
      overall: 0,
      grade: "F",
      dimensions: [
        { dimension: "completeness", score: 0, notes: ["AGENTS.md missing."] },
        { dimension: "specificity", score: 0, notes: ["AGENTS.md missing."] },
        { dimension: "structure", score: 0, notes: ["AGENTS.md missing."] },
        { dimension: "length", score: 0, notes: ["AGENTS.md missing."] },
        { dimension: "freshness", score: 0, notes: ["AGENTS.md missing."] },
        { dimension: "consistency", score: 0, notes: ["AGENTS.md missing."] },
      ],
      lint,
    };
  }

  const text = await fs.readFile(target, "utf8");
  const lines = text.split("\n");
  const bytes = lint.bytes;

  // Completeness — cover required section hints
  const covered = REQUIRED_SECTION_HINTS.filter((r) => r.patterns.some((p) => p.test(text))).length;
  const completeness = Math.round((covered / REQUIRED_SECTION_HINTS.length) * 100);

  // Specificity — penalize vague phrases, reward code blocks and bullets
  const vagueHits = VAGUE_PHRASES.reduce((n, p) => n + (p.test(text) ? 1 : 0), 0);
  const codeBlocks = (text.match(/```/g) || []).length / 2;
  const bulletCount = lines.filter((l) => /^\s*[-*]\s/.test(l)).length;
  let specificity = 60 + Math.min(20, bulletCount) + Math.min(20, codeBlocks * 5) - vagueHits * 15;
  specificity = Math.max(0, Math.min(100, specificity));

  // Structure — headings, depth, ordering
  const headings = lines.filter((l) => /^#{1,6}\s/.test(l)).length;
  const topLevel = lines.filter((l) => /^#\s/.test(l)).length;
  let structure = Math.min(100, headings * 12);
  if (topLevel === 0) structure = Math.max(0, structure - 20);
  if (topLevel > 3) structure = Math.max(0, structure - 10);

  // Length — sweet spot 500–8000 bytes
  let length: number;
  if (bytes < MIN_USEFUL_BYTES) length = Math.round((bytes / MIN_USEFUL_BYTES) * 50);
  else if (bytes <= 8000) length = 100;
  else if (bytes <= MAX_HEALTHY_BYTES) length = 80;
  else length = Math.max(30, 80 - Math.floor((bytes - MAX_HEALTHY_BYTES) / 2000) * 10);

  // Freshness — mentions stack items that appear in the repo
  const freshnessNotes: string[] = [];
  let freshness = 70;
  try {
    const pkgRaw = await fs.readFile(path.join(root, "package.json"), "utf8").catch(() => null);
    if (pkgRaw) {
      const pkg = JSON.parse(pkgRaw);
      const scripts = Object.keys(pkg.scripts || {});
      const mentioned = scripts.filter((s) => new RegExp(`\\b${s}\\b`, "i").test(text)).length;
      if (scripts.length > 0) {
        freshness = Math.round((mentioned / scripts.length) * 60) + 40;
        freshnessNotes.push(`${mentioned}/${scripts.length} package.json scripts referenced in AGENTS.md.`);
      }
    } else {
      freshnessNotes.push("No package.json to cross-check; freshness inferred from headings only.");
    }
  } catch {
    freshnessNotes.push("Could not parse package.json.");
  }
  const placeholderHits = lint.issues.filter((i) => i.rule === "placeholder").length;
  if (placeholderHits > 0) {
    freshness = Math.max(0, freshness - placeholderHits * 10);
    freshnessNotes.push(`${placeholderHits} unresolved placeholder(s) found.`);
  }

  // Consistency — sync status with other configs
  const unsynced = lint.issues.filter((i) => i.rule === "unsynced-config").length;
  const otherConfigs = await detectSiblings(root);
  let consistency: number;
  if (otherConfigs.length === 0) {
    consistency = 100;
  } else {
    const synced = otherConfigs.length - unsynced;
    consistency = Math.round((synced / otherConfigs.length) * 100);
  }

  const dimensions: DimensionScore[] = [
    { dimension: "completeness", score: completeness, notes: [`${covered}/${REQUIRED_SECTION_HINTS.length} required-section hints matched.`] },
    { dimension: "specificity", score: specificity, notes: [`${bulletCount} bullet(s), ${codeBlocks} code block(s), ${vagueHits} vague phrase(s).`] },
    { dimension: "structure", score: structure, notes: [`${headings} heading(s); ${topLevel} top-level.`] },
    { dimension: "length", score: length, notes: [`${bytes} bytes.`] },
    { dimension: "freshness", score: freshness, notes: freshnessNotes },
    { dimension: "consistency", score: consistency, notes: [`${otherConfigs.length - unsynced}/${otherConfigs.length || 0} sibling configs appear synced.`] },
  ];

  const overall = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);
  return { target, exists: true, overall, grade: grade(overall), dimensions, lint };
}
