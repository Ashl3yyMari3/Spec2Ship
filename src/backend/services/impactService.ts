/**
 * impactService.ts — Change-impact analysis (spec2ship-plan.md Section 11).
 *
 * Given a requirementId:
 *  1. Find all TraceabilityLinks for that requirement.
 *  2. Collect the linked TestCase objects (directly impacted tests).
 *  3. For each linked test, find all other requirements that share that test
 *     (transitively impacted requirements).
 *  4. Return ImpactReport with a human-readable recommendation.
 */
import type { Requirement, TestCase, TraceabilityLink, ImpactReport } from '../types/models.js';

export function computeImpact(
  requirementId: string,
  requirements: Requirement[],
  testCases: TestCase[],
  links: TraceabilityLink[],
): ImpactReport | null {
  const reqById = new Map(requirements.map((r) => [r.id, r]));
  const tcById = new Map(testCases.map((tc) => [tc.id, tc]));

  if (!reqById.has(requirementId)) return null;

  // Direct: all links for this requirement
  const directLinks = links.filter((l) => l.requirementId === requirementId);
  const directTestIds = new Set(directLinks.map((l) => l.testCaseId));
  const directlyImpactedTests: TestCase[] = [...directTestIds]
    .map((id) => tcById.get(id))
    .filter((tc): tc is TestCase => tc !== undefined);

  // Transitive: other requirements that share any of these tests
  const transitiveReqIds = new Set<string>();
  for (const tc of directlyImpactedTests) {
    // Find all links that point to this test case
    const sharingLinks = links.filter(
      (l) => l.testCaseId === tc.id && l.requirementId !== requirementId,
    );
    for (const sl of sharingLinks) {
      transitiveReqIds.add(sl.requirementId);
    }
  }
  const transitivelyImpactedReqs: Requirement[] = [...transitiveReqIds]
    .map((id) => reqById.get(id))
    .filter((r): r is Requirement => r !== undefined);

  // Human-readable recommendation
  const testCount = directlyImpactedTests.length;
  const transCount = transitivelyImpactedReqs.length;
  let recommendation: string;

  if (testCount === 0) {
    recommendation = `${requirementId} has no linked tests. No immediate re-evaluation is required, but consider adding coverage before releasing.`;
  } else {
    const transNote = transCount > 0
      ? ` Additionally, ${transCount} other requirement(s) share tests with this change (${transitivelyImpactedReqs.map((r) => r.id).join(', ')}) and should be reviewed.`
      : '';
    recommendation = `${requirementId} is linked to ${testCount} test(s) that must be re-evaluated following this change.${transNote}`;
  }

  return {
    changedRequirementId: requirementId,
    directlyImpactedTests,
    transitivelyImpactedReqs,
    recommendation,
  };
}
