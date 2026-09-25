/**
 * riskService.test.ts — Unit tests for the four-factor risk-scoring model.
 */
import { describe, it, expect } from 'vitest';
import type { Requirement, TestCase, TraceabilityLink } from '../../src/backend/types/models.js';
import { computeRiskScore } from '../../src/backend/services/riskService.js';

const baseReq = (criticality: Requirement['criticality'], changed = false): Requirement => ({
  id: 'REQ-T-001',
  title: 'Test req',
  description: '',
  acceptanceCriteria: [],
  domain: 'test',
  criticality,
  sourceFile: 'test.md',
  tags: [],
  changed,
});

const makeTC = (id: string, status: TestCase['status']): TestCase => ({
  id,
  title: '',
  description: '',
  type: 'functional',
  requirementIds: ['REQ-T-001'],
  acceptanceCriteriaRefs: [],
  status,
  automated: true,
  origin: 'seeded',
  notes: '',
});

const link = (tcId: string): TraceabilityLink => ({
  requirementId: 'REQ-T-001',
  testCaseId: tcId,
  coverageType: 'full',
  notes: '',
});

describe('computeRiskScore — raw factor values', () => {
  it('criticality=low maps to raw=10', () => {
    const rs = computeRiskScore(baseReq('low'), [], []);
    expect(rs.factors.criticalityRaw).toBe(10);
  });

  it('criticality=medium maps to raw=40', () => {
    const rs = computeRiskScore(baseReq('medium'), [], []);
    expect(rs.factors.criticalityRaw).toBe(40);
  });

  it('criticality=high maps to raw=70', () => {
    const rs = computeRiskScore(baseReq('high'), [], []);
    expect(rs.factors.criticalityRaw).toBe(70);
  });

  it('criticality=critical maps to raw=100', () => {
    const rs = computeRiskScore(baseReq('critical'), [], []);
    expect(rs.factors.criticalityRaw).toBe(100);
  });

  it('no coverage maps coverageGapRaw=100', () => {
    const rs = computeRiskScore(baseReq('medium'), [], []);
    expect(rs.factors.coverageGapRaw).toBe(100);
  });

  it('fully covered (all pass) maps coverageGapRaw=0', () => {
    const tc = makeTC('TC-001', 'pass');
    const rs = computeRiskScore(baseReq('medium'), [tc], [link('TC-001')]);
    expect(rs.factors.coverageGapRaw).toBe(0);
  });

  it('all linked tests not_run maps coverageGapRaw=50', () => {
    const tc = makeTC('TC-001', 'not_run');
    const rs = computeRiskScore(baseReq('medium'), [tc], [link('TC-001')]);
    expect(rs.factors.coverageGapRaw).toBe(50);
  });

  it('all pass maps executionCompletenessRaw=0', () => {
    const tc = makeTC('TC-001', 'pass');
    const rs = computeRiskScore(baseReq('medium'), [tc], [link('TC-001')]);
    expect(rs.factors.executionCompletenessRaw).toBe(0);
  });

  it('any fail maps executionCompletenessRaw=100', () => {
    const tc = makeTC('TC-001', 'fail');
    const rs = computeRiskScore(baseReq('medium'), [tc], [link('TC-001')]);
    expect(rs.factors.executionCompletenessRaw).toBe(100);
  });

  it('some not_run maps executionCompletenessRaw=50', () => {
    const tc1 = makeTC('TC-001', 'pass');
    const tc2 = makeTC('TC-002', 'not_run');
    const rs = computeRiskScore(baseReq('medium'), [tc1, tc2], [link('TC-001'), link('TC-002')]);
    expect(rs.factors.executionCompletenessRaw).toBe(50);
  });

  it('unchanged maps changeImpactRaw=0', () => {
    const rs = computeRiskScore(baseReq('medium', false), [], []);
    expect(rs.factors.changeImpactRaw).toBe(0);
  });

  it('changed maps changeImpactRaw=100', () => {
    const rs = computeRiskScore(baseReq('medium', true), [], []);
    expect(rs.factors.changeImpactRaw).toBe(100);
  });
});

