/**
 * api.test.ts — Integration tests for all 8 API endpoints using supertest.
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/backend/server.js';

const app = createApp();

describe('GET /api/requirements', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/requirements');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns requirements with expected shape', async () => {
    const res = await request(app).get('/api/requirements');
    expect(res.body.length).toBeGreaterThan(0);
    const r = res.body[0];
    expect(r).toHaveProperty('id');
    expect(r).toHaveProperty('title');
    expect(r).toHaveProperty('acceptanceCriteria');
    expect(r).toHaveProperty('criticality');
    expect(r).toHaveProperty('domain');
  });

  it('returns REQ-AUTH-003 with criticality=critical', async () => {
    const res = await request(app).get('/api/requirements');
    const r003 = res.body.find((r: { id: string }) => r.id === 'REQ-AUTH-003');
    expect(r003).toBeDefined();
    expect(r003.criticality).toBe('critical');
  });
});

describe('GET /api/tests', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/tests');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('includes seeded tests (origin=seeded)', async () => {
    const res = await request(app).get('/api/tests');
    const seeded = res.body.filter((tc: { origin: string }) => tc.origin === 'seeded');
    expect(seeded.length).toBeGreaterThan(0);
  });

  it('includes suggested tests (origin=suggested)', async () => {
    const res = await request(app).get('/api/tests');
    const suggested = res.body.filter((tc: { origin: string }) => tc.origin === 'suggested');
    expect(suggested.length).toBeGreaterThan(0);
  });

  it('tests have expected shape', async () => {
    const res = await request(app).get('/api/tests');
    const t = res.body[0];
    expect(t).toHaveProperty('id');
    expect(t).toHaveProperty('type');
    expect(t).toHaveProperty('status');
    expect(t).toHaveProperty('requirementIds');
    expect(t).toHaveProperty('acceptanceCriteriaRefs');
  });
});

describe('GET /api/test-suggestions', () => {
  it('returns 200 with an array', async () => {
    const res = await request(app).get('/api/test-suggestions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('all suggestions have origin=suggested', async () => {
    const res = await request(app).get('/api/test-suggestions');
    res.body.forEach((tc: { origin: string }) => expect(tc.origin).toBe('suggested'));
  });

  it('suggestions include AcceptanceCriteriaRefs', async () => {
    const res = await request(app).get('/api/test-suggestions');
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((tc: { acceptanceCriteriaRefs: unknown[] }) => {
      expect(tc.acceptanceCriteriaRefs.length).toBeGreaterThan(0);
    });
  });
});

describe('GET /api/traceability', () => {
  it('returns 200 with requirements, testCases, links, generatedAt', async () => {
    const res = await request(app).get('/api/traceability');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('requirements');
    expect(res.body).toHaveProperty('testCases');
    expect(res.body).toHaveProperty('links');
    expect(res.body).toHaveProperty('generatedAt');
  });

  it('traceability links reference known requirements and tests', async () => {
    const res = await request(app).get('/api/traceability');
    const reqIds = new Set(res.body.requirements.map((r: { id: string }) => r.id));
    const tcIds = new Set(res.body.testCases.map((t: { id: string }) => t.id));
    for (const lnk of res.body.links) {
      expect(reqIds.has(lnk.requirementId)).toBe(true);
      expect(tcIds.has(lnk.testCaseId)).toBe(true);
    }
  });
});

describe('GET /api/coverage-gaps', () => {
  it('returns 200 with expected shape', async () => {
    const res = await request(app).get('/api/coverage-gaps');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalRequirements');
    expect(res.body).toHaveProperty('coveredCount');
    expect(res.body).toHaveProperty('gapCount');
    expect(res.body).toHaveProperty('gaps');
    expect(Array.isArray(res.body.gaps)).toBe(true);
  });
});

describe('GET /api/impact/:requirementId', () => {
  it('returns 200 with ImpactReport for a valid requirement ID', async () => {
    const res = await request(app).get('/api/impact/REQ-AUTH-001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('changedRequirementId', 'REQ-AUTH-001');
    expect(res.body).toHaveProperty('directlyImpactedTests');
    expect(res.body).toHaveProperty('transitivelyImpactedReqs');
    expect(res.body).toHaveProperty('recommendation');
    expect(Array.isArray(res.body.directlyImpactedTests)).toBe(true);
  });

  it('directlyImpactedTests includes tests linked to REQ-AUTH-001', async () => {
    const res = await request(app).get('/api/impact/REQ-AUTH-001');
    expect(res.body.directlyImpactedTests.length).toBeGreaterThan(0);
  });

  it('returns 404 for an unknown requirement ID', async () => {
    const res = await request(app).get('/api/impact/REQ-UNKNOWN-999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for an invalid requirement ID pattern', async () => {
    const res = await request(app).get('/api/impact/not-valid-id');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /api/risk', () => {
  it('returns 200 with an array of risk scores', async () => {
    const res = await request(app).get('/api/risk');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('each risk score has required shape including factor breakdowns', async () => {
    const res = await request(app).get('/api/risk');
    const rs = res.body[0];
    expect(rs).toHaveProperty('requirementId');
    expect(rs).toHaveProperty('score');
    expect(rs).toHaveProperty('tier');
    expect(rs).toHaveProperty('factors');
    expect(rs).toHaveProperty('weightedContributions');
    expect(rs.factors).toHaveProperty('criticalityRaw');
    expect(rs.factors).toHaveProperty('coverageGapRaw');
    expect(rs.factors).toHaveProperty('executionCompletenessRaw');
    expect(rs.factors).toHaveProperty('changeImpactRaw');
  });
});

describe('GET /api/release-readiness', () => {
  it('returns 200 with a ReleaseReadinessReport', async () => {
    const res = await request(app).get('/api/release-readiness');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('overallVerdict');
    expect(res.body).toHaveProperty('verdictRationale');
    expect(res.body).toHaveProperty('summary');
    expect(res.body).toHaveProperty('coveragePercentage');
    expect(res.body).toHaveProperty('blockingReasons');
    expect(res.body).toHaveProperty('reviewReasons');
    expect(res.body).toHaveProperty('readyConfirmations');
    expect(res.body).toHaveProperty('requirementStatuses');
    expect(res.body).toHaveProperty('generatedAt');
  });

  it('overallVerdict is one of the valid values', async () => {
    const res = await request(app).get('/api/release-readiness');
    expect(['Ready', 'Review Required', 'Not Ready']).toContain(res.body.overallVerdict);
  });

  it('correct verdict for ShopSphere auth dataset (Review Required expected)', async () => {
    // TC-AUTH-003-02 is not_run, so the dataset should be Review Required
    const res = await request(app).get('/api/release-readiness');
    expect(res.body.overallVerdict).toBe('Review Required');
  });
});
