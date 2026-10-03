import type {
  Requirement,
  TestCase,
  TraceabilityLink,
  RequirementCoverageEvaluation,
  CoverageStatus,
} from '../types/models.js';

export function computeRequirementCoverage(
  requirement: Requirement,
  testCases: TestCase[],
  links: TraceabilityLink[],
): RequirementCoverageEvaluation {
  const linkedTestIds = new Set(
    links
      .filter((link) => link.requirementId === requirement.id)
      .map((link) => link.testCaseId),
  );

  const linkedTests = testCases.filter((testCase) =>
    linkedTestIds.has(testCase.id),
  );

  const coveredCriteriaIndexes = new Set<number>();

  for (const testCase of linkedTests) {
    for (const ref of testCase.acceptanceCriteriaRefs) {
      if (
        ref.requirementId === requirement.id &&
        ref.criterionIndex >= 0 &&
        ref.criterionIndex < requirement.acceptanceCriteria.length
      ) {
        coveredCriteriaIndexes.add(ref.criterionIndex);
      }
    }
  }

  const totalCriteria = requirement.acceptanceCriteria.length;

  const uncoveredCriteriaIndexes = Array.from(
    { length: totalCriteria },
    (_, index) => index,
  ).filter((index) => !coveredCriteriaIndexes.has(index));

  const coveredCriteriaCount = coveredCriteriaIndexes.size;

  let status: CoverageStatus;

  if (coveredCriteriaCount === 0) {
    status = 'none';
  } else if (coveredCriteriaCount < totalCriteria) {
    status = 'partial';
  } else {
    status = 'full';
  }

  return {
    requirementId: requirement.id,
    status,
    totalCriteria,
    coveredCriteriaCount,
    coveredCriteriaIndexes: [...coveredCriteriaIndexes].sort((a, b) => a - b),
    uncoveredCriteriaIndexes,
    linkedTestIds: linkedTests.map((testCase) => testCase.id),
  };
}