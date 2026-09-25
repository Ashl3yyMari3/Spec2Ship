/**
 * coverageService.ts — Coverage-gap detection.
 *
 * Gap types (from spec2ship-plan.md Section 10):
 *   no_coverage            — requirement has zero TraceabilityLink entries
 *   no_executed_coverage   — all linked tests have status not_run or blocked
 *   missing_test_types     — no linked test covers "negative" or "boundary" type (informational)
 */
import type {
  Requirement, TestCase, TraceabilityLink,
  CoverageGap, CoverageGapReport,
} from '../types/models.js';

export function computeCoverageGaps(
  requirements: Requirement[],
  testCases: TestCase[],
  links: TraceabilityLink[],
): CoverageGapReport {
  const tcById = new Map(testCases.map((tc) => [tc.id, tc]));

  // Build map: requirementId -> linked TestCase[]
  const reqTests = new Map<string, TestCase[]>();
  for (const req of requirements) {
    reqTests.set(req.id, []);
  }
  for (const link of links) {
    const existing = reqTests.get(link.requirementId);
    if (existing) {
      const tc = tcById.get(link.testCaseId);
      if (tc) existing.push(tc);
    }
  }

  const gaps: CoverageGap[] = [];
  let coveredCount = 0;

  for (const req of requirements) {
    const linked = reqTests.get(req.id) ?? [];

    if (linked.length === 0) {
      gaps.push({
        requirementId: req.id,
        gapType: 'no_coverage',
        missingTypes: [],
        message: `${req.id} has no test coverage.`,
      });
      continue;
    }

    // Check if all linked tests are unexecuted
    const executed = linked.filter((tc) => tc.status !== 'not_run' && tc.status !== 'blocked');
    if (executed.length === 0) {
      gaps.push({
        requirementId: req.id,
        gapType: 'no_executed_coverage',
        missingTypes: [],
        message: `${req.id} has linked tests but none have been executed (all not_run or blocked).`,
      });
      continue;
    }

    // Check for missing test types (informational — does not prevent "covered" status)
    const coveredTypes = new Set(linked.map((tc) => tc.type));
    const missingTypes: string[] = [];
    if (!coveredTypes.has('negative')) missingTypes.push('negative');
    if (!coveredTypes.has('boundary')) missingTypes.push('boundary');

    if (missingTypes.length > 0) {
      gaps.push({
        requirementId: req.id,
        gapType: 'missing_test_types',
        missingTypes,
        message: `${req.id} is missing test types: ${missingTypes.join(', ')}.`,
      });
    }

    // This requirement is covered (has at least one executed test)
    coveredCount++;
  }

  // Requirements with only missing_test_types gaps still count as covered
  // (they have executed tests); requirements with no_coverage or no_executed_coverage do not
  const notCovered = gaps.filter(
    (g) => g.gapType === 'no_coverage' || g.gapType === 'no_executed_coverage',
  ).length;
  const actualCovered = requirements.length - notCovered;

  return {
    totalRequirements: requirements.length,
    coveredCount: actualCovered,
    gapCount: gaps.length,
    gaps,
  };
}
