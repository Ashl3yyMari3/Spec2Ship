/**
 * coverageService.test.ts — Unit tests for coverage-gap detection.
 */
import { describe, it, expect } from 'vitest';
import type { Requirement, TestCase, TraceabilityLink } from '../../src/backend/types/models.js';
import { computeCoverageGaps } from '../../src/backend/services/coverageService.js';

const baseReq = (id: string): Requirement => ({
  id,
  title: `Req ${id}`,
  description: 'desc',
  acceptanceCriteria: ['AC1'],
  domain: 'test',
  criticality: 'medium',
  sourceFile: 'test.md',
  tags: [],
  changed: false,
});

const makeTC = (id: string, type: TestCase['type'], status: TestCase['status']): TestCase => ({
  id,
  title: `Test ${id}`,
  description: 'desc',
  type,
  requirementIds: [],
  acceptanceCriteriaRefs: [],
  status,
  automated: true,
  origin: 'seeded',
  notes: '',
});

const link = (reqId: string, tcId: string): TraceabilityLink => ({
  requirementId: reqId,
  testCaseId: tcId,
  coverageType: 'full',
  notes: '',
});

describe('computeCoverageGaps', () => {
  it('reports no_coverage for a requirement with no links', () => {
    const reqs = [baseReq('REQ-A-001')];
    const report = computeCoverageGaps(reqs, [], []);
    expect(report.gaps).toHaveLength(1);
    expect(report.gaps[0].gapType).toBe('no_coverage');
    expect(report.gaps[0].requirementId).toBe('REQ-A-001');
  });

  it('reports no_executed_coverage when all linked tests are not_run', () => {
    const reqs = [baseReq('REQ-A-001')];
    const tc = makeTC('TC-A-001', 'functional', 'not_run');
    const report = computeCoverageGaps(reqs, [tc], [link('REQ-A-001', 'TC-A-001')]);
    expect(report.gaps).toHaveLength(1);
    expect(report.gaps[0].gapType).toBe('no_executed_coverage');
  });

  it('reports no_executed_coverage when all linked tests are blocked', () => {
    const reqs = [baseReq('REQ-A-001')];
    const tc = makeTC('TC-A-001', 'functional', 'blocked');
    const report = computeCoverageGaps(reqs, [tc], [link('REQ-A-001', 'TC-A-001')]);
    expect(report.gaps[0].gapType).toBe('no_executed_coverage');
  });

  it('reports missing_test_types when no negative or boundary tests exist', () => {
    const reqs = [baseReq('REQ-A-001')];
    const tc = makeTC('TC-A-001', 'functional', 'pass');
    const report = computeCoverageGaps(reqs, [tc], [link('REQ-A-001', 'TC-A-001')]);
    const gap = report.gaps.find((g) => g.gapType === 'missing_test_types');
    expect(gap).toBeDefined();
    expect(gap?.missingTypes).toContain('negative');
    expect(gap?.missingTypes).toContain('boundary');
  });

  it('reports no gap when requirement has both negative and boundary tests', () => {
    const reqs = [baseReq('REQ-A-001')];
    const tc1 = makeTC('TC-A-001', 'negative', 'pass');
    const tc2 = makeTC('TC-A-002', 'boundary', 'pass');
    const links = [link('REQ-A-001', 'TC-A-001'), link('REQ-A-001', 'TC-A-002')];
    const report = computeCoverageGaps(reqs, [tc1, tc2], links);
    expect(report.gaps).toHaveLength(0);
  });

  it('counts covered and gap totals correctly', () => {
    const reqs = [baseReq('REQ-A-001'), baseReq('REQ-A-002')];
    const tc = makeTC('TC-A-001', 'negative', 'pass');
    const tc2 = makeTC('TC-A-002', 'boundary', 'pass');
    const ls = [link('REQ-A-001', 'TC-A-001'), link('REQ-A-001', 'TC-A-002')];
    // REQ-A-002 has no link → no_coverage gap
    const report = computeCoverageGaps(reqs, [tc, tc2], ls);
    expect(report.totalRequirements).toBe(2);
    expect(report.coveredCount).toBe(1);
  });

  it('returns empty gaps for fully covered requirements', () => {
    const reqs = [baseReq('REQ-A-001')];
    const tc1 = makeTC('TC-A-001', 'functional', 'pass');
    const tc2 = makeTC('TC-A-002', 'negative', 'pass');
    const tc3 = makeTC('TC-A-003', 'boundary', 'pass');
    const ls = [link('REQ-A-001', 'TC-A-001'), link('REQ-A-001', 'TC-A-002'), link('REQ-A-001', 'TC-A-003')];
    const report = computeCoverageGaps(reqs, [tc1, tc2, tc3], ls);
    expect(report.gaps).toHaveLength(0);
    expect(report.coveredCount).toBe(1);
  });
});
