import { describe, expect, it } from 'vitest';
import type {
  Requirement,
  TestCase,
  TraceabilityLink,
} from '../../src/backend/types/models.js';
import { computeRequirementCoverage } from '../../src/backend/services/requirementCoverageService.js';

const requirement: Requirement = {
  id: 'REQ-001',
  title: 'User Login',
  description: 'User must be able to log in.',
  acceptanceCriteria: [
    'Email is required.',
    'Password is required.',
    'Valid credentials authenticate the user.',
  ],
  domain: 'authentication',
  criticality: 'high',
  sourceFile: 'requirements.md',
  tags: [],
  changed: false,
};

function makeTest(
  id: string,
  criterionIndexes: number[],
  status: TestCase['status'] = 'pass',
): TestCase {
  return {
    id,
    title: `Test ${id}`,
    description: 'Test description',
    type: 'functional',
    requirementIds: ['REQ-001'],
    acceptanceCriteriaRefs: criterionIndexes.map((criterionIndex) => ({
      requirementId: 'REQ-001',
      criterionIndex,
    })),
    status,
    automated: false,
    origin: 'seeded',
    notes: '',
  };
}

function makeLink(testCaseId: string): TraceabilityLink {
  return {
    requirementId: 'REQ-001',
    testCaseId,
    coverageType: 'partial',
    notes: '',
  };
}

describe('computeRequirementCoverage', () => {
  it('returns none when no acceptance criteria are covered', () => {
    const result = computeRequirementCoverage(requirement, [], []);

    expect(result.status).toBe('none');
    expect(result.coveredCriteriaCount).toBe(0);
    expect(result.uncoveredCriteriaIndexes).toEqual([0, 1, 2]);
  });

  it('returns partial when some acceptance criteria are covered', () => {
    const tests = [makeTest('TC-001', [0, 1])];
    const links = [makeLink('TC-001')];

    const result = computeRequirementCoverage(requirement, tests, links);

    expect(result.status).toBe('partial');
    expect(result.coveredCriteriaCount).toBe(2);
    expect(result.coveredCriteriaIndexes).toEqual([0, 1]);
    expect(result.uncoveredCriteriaIndexes).toEqual([2]);
  });

  it('returns full when every acceptance criterion is covered', () => {
    const tests = [
      makeTest('TC-001', [0]),
      makeTest('TC-002', [1]),
      makeTest('TC-003', [2]),
    ];

    const links = [
      makeLink('TC-001'),
      makeLink('TC-002'),
      makeLink('TC-003'),
    ];

    const result = computeRequirementCoverage(requirement, tests, links);

    expect(result.status).toBe('full');
    expect(result.coveredCriteriaCount).toBe(3);
    expect(result.uncoveredCriteriaIndexes).toEqual([]);
  });

  it('does not reduce coverage because a linked test has not executed', () => {
    const tests = [
      makeTest('TC-001', [0], 'pass'),
      makeTest('TC-002', [1], 'not_run'),
      makeTest('TC-003', [2], 'blocked'),
    ];

    const links = [
      makeLink('TC-001'),
      makeLink('TC-002'),
      makeLink('TC-003'),
    ];

    const result = computeRequirementCoverage(requirement, tests, links);

    expect(result.status).toBe('full');
  });

  it('ignores acceptance criteria references from unrelated requirements', () => {
    const test = makeTest('TC-001', []);

    test.acceptanceCriteriaRefs = [
      {
        requirementId: 'REQ-OTHER',
        criterionIndex: 0,
      },
    ];

    const result = computeRequirementCoverage(
      requirement,
      [test],
      [makeLink('TC-001')],
    );

    expect(result.status).toBe('none');
  });

  it('ignores invalid acceptance criterion indexes', () => {
    const test = makeTest('TC-001', []);

    test.acceptanceCriteriaRefs = [
      {
        requirementId: 'REQ-001',
        criterionIndex: 99,
      },
    ];

    const result = computeRequirementCoverage(
      requirement,
      [test],
      [makeLink('TC-001')],
    );

    expect(result.status).toBe('none');
  });
});