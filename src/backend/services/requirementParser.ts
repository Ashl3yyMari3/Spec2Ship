/**
 * requirementParser.ts
 *
 * Parses Markdown requirement files from data/requirements/.
 * The file has a YAML-like metadata block at the top (between --- delimiters)
 * that maps requirement IDs to explicit criticality values and declares the domain.
 * Requirements are parsed from ## REQ-* headings.
 *
 * Criticality is NEVER inferred from keywords — only read from the metadata block.
 * Missing criticality defaults to "medium".
 */

import fs from 'fs';
import path from 'path';
import type { Requirement, Criticality } from '../types/models.js';

// Valid criticality values
const VALID_CRITICALITY: Set<string> = new Set(['low', 'medium', 'high', 'critical']);

// Requirement ID pattern: e.g. REQ-AUTH-001
const REQ_ID_PATTERN = /^[A-Z][A-Z0-9]*(-[A-Z0-9]+)+$/;

interface FileMetadata {
  criticality: Record<string, Criticality>;
  domain: string;
  tags: string[];
}

/**
 * Parse the YAML-like metadata block between the first pair of --- delimiters.
 * Supports:
 *   criticality:
 *     REQ-AUTH-001: high
 *   domain: authentication
 */
function parseMetadataBlock(raw: string): FileMetadata {
  const result: FileMetadata = { criticality: {}, domain: 'unknown', tags: [] };

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();

    // Skip comment lines
    if (trimmed.startsWith('#') || trimmed === '') continue;

    // Inline criticality entry: "  REQ-AUTH-001: high"
    const inlineCrit = trimmed.match(/^(REQ-[A-Z0-9-]+):\s*(.+)$/);
    if (inlineCrit) {
      const id = inlineCrit[1].trim();
      const val = inlineCrit[2].trim().toLowerCase();
      if (REQ_ID_PATTERN.test(id)) {
        result.criticality[id] = VALID_CRITICALITY.has(val) ? (val as Criticality) : 'medium';
      }
      continue;
    }

    // domain key
    const domainMatch = trimmed.match(/^domain:\s*(.+)$/);
    if (domainMatch) {
      result.domain = domainMatch[1].trim();
      continue;
    }
  }

  return result;
}

interface RawRequirement {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

/**
 * Parse requirement blocks from the markdown body (after the metadata block).
 * A block starts with a ## heading matching the pattern "## REQ-* — Title".
 * Description follows under "### Description", acceptance criteria under "### Acceptance Criteria".
 */
function parseRequirementBlocks(body: string): RawRequirement[] {
  const requirements: RawRequirement[] = [];

  // Split body into sections at level-2 headings
  // Each section begins with "## REQ-"
  const sections = body.split(/^(?=## REQ-)/m);

  for (const section of sections) {
    const headingMatch = section.match(/^## (REQ-[A-Z0-9-]+)\s+[—–-]\s+(.+)/);
    if (!headingMatch) continue;

    const id = headingMatch[1].trim();
    const title = headingMatch[2].trim();

    if (!REQ_ID_PATTERN.test(id)) {
      throw new Error(`Invalid requirement ID format: "${id}"`);
    }

    // Parse description
    let description = '';
    const descMatch = section.match(/### Description\n([\s\S]+?)(?=\n###|\n## |\n---|\s*$)/);
    if (descMatch) {
      description = descMatch[1].trim();
    }

    // Parse acceptance criteria
    const acceptanceCriteria: string[] = [];
    const acMatch = section.match(/### Acceptance Criteria\n([\s\S]+?)(?=\n###|\n## |\n---|\s*$)/);
    if (acMatch) {
      const acLines = acMatch[1].split('\n');
      for (const line of acLines) {
        const criterion = line.replace(/^\s*\d+\.\s+/, '').trim();
        if (criterion) {
          acceptanceCriteria.push(criterion);
        }
      }
    }

    requirements.push({ id, title, description, acceptanceCriteria });
  }

  return requirements;
}

/**
 * Parse a single requirement markdown file into a list of Requirement objects.
 * @param filePath absolute path to the .md file
 * @param relativeSourcePath relative path stored on Requirement.sourceFile
 */
export function parseRequirementFile(filePath: string, relativeSourcePath: string): Requirement[] {
  const content = fs
    .readFileSync(filePath, 'utf-8')
    .replace(/\r\n?/g, '\n');

  // Extract metadata block (between first --- and second ---)
  let metadata: FileMetadata = { criticality: {}, domain: 'unknown', tags: [] };
  let body = content;

  const metaMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (metaMatch) {
    metadata = parseMetadataBlock(metaMatch[1]);
    body = metaMatch[2];
  }

  const rawReqs = parseRequirementBlocks(body);

  return rawReqs.map((raw) => {
    const criticality: Criticality = metadata.criticality[raw.id] ?? 'medium';
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      acceptanceCriteria: raw.acceptanceCriteria,
      domain: metadata.domain,
      criticality,
      sourceFile: relativeSourcePath,
      tags: [],
      changed: false,
    };
  });
}

/**
 * Load and parse all .md files from a requirements directory.
 * Returns a flat list of all parsed requirements across all files.
 */
export function parseRequirementsDirectory(dirPath: string): Requirement[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.md'));
  const requirements: Requirement[] = [];

  for (const file of files) {
    const absPath = path.join(dirPath, file);
    const relPath = path.join('data/requirements', file);
    const parsed = parseRequirementFile(absPath, relPath);
    requirements.push(...parsed);
  }

  return requirements;
}
