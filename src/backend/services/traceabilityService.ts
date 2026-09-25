/**
 * traceabilityService.ts — Builds the TraceabilityMatrix from requirements, tests, and links.
 */
import type { Requirement, TestCase, TraceabilityLink, TraceabilityMatrix } from '../types/models.js';

export function buildTraceabilityMatrix(
  requirements: Requirement[],
  testCases: TestCase[],
  links: TraceabilityLink[],
): TraceabilityMatrix {
  const tcById = new Map(testCases.map((tc) => [tc.id, tc]));
  const reqById = new Map(requirements.map((r) => [r.id, r]));

  // Validate links and drop any that reference unknown entities
  const validLinks = links.filter((link) => {
    if (!reqById.has(link.requirementId)) {
      console.warn(`[traceability] Unknown requirementId "${link.requirementId}" — link dropped`);
      return false;
    }
    if (!tcById.has(link.testCaseId)) {
      console.warn(`[traceability] Unknown testCaseId "${link.testCaseId}" — link dropped`);
      return false;
    }
    return true;
  });

  return {
    requirements,
    testCases,
    links: validLinks,
    generatedAt: new Date().toISOString(),
  };
}
