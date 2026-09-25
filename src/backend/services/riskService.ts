/**
 * riskService.ts — Four-factor deterministic risk scoring (spec2ship-plan.md Section 12).
 *
 * Weights:   criticality=35%, coverageGap=30%, executionCompleteness=20%, changeImpact=15%
 * Raw values:
 *   criticality:          low=10, medium=40, high=70, critical=100
 *   coverageGap:          fully covered=0, partial=50, no coverage=100
 *   executionCompleteness: all pass=0, some not_run/blocked=50, any fail=100
 *   changeImpact:         unchanged=0, changed=100
 *
 * Risk tiers: 0-24=Low, 25-49=Medium, 50-74=High, 75-100=Critical
 */
import type {
  Requirement, TestCase, TraceabilityLink,
  RiskScore, RiskTier,
} from '../types/models.js';

const CRITICALITY_RAW: Record<string, number> = { low: 10, medium: 40, high: 70, critical: 100 };

function tierFromScore(score: number): RiskTier {
  if (score < 25) return 'Low';
  if (score < 50) return 'Medium';
  if (score < 75) return 'High';
  return 'Critical';
}

export function computeRiskScore(
  req: Requirement,
  testCases: TestCase[],
  links: TraceabilityLink[],
): RiskScore {
  const tcById = new Map(testCases.map((tc) => [tc.id, tc]));

  // --- Criticality raw ---
  const criticalityRaw = CRITICALITY_RAW[req.criticality] ?? 40;

  // --- Coverage gap raw ---
  const linked = links
    .filter((l) => l.requirementId === req.id)
    .map((l) => tcById.get(l.testCaseId))
    .filter((tc): tc is TestCase => tc !== undefined);

  let coverageGapRaw: number;
  if (linked.length === 0) {
    coverageGapRaw = 100;
  } else {
    const hasExecuted = linked.some((tc) => tc.status !== 'not_run' && tc.status !== 'blocked');
    coverageGapRaw = hasExecuted ? 0 : 50;
  }

  // --- Execution completeness raw ---
  let executionCompletenessRaw: number;
  if (linked.length === 0) {
    executionCompletenessRaw = 100; // no coverage → treat as worst execution
  } else if (linked.some((tc) => tc.status === 'fail')) {
    executionCompletenessRaw = 100;
  } else if (linked.some((tc) => tc.status === 'not_run' || tc.status === 'blocked')) {
    executionCompletenessRaw = 50;
  } else {
    executionCompletenessRaw = 0; // all pass
  }

  // --- Change impact raw ---
  const changeImpactRaw = req.changed ? 100 : 0;

  // --- Weighted score ---
  const critW = criticalityRaw * 0.35;
  const covW = coverageGapRaw * 0.30;
  const execW = executionCompletenessRaw * 0.20;
  const changeW = changeImpactRaw * 0.15;
  const score = Math.round((critW + covW + execW + changeW) * 10) / 10;

  return {
    requirementId: req.id,
    score,
    tier: tierFromScore(score),
    factors: {
      criticalityRaw,
      coverageGapRaw,
      executionCompletenessRaw,
      changeImpactRaw,
    },
    weightedContributions: {
      criticality: Math.round(critW * 10) / 10,
      coverageGap: Math.round(covW * 10) / 10,
      executionCompleteness: Math.round(execW * 10) / 10,
      changeImpact: Math.round(changeW * 10) / 10,
    },
  };
}

export function computeAllRiskScores(
  requirements: Requirement[],
  testCases: TestCase[],
  links: TraceabilityLink[],
): RiskScore[] {
  return requirements.map((req) => computeRiskScore(req, testCases, links));
}
