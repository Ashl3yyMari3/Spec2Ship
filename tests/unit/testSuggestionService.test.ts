/**
 * testSuggestionService.test.ts — Unit tests for the deterministic test-suggestion engine.
 */
import { describe, it, expect } from 'vitest';
import type { Requirement, TestCase } from '../../src/backend/types/models.js';
import { generateTestSuggestions } from '../../src/backend/services/testSuggestionService.js';

const mockReq: Requirement = {
  id: 'REQ-TEST-001',
  title: 'Mock Requirement',
  description: 'Test requirement for unit tests.',
  acceptanceCriteria: [
    'The system must process the request.',                    // [0] functional
    'Invalid input must be rejected.',                        // [1] negative
    'Password must contain at least 8 characters.',           // [2] boundary
    'The response must not expose sensitive information.',     // [3] security
    'Leading and trailing spaces should be trimmed.',         // [4] edge
  ],
  domain: 'test',
  criticality: 'medium',
  sourceFile: 'test.md',
  tags: [],
  changed: false,
};

describe('generateTestSuggestions', () => {
  it('returns an array of TestCase objects with origin = "suggested"', () => {
    const results = generateTestSuggestions([mockReq], []);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((tc) => expect(tc.origin).toBe('suggested'));
  });

  it('generates a functional test for the first acceptance criterion', () => {
    const results = generateTestSuggestions([mockReq], []);
    const functional = results.filter((tc) => tc.type === 'functional');
    expect(functional.length).toBeGreaterThanOrEqual(1);
    const refForAC0 = functional.some((tc) =>
      tc.acceptanceCriteriaRefs.some((r) => r.requirementId === 'REQ-TEST-001' && r.criterionIndex === 0),
    );
    expect(refForAC0).toBe(true);
  });

  it('generates a negative test for an AC with negation keywords', () => {
    const results = generateTestSuggestions([mockReq], []);
    const negative = results.filter((tc) => tc.type === 'negative');
    expect(negative.length).toBeGreaterThanOrEqual(1);
  });

  it('generates a boundary test for an AC with boundary keywords', () => {
    const results = generateTestSuggestions([mockReq], []);
    const boundary = results.filter((tc) => tc.type === 'boundary');
    expect(boundary.length).toBeGreaterThanOrEqual(1);
  });

  it('generates a security test for an AC with security keywords', () => {
    const results = generateTestSuggestions([mockReq], []);
    const security = results.filter((tc) => tc.type === 'security');
    expect(security.length).toBeGreaterThanOrEqual(1);
  });

  it('generates an edge test for an AC with edge keywords', () => {
    const results = generateTestSuggestions([mockReq], []);
    const edge = results.filter((tc) => tc.type === 'edge');
    expect(edge.length).toBeGreaterThanOrEqual(1);
  });

  it('populates AcceptanceCriteriaRefs on every suggestion', () => {
    const results = generateTestSuggestions([mockReq], []);
    results.forEach((tc) => {
      expect(tc.acceptanceCriteriaRefs.length).toBeGreaterThan(0);
      tc.acceptanceCriteriaRefs.forEach((ref) => {
        expect(ref.requirementId).toBe('REQ-TEST-001');
        expect(typeof ref.criterionIndex).toBe('number');
      });
    });
  });

  it('references the originating requirement ID', () => {
    const results = generateTestSuggestions([mockReq], []);
    results.forEach((tc) => expect(tc.requirementIds).toContain('REQ-TEST-001'));
  });

  it('is deterministic — same input produces identical output on two calls', () => {
    const first = generateTestSuggestions([mockReq], []);
    const second = generateTestSuggestions([mockReq], []);
    expect(first.map((tc) => tc.id)).toEqual(second.map((tc) => tc.id));
  });

  it('suppresses suggestions when seeded test already covers (reqId, type, criterionIndex)', () => {
    const seeded: TestCase = {
      id: 'TC-TEST-001-01',
      title: 'Seeded negative for AC1',
      description: 'desc',
      type: 'negative',
      requirementIds: ['REQ-TEST-001'],
      acceptanceCriteriaRefs: [{ requirementId: 'REQ-TEST-001', criterionIndex: 1 }],
      status: 'pass',
      automated: true,
      origin: 'seeded',
      notes: '',
    };
    const results = generateTestSuggestions([mockReq], [seeded]);
    // The negative suggestion for AC[1] should be suppressed
    const negAC1 = results.filter(
      (tc) => tc.type === 'negative' &&
        tc.acceptanceCriteriaRefs.some((r) => r.criterionIndex === 1),
    );
    expect(negAC1).toHaveLength(0);
  });

  it('does not produce duplicate IDs', () => {
    const results = generateTestSuggestions([mockReq], []);
    const ids = results.map((tc) => tc.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('suggested tests have valid test types', () => {
    const validTypes = new Set(['functional', 'negative', 'boundary', 'security', 'edge']);
    const results = generateTestSuggestions([mockReq], []);
    results.forEach((tc) => expect(validTypes.has(tc.type)).toBe(true));
  });

  it('returns empty array for requirement with no acceptance criteria', () => {
    const emptyReq: Requirement = { ...mockReq, id: 'REQ-TEST-002', acceptanceCriteria: [] };
    const results = generateTestSuggestions([emptyReq], []);
    expect(results).toHaveLength(0);
  });
});
