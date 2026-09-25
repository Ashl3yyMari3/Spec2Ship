/**
 * testSuggestionService.ts — Deterministic test-suggestion engine.
 * origin = "suggested", no external APIs, duplicate suppression against seeded tests.
 */
import type { Requirement, TestCase, AcceptanceCriteriaRef } from '../types/models.js';

const NEG_KW = ['must not','rejected','invalid','fail','error','missing','required','cannot','unique','duplicate','never'];
const BOUND_KW = ['at least','maximum','minimum','exactly','threshold','consecutive','limit','minutes','characters','length'];
const SEC_KW = ['password','sensitive','expose','disclose','reveal','enumerat','lockout','locked','unauthori','case-sensitive','generic message'];
const EDGE_KW = ['trim','leading','trailing','whitespace','space','case-insensitive','uppercase','lowercase','normalise','normalize'];

function matches(text: string, kws: string[]): boolean {
  const lo = text.toLowerCase();
  return kws.some((k) => lo.includes(k));
}

function alreadyCovered(seeded: TestCase[], reqId: string, type: string, ci: number): boolean {
  return seeded.some(
    (tc) => tc.type === type && tc.requirementIds.includes(reqId) &&
      tc.acceptanceCriteriaRefs.some((r) => r.requirementId === reqId && r.criterionIndex === ci),
  );
}

function makeId(req: Requirement, type: string, ci: number): string {
  const suffix = req.id.replace(/^REQ-/, '');
  return `TC-SUGG-${suffix}-${type.slice(0, 4).toUpperCase()}-${String(ci).padStart(2, '0')}`;
}

function makeSuggestion(req: Requirement, type: string, ac: string, ci: number): TestCase {
  const id = makeId(req, type, ci);
  const ref: AcceptanceCriteriaRef = { requirementId: req.id, criterionIndex: ci };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return {
    id,
    title: `${label} — ${req.title}: ${ac.slice(0, 60)}${ac.length > 60 ? '\u2026' : ''}`,
    description: `${label} test for ${req.id} AC[${ci}]: "${ac}".`,
    type: type as TestCase['type'],
    requirementIds: [req.id],
    acceptanceCriteriaRefs: [ref],
    status: 'not_run',
    automated: false,
    origin: 'suggested',
    notes: `Auto-suggested ${type} coverage for ${req.id} AC[${ci}].`,
  };
}

export function generateTestSuggestions(requirements: Requirement[], seededTests: TestCase[]): TestCase[] {
  const suggestions: TestCase[] = [];
  const seen = new Set<string>();

  function add(tc: TestCase) {
    if (!seen.has(tc.id)) { seen.add(tc.id); suggestions.push(tc); }
  }

  for (const req of requirements) {
    const acs = req.acceptanceCriteria;
    if (!acs.length) continue;

    // Functional: cover first AC if not already seeded
    if (!alreadyCovered(seededTests, req.id, 'functional', 0)) {
      add(makeSuggestion(req, 'functional', acs[0], 0));
    }

    acs.forEach((ac, ci) => {
      const tryType = (t: string, kws: string[]) => {
        if (matches(ac, kws) && !alreadyCovered(seededTests, req.id, t, ci)) {
          add(makeSuggestion(req, t, ac, ci));
        }
      };
      tryType('negative', NEG_KW);
      tryType('boundary', BOUND_KW);
      tryType('security', SEC_KW);
      tryType('edge', EDGE_KW);
    });
  }

  return suggestions;
}
