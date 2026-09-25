/**
 * requirementParser.test.ts — Unit tests for the requirement parser.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseRequirementFile, parseRequirementsDirectory } from '../../src/backend/services/requirementParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_MD = path.resolve(__dirname, '../../data/requirements/authentication.md');
const REQ_DIR = path.resolve(__dirname, '../../data/requirements');

describe('requirementParser', () => {
  let requirements: ReturnType<typeof parseRequirementFile>;

  beforeAll(() => {
    requirements = parseRequirementFile(AUTH_MD, 'data/requirements/authentication.md');
  });

  it('parses exactly 3 requirements from authentication.md', () => {
    expect(requirements).toHaveLength(3);
  });

  it('parses requirement IDs correctly', () => {
    const ids = requirements.map((r) => r.id);
    expect(ids).toContain('REQ-AUTH-001');
    expect(ids).toContain('REQ-AUTH-002');
    expect(ids).toContain('REQ-AUTH-003');
  });

  it('parses titles correctly', () => {
    const r1 = requirements.find((r) => r.id === 'REQ-AUTH-001')!;
    expect(r1.title).toBe('User Registration');
  });

  it('reads explicit criticality from metadata block', () => {
    const r1 = requirements.find((r) => r.id === 'REQ-AUTH-001')!;
    const r2 = requirements.find((r) => r.id === 'REQ-AUTH-002')!;
    const r3 = requirements.find((r) => r.id === 'REQ-AUTH-003')!;
    expect(r1.criticality).toBe('high');
    expect(r2.criticality).toBe('high');
    expect(r3.criticality).toBe('critical');
  });

  it('parses domain from metadata block', () => {
    expect(requirements[0].domain).toBe('authentication');
  });

  it('parses correct number of acceptance criteria for REQ-AUTH-001', () => {
    const r1 = requirements.find((r) => r.id === 'REQ-AUTH-001')!;
    expect(r1.acceptanceCriteria).toHaveLength(10);
  });

  it('preserves acceptance criteria ordering (0-based)', () => {
    const r1 = requirements.find((r) => r.id === 'REQ-AUTH-001')!;
    expect(r1.acceptanceCriteria[0]).toBe('The email address is required.');
    expect(r1.acceptanceCriteria[4]).toBe('The password must contain at least 8 characters.');
  });

  it('parses correct number of acceptance criteria for REQ-AUTH-003', () => {
    const r3 = requirements.find((r) => r.id === 'REQ-AUTH-003')!;
    expect(r3.acceptanceCriteria).toHaveLength(5);
  });

  it('parses Windows CRLF line endings correctly', () => {
    const tempPath = path.join(os.tmpdir(), 'spec2ship-authentication-crlf.md');
    const source = fs.readFileSync(AUTH_MD, 'utf-8').replace(/\r\n?/g, '\n');

    fs.writeFileSync(tempPath, source.replace(/\n/g, '\r\n'), 'utf-8');

    try {
      const parsed = parseRequirementFile(
        tempPath,
        'data/requirements/authentication.md',
      );

      expect(parsed).toHaveLength(3);

      const r1 = parsed.find((r) => r.id === 'REQ-AUTH-001')!;
      const r3 = parsed.find((r) => r.id === 'REQ-AUTH-003')!;

      expect(r1.acceptanceCriteria).toHaveLength(10);
      expect(r3.acceptanceCriteria).toHaveLength(5);
      expect(r1.acceptanceCriteria[0]).toBe('The email address is required.');
    } finally {
      fs.unlinkSync(tempPath);
    }
  });

  it('stores the relative sourceFile path', () => {
    expect(requirements[0].sourceFile).toBe('data/requirements/authentication.md');
  });

  it('sets changed=false by default', () => {
    requirements.forEach((r) => expect(r.changed).toBe(false));
  });

  it('parseRequirementsDirectory loads the same requirements', () => {
    const fromDir = parseRequirementsDirectory(REQ_DIR);
    expect(fromDir).toHaveLength(3);
  });
});
