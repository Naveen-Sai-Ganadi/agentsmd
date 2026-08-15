import { lintAgentsMd, auditAgentsMd, lintAgentsMdNested, auditAgentsMdNested } from "./lint.ts";
import type {
  LintReport,
  AuditReport,
  LintSeverity,
  NestedLintReport,
  NestedAuditReport,
} from "./lint.ts";
import * as path from "node:path";

export type Grade = "A" | "B" | "C" | "D" | "F";

const GRADE_FLOOR: Record<Grade, number> = { A: 90, B: 80, C: 60, D: 50, F: 0 };

export interface CheckOptions {
  minGrade?: Grade;
  minScore?: number;
  failOn?: LintSeverity;
}

export interface CheckResult {
  target: string;
  passed: boolean;
  reasons: string[];
  gate: {
    minGrade: Grade;
    minScore: number;
    failOn: LintSeverity;
  };
  lint: LintReport;
  audit: AuditReport;
}

export function evaluateCheck(
  lint: LintReport,
  audit: AuditReport,
  opts: CheckOptions = {},
): CheckResult {
  const minGrade: Grade = opts.minGrade ?? "C";
  const explicitScore = typeof opts.minScore === "number";
  const minScore = explicitScore ? (opts.minScore as number) : GRADE_FLOOR[minGrade];
  const failOn: LintSeverity = opts.failOn ?? "error";

  const reasons: string[] = [];

  const sevRank: Record<LintSeverity, number> = { info: 0, warn: 1, error: 2 };
  const failThreshold = sevRank[failOn];
  const failingIssues = lint.issues.filter((i) => sevRank[i.severity] >= failThreshold);
  if (failingIssues.length > 0) {
    reasons.push(
      `${failingIssues.length} lint issue(s) at or above ${failOn} severity (fail-on=${failOn})`,
    );
  }

  if (audit.overall < minScore) {
    reasons.push(
      `audit score ${audit.overall}/100 below floor ${minScore} (min-grade=${minGrade})`,
    );
  }

  if (!lint.exists) {
    // lint already emits an error for missing file; keep this explicit in reasons.
    if (!reasons.some((r) => r.includes("lint issue"))) {
      reasons.push("AGENTS.md not found");
    }
  }

  return {
    target: audit.target,
    passed: reasons.length === 0,
    reasons,
    gate: { minGrade, minScore, failOn },
    lint,
    audit,
  };
}

export async function runCheck(root: string, opts: CheckOptions = {}): Promise<CheckResult> {
  const lint = await lintAgentsMd(root);
  const audit = await auditAgentsMd(root);
  return evaluateCheck(lint, audit, opts);
}

export interface NestedCheckEntry {
  relPath: string;
  depth: number;
  passed: boolean;
  reasons: string[];
  lintErrors: number;
  lintWarnings: number;
  lintInfos: number;
  audit: number;
  grade: AuditReport["grade"];
  exists: boolean;
}

export interface NestedCheckResult {
  root: string;
  totalFiles: number;
  passed: boolean;
  passedFiles: number;
  failedFiles: number;
  gate: {
    minGrade: Grade;
    minScore: number;
    failOn: LintSeverity;
  };
  rollup: {
    overall: number; // mean per-file audit
    lowest: number; // weakest link
    grade: AuditReport["grade"];
    totalErrors: number;
    totalWarnings: number;
    totalInfos: number;
  };
  entries: NestedCheckEntry[];
}

export interface NestedCheckOptions extends CheckOptions {
  maxDepth?: number;
}

// Nested check runs the CI gate against every AGENTS.md discovered in
// the tree. A monorepo fails when *any* nested file breaches the gate —
// weakest-link semantics that match the `lowest` roll-up from
// `audit --nested`. This closes the fourth vertical slice of monorepo
// mode; alongside `tree`, `lint --nested`, and `audit --nested`, it
// makes `agentsmd` the first tool-agnostic, CI-facing nested-AGENTS.md
// gate we've seen in the wild.
export async function runCheckNested(
  root: string,
  opts: NestedCheckOptions = {},
): Promise<NestedCheckResult> {
  const minGrade: Grade = opts.minGrade ?? "C";
  const explicitScore = typeof opts.minScore === "number";
  const minScore = explicitScore ? (opts.minScore as number) : GRADE_FLOOR[minGrade];
  const failOn: LintSeverity = opts.failOn ?? "error";

  const [lintNested, auditNested]: [NestedLintReport, NestedAuditReport] = await Promise.all([
    lintAgentsMdNested(root, { maxDepth: opts.maxDepth }),
    auditAgentsMdNested(root, { maxDepth: opts.maxDepth }),
  ]);

  const auditByRel = new Map(auditNested.entries.map((e) => [e.relPath, e]));

  const entries: NestedCheckEntry[] = lintNested.entries.map((lintEntry) => {
    const auditEntry = auditByRel.get(lintEntry.relPath);
    const audit: AuditReport = auditEntry ?? {
      target: lintEntry.target,
      exists: lintEntry.exists,
      overall: 0,
      grade: "F" as const,
      dimensions: [],
      lint: lintEntry,
    };
    const result = evaluateCheck(lintEntry, audit, { minGrade, minScore, failOn });
    const errs = lintEntry.issues.filter((i) => i.severity === "error").length;
    const warns = lintEntry.issues.filter((i) => i.severity === "warn").length;
    const infos = lintEntry.issues.filter((i) => i.severity === "info").length;
    return {
      relPath: lintEntry.relPath,
      depth: lintEntry.depth,
      passed: result.passed,
      reasons: result.reasons,
      lintErrors: errs,
      lintWarnings: warns,
      lintInfos: infos,
      audit: audit.overall,
      grade: audit.grade,
      exists: lintEntry.exists,
    };
  });

  const failedFiles = entries.filter((e) => !e.passed).length;
  const passedFiles = entries.length - failedFiles;

  return {
    root: path.resolve(root),
    totalFiles: entries.length,
    passed: failedFiles === 0,
    passedFiles,
    failedFiles,
    gate: { minGrade, minScore, failOn },
    rollup: {
      overall: auditNested.overall,
      lowest: auditNested.lowest,
      grade: auditNested.grade,
      totalErrors: lintNested.totalErrors,
      totalWarnings: lintNested.totalWarnings,
      totalInfos: lintNested.totalInfos,
    },
    entries,
  };
}

export function parseGrade(raw: string | undefined): Grade | undefined {
  if (!raw) return undefined;
  const g = raw.toUpperCase();
  if (g === "A" || g === "B" || g === "C" || g === "D" || g === "F") return g;
  throw new Error(`Invalid grade: ${raw} (expected A, B, C, D, or F)`);
}

export function parseFailOn(raw: string | undefined): LintSeverity | undefined {
  if (!raw) return undefined;
  const s = raw.toLowerCase();
  if (s === "error" || s === "warn" || s === "info") return s;
  throw new Error(`Invalid --fail-on: ${raw} (expected error, warn, or info)`);
}