describe('computeRiskScore — weighted score formula', () => {
  it('fully covered passing, low criticality, unchanged → low score', () => {
    // low: 10*0.35 + covered:0*0.30 + allPass:0*0.20 + unchanged:0*0.15 = 3.5
    const tc = makeTC('TC-001', 'pass');
    const rs = computeRiskScore(baseReq('low'), [tc], [link('TC-001')]);
    expect(rs.score).toBeCloseTo(3.5, 1);
    expect(rs.tier).toBe('Low');
  });

  it('critical, no coverage, no tests, changed → maximum risk', () => {
    // critical:100*0.35 + nocov:100*0.30 + noexec:100*0.20 + changed:100*0.15 = 100
    const rs = computeRiskScore(baseReq('critical', true), [], []);
    expect(rs.score).toBe(100);
    expect(rs.tier).toBe('Critical');
  });

  it('medium criticality, no coverage, unchanged', () => {
    // 40*0.35 + 100*0.30 + 100*0.20 + 0*0.15 = 14 + 30 + 20 = 64
    const rs = computeRiskScore(baseReq('medium', false), [], []);
    expect(rs.score).toBeCloseTo(64, 1);
    expect(rs.tier).toBe('High');
  });
});

describe('computeRiskScore — tier thresholds', () => {
  it('score 0 → Low', () => {
    const tc = makeTC('TC-001', 'pass');
    // Need score < 25: use low criticality (10), full coverage (0), all pass (0), unchanged (0) = 3.5
    const rs = computeRiskScore(baseReq('low'), [tc], [link('TC-001')]);
    expect(rs.tier).toBe('Low');
    expect(rs.score).toBeLessThan(25);
  });

  it('score 25-49 → Medium', () => {
    // medium:40 * 0.35 = 14; fully covered passing: 0 + 0 + 0 = 14 → Low
    // Need to push into Medium: add some not_run
    // medium:40*0.35=14 + covered:0*0.30=0 + notRun:50*0.20=10 + unchanged:0*0.15=0 = 24 → still Low
    // Use high:70*0.35=24.5 + covered + allPass + unchanged = 24.5 → Low boundary
    // high:70*0.35=24.5 + partial:50*0.30=15 → 39.5 → Medium
    const tc = makeTC('TC-001', 'not_run');
    const rs = computeRiskScore(baseReq('high'), [tc], [link('TC-001')]);
    expect(rs.score).toBeGreaterThanOrEqual(25);
    expect(rs.score).toBeLessThan(50);
    expect(rs.tier).toBe('Medium');
  });

  it('score 50-74 → High', () => {
    // medium:40*0.35=14 + nocov:100*0.30=30 + noexec:100*0.20=20 + unchanged:0 = 64 → High
    const rs = computeRiskScore(baseReq('medium'), [], []);
    expect(rs.score).toBeGreaterThanOrEqual(50);
    expect(rs.score).toBeLessThan(75);
    expect(rs.tier).toBe('High');
  });

  it('score >= 75 → Critical', () => {
    const rs = computeRiskScore(baseReq('critical', true), [], []);
    expect(rs.score).toBeGreaterThanOrEqual(75);
    expect(rs.tier).toBe('Critical');
  });
});

describe('computeRiskScore — weighted contributions present', () => {
  it('includes all four weighted contributions', () => {
    const tc = makeTC('TC-001', 'pass');
    const rs = computeRiskScore(baseReq('high'), [tc], [link('TC-001')]);
    expect(rs.weightedContributions).toHaveProperty('criticality');
    expect(rs.weightedContributions).toHaveProperty('coverageGap');
    expect(rs.weightedContributions).toHaveProperty('executionCompleteness');
    expect(rs.weightedContributions).toHaveProperty('changeImpact');
  });

  it('weighted criticality contribution = criticalityRaw * 0.35', () => {
    const tc = makeTC('TC-001', 'pass');
    const rs = computeRiskScore(baseReq('high'), [tc], [link('TC-001')]);
    expect(rs.weightedContributions.criticality).toBeCloseTo(70 * 0.35, 1);
  });
});
