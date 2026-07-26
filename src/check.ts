import { lintAgentsMd, auditAgentsMd } from "./lint.ts";
import type { LintReport, AuditReport, LintSeverity } from "./lint.ts";

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
