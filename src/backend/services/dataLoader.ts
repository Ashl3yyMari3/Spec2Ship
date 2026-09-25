/**
 * dataLoader.ts
 *
 * Reusable file-loading functions for requirements, seeded tests, and traceability links.
 * Validates loaded data sufficiently to prevent broken references or malformed structures
 * from silently entering analysis.
 */

import fs from 'fs';
import path from 'path';
import { parseRequirementsDirectory } from './requirementParser.js';
import type { Requirement, TestCase, TraceabilityLink, TestType, TestStatus, TestOrigin } from '../types/models.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_TEST_TYPES: Set<string> = new Set(['functional', 'negative', 'boundary', 'security', 'edge']);
const VALID_TEST_STATUSES: Set<string> = new Set(['pass', 'fail', 'not_run', 'blocked']);
const VALID_TEST_ORIGINS: Set<string> = new Set(['seeded', 'suggested']);
const VALID_COVERAGE_TYPES: Set<string> = new Set(['full', 'partial']);
const REQ_ID_PATTERN = /^[A-Z][A-Z0-9]*(-[A-Z0-9]+)+$/;

// ---------------------------------------------------------------------------
// Requirements
// ---------------------------------------------------------------------------

/**
 * Load and parse all requirements from data/requirements/.
 */
export function loadRequirements(requirementsDir: string): Requirement[] {
  return parseRequirementsDirectory(requirementsDir);
}

// ---------------------------------------------------------------------------
// Test Cases
// ---------------------------------------------------------------------------

function validateTestCase(raw: unknown, index: number): TestCase {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`Test case at index ${index} is not an object`);
  }

  const t = raw as Record<string, unknown>;

  if (typeof t['id'] !== 'string' || !t['id']) {
    throw new Error(`Test case at index ${index} is missing a valid 'id'`);
  }
  if (typeof t['title'] !== 'string') {
    throw new Error(`Test case "${t['id']}" is missing 'title'`);
  }
  if (typeof t['description'] !== 'string') {
    throw new Error(`Test case "${t['id']}" is missing 'description'`);
  }
  if (!VALID_TEST_TYPES.has(t['type'] as string)) {
    throw new Error(`Test case "${t['id']}" has invalid type: "${t['type']}"`);
  }
  if (!Array.isArray(t['requirementIds'])) {
    throw new Error(`Test case "${t['id']}" is missing 'requirementIds' array`);
  }
  if (!Array.isArray(t['acceptanceCriteriaRefs'])) {
    throw new Error(`Test case "${t['id']}" is missing 'acceptanceCriteriaRefs' array`);
  }
  if (!VALID_TEST_STATUSES.has(t['status'] as string)) {
    throw new Error(`Test case "${t['id']}" has invalid status: "${t['status']}"`);
  }
  if (typeof t['automated'] !== 'boolean') {
    throw new Error(`Test case "${t['id']}" is missing 'automated' boolean`);
  }
  if (!VALID_TEST_ORIGINS.has(t['origin'] as string)) {
    throw new Error(`Test case "${t['id']}" has invalid origin: "${t['origin']}"`);
  }

  return {
    id: t['id'] as string,
    title: t['title'] as string,
    description: t['description'] as string,
    type: t['type'] as TestType,
    requirementIds: t['requirementIds'] as string[],
    acceptanceCriteriaRefs: t['acceptanceCriteriaRefs'] as Array<{ requirementId: string; criterionIndex: number }>,
    status: t['status'] as TestStatus,
    automated: t['automated'] as boolean,
    origin: t['origin'] as TestOrigin,
    notes: typeof t['notes'] === 'string' ? t['notes'] : '',
  };
}

/**
 * Load seeded test cases from a JSON file.
 */
export function loadTestCases(filePath: string): TestCase[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;

  if (!Array.isArray(raw)) {
    throw new Error(`Test cases file must be a JSON array: ${filePath}`);
  }

  return raw.map((item, i) => validateTestCase(item, i));
}

/**
 * Load all test case JSON files from a directory.
 */
export function loadTestCasesFromDirectory(dirPath: string): TestCase[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const testCases: TestCase[] = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    testCases.push(...loadTestCases(filePath));
  }

  return testCases;
}

// ---------------------------------------------------------------------------
// Traceability Links
// ---------------------------------------------------------------------------

function validateTraceabilityLink(raw: unknown, index: number): TraceabilityLink {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`Traceability link at index ${index} is not an object`);
  }

  const t = raw as Record<string, unknown>;

  if (typeof t['requirementId'] !== 'string' || !t['requirementId']) {
    throw new Error(`Traceability link at index ${index} is missing 'requirementId'`);
  }
  if (typeof t['testCaseId'] !== 'string' || !t['testCaseId']) {
    throw new Error(`Traceability link at index ${index} is missing 'testCaseId'`);
  }
  if (!VALID_COVERAGE_TYPES.has(t['coverageType'] as string)) {
    throw new Error(`Traceability link at index ${index} has invalid coverageType: "${t['coverageType']}"`);
  }

  return {
    requirementId: t['requirementId'] as string,
    testCaseId: t['testCaseId'] as string,
    coverageType: t['coverageType'] as 'full' | 'partial',
    notes: typeof t['notes'] === 'string' ? t['notes'] : '',
  };
}

/**
 * Load traceability links from a JSON file.
 */
export function loadTraceabilityLinks(filePath: string): TraceabilityLink[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;

  if (!Array.isArray(raw)) {
    throw new Error(`Traceability file must be a JSON array: ${filePath}`);
  }

  return raw.map((item, i) => validateTraceabilityLink(item, i));
}

/**
 * Load all traceability JSON files from a directory.
 */
export function loadTraceabilityLinksFromDirectory(dirPath: string): TraceabilityLink[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
  const links: TraceabilityLink[] = [];

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    links.push(...loadTraceabilityLinks(filePath));
  }

  return links;
}

// ---------------------------------------------------------------------------
// Cross-reference validation
// ---------------------------------------------------------------------------

/**
 * Validate that all traceability links reference real requirements and real test cases.
 * Returns the validated links (invalid ones are logged and dropped).
 */
export function validateLinks(
  links: TraceabilityLink[],
  requirements: Requirement[],
  testCases: TestCase[],
): TraceabilityLink[] {
  const reqIds = new Set(requirements.map((r) => r.id));
  const tcIds = new Set(testCases.map((t) => t.id));

  return links.filter((link) => {
    if (!reqIds.has(link.requirementId)) {
      console.warn(`[dataLoader] Dropping link: unknown requirementId "${link.requirementId}"`);
      return false;
    }
    if (!tcIds.has(link.testCaseId)) {
      console.warn(`[dataLoader] Dropping link: unknown testCaseId "${link.testCaseId}" (linked to ${link.requirementId})`);
      return false;
    }
    return true;
  });
}

/**
 * Validate a requirement ID matches the expected pattern.
 */
export function isValidRequirementId(id: string): boolean {
  return REQ_ID_PATTERN.test(id);
}
