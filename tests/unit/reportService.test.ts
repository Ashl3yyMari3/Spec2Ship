/**
 * reportService.test.ts — Unit tests for the release-readiness report service.
 * Tests all three verdict paths: Not Ready, Review Required, Ready.
 */
import { describe, it, expect } from 'vitest';
import type { Requirement, TestCase, TraceabilityLink } from '../../src/backend/types/models.js';
import { buildReleaseReadinessReport } from '../../src/backend/services/reportService.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const req = (id: string, criticality: Requirement['criticality'], changed = false): Requirement => ({
  id,
  title: `Req ${id}`,
  description: '',
  acceptanceCriteria: ['AC1'],
  domain: 'test',
  criticality,
  sourceFile: 'test.md',
  tags: [],
  changed,
});

const tc = (id: string, type: TestCase['type'], status: TestCase['status'], reqId: string): TestCase => ({
  id,
  title: `Test ${id}`,
  description: '',
  type,
  requirementIds: [reqId],
  acceptanceCriteriaRefs: [{ requirementId: reqId, criterionIndex: 0 }],
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

// ---------------------------------------------------------------------------
// NOT READY conditions
// ---------------------------------------------------------------------------

describe('reportService — NOT READY', () => {
  it('NOT READY when critical requirement has zero coverage', () => {
    const reqs = [req('REQ-C-001', 'critical')];
    const report = buildReleaseReadinessReport(reqs, [], []);
    expect(report.overallVerdict).toBe('Not Ready');
    expect(report.blockingReasons.length).toBeGreaterThan(0);
    expect(report.blockingReasons.some((r) => r.includes('REQ-C-001'))).toBe(true);
  });

  it('NOT READY when coverage < 70%', () => {
    // 0 of 3 requirements have passing tests → 0% coverage < 70%
    const reqs = [req('REQ-A-001', 'low'), req('REQ-A-002', 'low'), req('REQ-A-003', 'low')];
    const report = buildReleaseReadinessReport(reqs, [], []);
    expect(report.overallVerdict).toBe('Not Ready');
    expect(report.blockingReasons.some((r) => r.includes('70%'))).toBe(true);
  });

  it('NOT READY when security test linked to critical req fails', () => {
    const reqs = [req('REQ-C-001', 'critical')];
    const secTC = tc('TC-C-001', 'security', 'fail', 'REQ-C-001');
    const links = [link('REQ-C-001', 'TC-C-001')];
    const report = buildReleaseReadinessReport(reqs, [secTC], links);
    expect(report.overallVerdict).toBe('Not Ready');
    expect(report.blockingReasons.some((r) => r.includes('security'))).toBe(true);
  });

  it('sets blockingReasons and does not populate readyConfirmations', () => {
    const report = buildReleaseReadinessReport([req('REQ-C-001', 'critical')], [], []);
    expect(report.blockingReasons.length).toBeGreaterThan(0);
    expect(report.readyConfirmations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// REVIEW REQUIRED conditions
// ---------------------------------------------------------------------------

describe('reportService — REVIEW REQUIRED', () => {
  it('REVIEW REQUIRED when coverage is 70-89%', () => {
    // 7 of 10 reqs covered = 70%
    const reqs = Array.from({ length: 10 }, (_, i) => req(`REQ-A-${String(i + 1).padStart(3, '0')}`, 'low'));
    const tests = reqs.slice(0, 7).map((r, i) => {
      const negTC = tc(`TC-NEG-${i}`, 'negative', 'pass', r.id);
      const bndTC = tc(`TC-BND-${i}`, 'boundary', 'pass', r.id);
      return [negTC, bndTC];
    }).flat();
    const links = tests.map((t) => link(t.requirementIds[0], t.id));
    const report = buildReleaseReadinessReport(reqs, tests, links);
    expect(report.overallVerdict).toBe('Review Required');
    expect(report.reviewReasons.length).toBeGreaterThan(0);
  });

  it('REVIEW REQUIRED when a test is not_run', () => {
    // All reqs covered with pass, but one extra test is not_run
    const reqs = [req('REQ-A-001', 'low')];
    const tc1 = tc('TC-001', 'negative', 'pass', 'REQ-A-001');
    const tc2 = tc('TC-002', 'boundary', 'pass', 'REQ-A-001');
    const tc3 = tc('TC-003', 'functional', 'not_run', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001'), link('REQ-A-001', 'TC-002'), link('REQ-A-001', 'TC-003')];
    const report = buildReleaseReadinessReport(reqs, [tc1, tc2, tc3], ls);
    expect(report.overallVerdict).toBe('Review Required');
    expect(report.reviewReasons.some((r) => r.includes('not_run') || r.includes('incomplete'))).toBe(true);
  });

  it('REVIEW REQUIRED when a requirement is changed', () => {
    const reqs = [req('REQ-A-001', 'low', true)];
    const tc1 = tc('TC-001', 'negative', 'pass', 'REQ-A-001');
    const tc2 = tc('TC-002', 'boundary', 'pass', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001'), link('REQ-A-001', 'TC-002')];
    const report = buildReleaseReadinessReport(reqs, [tc1, tc2], ls);
    expect(report.overallVerdict).toBe('Review Required');
    expect(report.reviewReasons.some((r) => r.includes('changed'))).toBe(true);
  });

  it('populates reviewReasons and not readyConfirmations when Review Required', () => {
    const reqs = [req('REQ-A-001', 'low', true)];
    const tc1 = tc('TC-001', 'negative', 'pass', 'REQ-A-001');
    const tc2 = tc('TC-002', 'boundary', 'pass', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001'), link('REQ-A-001', 'TC-002')];
    const report = buildReleaseReadinessReport(reqs, [tc1, tc2], ls);
    expect(report.reviewReasons.length).toBeGreaterThan(0);
    expect(report.readyConfirmations).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// READY conditions
// ---------------------------------------------------------------------------

describe('reportService — READY', () => {
  it('READY when all requirements have passing tests and coverage >= 90%', () => {
    // 1 req, fully covered with passing negative + boundary = 100% coverage, no changes
    const reqs = [req('REQ-A-001', 'low')];
    const tc1 = tc('TC-001', 'negative', 'pass', 'REQ-A-001');
    const tc2 = tc('TC-002', 'boundary', 'pass', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001'), link('REQ-A-001', 'TC-002')];
    const report = buildReleaseReadinessReport(reqs, [tc1, tc2], ls);
    expect(report.overallVerdict).toBe('Ready');
    expect(report.readyConfirmations.length).toBeGreaterThan(0);
    expect(report.blockingReasons).toHaveLength(0);
    expect(report.reviewReasons).toHaveLength(0);
  });

  it('populates readyConfirmations for READY verdict', () => {
    const reqs = [req('REQ-A-001', 'low')];
    const tc1 = tc('TC-001', 'negative', 'pass', 'REQ-A-001');
    const tc2 = tc('TC-002', 'boundary', 'pass', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001'), link('REQ-A-001', 'TC-002')];
    const report = buildReleaseReadinessReport(reqs, [tc1, tc2], ls);
    expect(report.readyConfirmations.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Report structure
// ---------------------------------------------------------------------------

describe('reportService — report structure', () => {
  it('includes generatedAt ISO timestamp', () => {
    const report = buildReleaseReadinessReport([], [], []);
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('includes summary counts', () => {
    const reqs = [req('REQ-A-001', 'low')];
    const tc1 = tc('TC-001', 'functional', 'pass', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001')];
    const report = buildReleaseReadinessReport(reqs, [tc1], ls);
    expect(report.summary.totalRequirements).toBe(1);
    expect(report.summary.passingTests).toBe(1);
  });

  it('includes coveragePercentage as a number 0-100', () => {
    const reqs = [req('REQ-A-001', 'low')];
    const tc1 = tc('TC-001', 'functional', 'pass', 'REQ-A-001');
    const ls = [link('REQ-A-001', 'TC-001')];
    const report = buildReleaseReadinessReport(reqs, [tc1], ls);
    expect(report.coveragePercentage).toBeGreaterThanOrEqual(0);
    expect(report.coveragePercentage).toBeLessThanOrEqual(100);
  });

  it('includes requirementStatuses for each requirement', () => {
    const reqs = [req('REQ-A-001', 'medium'), req('REQ-A-002', 'low')];
    const report = buildReleaseReadinessReport(reqs, [], []);
    expect(report.requirementStatuses).toHaveLength(2);
  });
});
