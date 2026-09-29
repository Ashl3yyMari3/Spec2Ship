/**
 * api.test.ts — Integration tests for Spec2Ship API endpoints using supertest.
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


describe('POST /api/ai/chat', () => {
  it('returns 400 when message is empty', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: '', history: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when message exceeds the input limit', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({ message: 'x'.repeat(2001), history: [] });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for invalid conversation history', async () => {
    const res = await request(app)
      .post('/api/ai/chat')
      .send({
        message: 'Why is this release under review?',
        history: [{ role: 'system', content: 'invalid role' }],
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});


describe('Project workspaces', () => {
  it('lists the built-in ShopSphere demo project', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const demo = res.body.find(
      (project: { id: string }) =>
        project.id === 'shopsphere-demo',
    );

    expect(demo).toBeDefined();
    expect(demo.isDemo).toBe(true);
    expect(demo.requirementCount).toBeGreaterThan(0);
  });

  it('scopes requirements to the selected demo project', async () => {
    const res = await request(app)
      .get('/api/requirements')
      .query({ projectId: 'shopsphere-demo' });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
  });

  it('returns 404 when a selected project does not exist', async () => {
    const res = await request(app)
      .get('/api/risk')
      .query({ projectId: 'missing-project' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Project not found.');
  });
});


describe('AI project test workflow guardrails', () => {
  it('does not allow batch test writes to the built-in demo', async () => {
    const res = await request(app)
      .post('/api/projects/shopsphere-demo/tests/batch')
      .send({
        tests: [
          {
            id: 'TC-DEMO-BLOCKED-01',
            title: 'Should not be saved',
            description: 'The demo project must remain read-only.',
            type: 'functional',
            requirementId: 'REQ-AUTH-001',
            status: 'not_run',
            automated: false,
            coverageType: 'partial',
          },
        ],
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty(
      'error',
      'The built-in demo project is read-only.',
    );
  });

  it('rejects AI test generation for an unknown project before calling AI', async () => {
    const res = await request(app)
      .post(
        '/api/projects/missing-project/requirements/REQ-TEST-001/ai-tests',
      );

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Project not found.');
  });

  it('reports the exact duplicate test case ID in a batch', async () => {
    const projectRes = await request(app)
      .post('/api/projects')
      .send({
        name: 'Duplicate ID Guardrail Test',
        description: 'Temporary integration-test workspace.',
        template: 'blank',
      });

    expect(projectRes.status).toBe(201);

    const projectId = projectRes.body.id as string;

    const requirementRes = await request(app)
      .post(`/api/projects/${projectId}/requirements`)
      .send({
        id: 'REQ-DUP-001',
        title: 'Duplicate ID Guardrail',
        description: 'Provide a requirement for duplicate-ID validation.',
        acceptanceCriteria: ['Duplicate test IDs must be rejected clearly.'],
        domain: 'testing',
        criticality: 'medium',
        changed: false,
      });

    expect(requirementRes.status).toBe(201);

    const duplicateRes = await request(app)
      .post(`/api/projects/${projectId}/tests/batch`)
      .send({
        tests: [
          {
            id: 'TC-DUP-001',
            title: 'Duplicate one',
            description: 'First duplicate test.',
            type: 'functional',
            requirementId: 'REQ-DUP-001',
            status: 'not_run',
            automated: false,
            coverageType: 'partial',
          },
          {
            id: 'tc-dup-001',
            title: 'Duplicate two',
            description: 'Same ID with different casing.',
            type: 'negative',
            requirementId: 'REQ-DUP-001',
            status: 'not_run',
            automated: false,
            coverageType: 'partial',
          },
        ],
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.duplicateIds).toEqual([
      'TC-DUP-001',
    ]);
    expect(duplicateRes.body.error).toContain('TC-DUP-001');
  });
});
