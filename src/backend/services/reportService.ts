/**
 * reportService.ts — Evidence-based release-readiness report (spec2ship-plan.md Section 13).
 *
 * NOT READY when any:
 *   - critical requirement has zero coverage
 *   - security test linked to critical req has status=fail
 *   - critical req has no_coverage or no_executed_coverage gap
 *   - overall coverage < 70%
 *
 * REVIEW REQUIRED when no NOT READY applies and any:
 *   - coverage 70-89%
 *   - high/medium req has any gap
 *   - any test is not_run or blocked
 *   - any requirement is changed=true
 *
 * READY when all:
 *   - coverage >= 90%
 *   - every critical req has at least one passing test
 *   - no security test linked to critical req fails
 *   - no critical req has no_coverage or no_executed_coverage
 */
import type {
  Requirement, TestCase, TraceabilityLink, CoverageGap,
  ReleaseReadinessReport, RequirementStatus, ReleaseVerdict,
  CoverageStatus,
} from '../types/models.js';
import { computeAllRiskScores } from './riskService.js';
import { computeCoverageGaps } from './coverageService.js';

export function buildReleaseReadinessReport(
  requirements: Requirement[],
  testCases: TestCase[],
  links: TraceabilityLink[],
): ReleaseReadinessReport {
  const now = new Date().toISOString();
  const tcById = new Map(testCases.map((tc) => [tc.id, tc]));

  const gapReport = computeCoverageGaps(requirements, testCases, links);
  const riskScores = computeAllRiskScores(requirements, testCases, links);
  const riskById = new Map(riskScores.map((r) => [r.requirementId, r]));
  const gapByReqId = new Map<string, CoverageGap[]>();
  for (const gap of gapReport.gaps) {
    const existing = gapByReqId.get(gap.requirementId) ?? [];
    existing.push(gap);
    gapByReqId.set(gap.requirementId, existing);
  }

  // Build per-requirement link maps
  const reqLinkedTests = new Map<string, TestCase[]>();
  for (const req of requirements) reqLinkedTests.set(req.id, []);
  for (const link of links) {
    const tc = tcById.get(link.testCaseId);
    if (tc) reqLinkedTests.get(link.requirementId)?.push(tc);
  }

  // ---- Coverage percentage ----
  // "covered" = has at least one passing test
  function hasPassing(reqId: string): boolean {
    return (reqLinkedTests.get(reqId) ?? []).some((tc) => tc.status === 'pass');
  }
  const coveredWithPassing = requirements.filter((r) => hasPassing(r.id)).length;
  const coveragePercentage = requirements.length === 0
    ? 0
    : Math.round((coveredWithPassing / requirements.length) * 1000) / 10;

  // ---- Blocking reasons (NOT READY conditions) ----
  const blockingReasons: string[] = [];

  // 1. critical req with zero coverage
  for (const req of requirements.filter((r) => r.criticality === 'critical')) {
    const linked = reqLinkedTests.get(req.id) ?? [];
    if (linked.length === 0) {
      blockingReasons.push(`Critical requirement ${req.id} ("${req.title}") has zero test coverage.`);
    }
  }

  // 2. security test linked to critical req that fails
  for (const req of requirements.filter((r) => r.criticality === 'critical')) {
    const linked = reqLinkedTests.get(req.id) ?? [];
    for (const tc of linked) {
      if (tc.type === 'security' && tc.status === 'fail') {
        blockingReasons.push(`security test ${tc.id} linked to critical requirement ${req.id} is failing.`);
      }
    }
  }

  // 3. critical req with no_coverage or no_executed_coverage gap
  for (const req of requirements.filter((r) => r.criticality === 'critical')) {
    const gaps = gapByReqId.get(req.id) ?? [];
    for (const gap of gaps) {
      if (gap.gapType === 'no_coverage' || gap.gapType === 'no_executed_coverage') {
        blockingReasons.push(`Critical requirement ${req.id} has an unresolved ${gap.gapType} coverage gap.`);
      }
    }
  }

  // 4. overall coverage < 70%
  if (coveragePercentage < 70) {
    blockingReasons.push(`Overall requirement coverage is ${coveragePercentage.toFixed(1)}%, which is below the 70% threshold.`);
  }

  // ---- Review reasons (REVIEW REQUIRED conditions) ----
  const reviewReasons: string[] = [];
  if (blockingReasons.length === 0) {
    // coverage 70-89%
    if (coveragePercentage >= 70 && coveragePercentage < 90) {
      reviewReasons.push(`Overall requirement coverage is ${coveragePercentage.toFixed(1)}% (70–89% range requires review).`);
    }
    // high/medium gaps
    for (const req of requirements.filter((r) => r.criticality === 'high' || r.criticality === 'medium')) {
      const gaps = gapByReqId.get(req.id) ?? [];
      if (gaps.length > 0) {
        reviewReasons.push(`${req.criticality} requirement ${req.id} has a coverage gap (${gaps.map((g) => g.gapType).join(', ')}).`);
      }
    }
    // any test not_run or blocked
    const incomplete = testCases.filter((tc) => tc.status === 'not_run' || tc.status === 'blocked');
    if (incomplete.length > 0) {
      reviewReasons.push(`${incomplete.length} test(s) are incomplete (not_run or blocked): ${incomplete.map((t) => t.id).join(', ')}.`);
    }
    // changed requirements
    const changed = requirements.filter((r) => r.changed);
    if (changed.length > 0) {
      reviewReasons.push(`${changed.length} requirement(s) marked as changed require validation: ${changed.map((r) => r.id).join(', ')}.`);
    }
  }

  // ---- Ready confirmations ----
  const readyConfirmations: string[] = [];
  if (blockingReasons.length === 0 && reviewReasons.length === 0) {
    readyConfirmations.push(`Overall requirement coverage is ${coveragePercentage.toFixed(1)}%, meeting the 90% threshold.`);
    const criticals = requirements.filter((r) => r.criticality === 'critical');
    if (criticals.length > 0) {
      readyConfirmations.push(`All ${criticals.length} critical requirement(s) have at least one passing test.`);
    }
    readyConfirmations.push('No security tests linked to critical requirements are failing.');
    readyConfirmations.push('No critical requirements have unresolved no_coverage or no_executed_coverage gaps.');
  }

  // ---- Verdict ----
  let overallVerdict: ReleaseVerdict;
  let verdictRationale: string;
  if (blockingReasons.length > 0) {
    overallVerdict = 'Not Ready';
    verdictRationale = `Release is blocked by ${blockingReasons.length} condition(s). All blocking issues must be resolved before shipping.`;
  } else if (reviewReasons.length > 0) {
    overallVerdict = 'Review Required';
    verdictRationale = `No blocking conditions apply, but ${reviewReasons.length} condition(s) require human review before shipping.`;
  } else {
    overallVerdict = 'Ready';
    verdictRationale = `All readiness conditions are met. The build is safe to release based on current evidence.`;
  }

  // ---- Summary counts ----
  const passingTests = testCases.filter((tc) => tc.status === 'pass').length;
  const failingTests = testCases.filter((tc) => tc.status === 'fail').length;
  const notRunTests = testCases.filter((tc) => tc.status === 'not_run').length;
  const blockedTests = testCases.filter((tc) => tc.status === 'blocked').length;
  const criticalRiskCount = riskScores.filter((r) => r.tier === 'Critical').length;
  const highRiskCount = riskScores.filter((r) => r.tier === 'High').length;
  const mediumRiskCount = riskScores.filter((r) => r.tier === 'Medium').length;
  const lowRiskCount = riskScores.filter((r) => r.tier === 'Low').length;

  // ---- Per-requirement statuses ----
  const requirementStatuses: RequirementStatus[] = requirements.map((req) => {
    const linked = reqLinkedTests.get(req.id) ?? [];
    const gaps = gapByReqId.get(req.id) ?? [];
    const rs = riskById.get(req.id)!;

    let coverageStatus: CoverageStatus;
    const hasCovGap = gaps.find((g) => g.gapType === 'no_coverage');
    const hasExecGap = gaps.find((g) => g.gapType === 'no_executed_coverage');
    if (hasCovGap || linked.length === 0) {
      coverageStatus = 'none';
    } else if (hasExecGap) {
      coverageStatus = 'partial';
    } else {
      const allFull = links
        .filter((l) => l.requirementId === req.id)
        .every((l) => l.coverageType === 'full');
      coverageStatus = allFull ? 'full' : 'partial';
    }

    const gapDetails = gaps.length > 0 ? gaps.map((g) => g.message).join(' ') : null;

    return {
      requirement: req,
      riskScore: rs.score,
      riskTier: rs.tier,
      coverageStatus,
      linkedTests: linked,
      gapDetails,
    };
  });

  return {
    generatedAt: now,
    overallVerdict,
    verdictRationale,
    summary: {
      totalRequirements: requirements.length,
      coveredRequirements: coveredWithPassing,
      uncoveredRequirements: requirements.length - coveredWithPassing,
      passingTests,
      failingTests,
      notRunTests,
      blockedTests,
      criticalRiskCount,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
    },
    requirementStatuses,
    coveragePercentage,
    blockingReasons,
    reviewReasons,
    readyConfirmations,
  };
}
