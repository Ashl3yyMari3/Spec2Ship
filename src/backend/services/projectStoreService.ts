import fs from 'fs';
import path from 'path';
import type {
  Requirement,
  TestCase,
  TraceabilityLink,
} from '../types/models.js';

export interface ProjectSummary {
  id: string;
  name: string;
  shipKey: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  requirementCount: number;
  testCount: number;
}

export interface ProjectWorkspace {
  id: string;
  name: string;
  shipKey: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  idSchemeVersion: number;
  requirements: Requirement[];
  seededTests: TestCase[];
  traceabilityLinks: TraceabilityLink[];
}

interface StoredProjectsFile {
  projects: ProjectWorkspace[];
}

const STORE_DIR =
  process.env.SPEC2SHIP_WORKSPACE_DIR ??
  path.resolve(process.cwd(), '.spec2ship');

const STORE_FILE = path.join(STORE_DIR, 'projects.json');

let demoProject: ProjectWorkspace | null = null;
let customProjects = new Map<string, ProjectWorkspace>();
let initialized = false;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function safeId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'project';

  return `${slug}-${Date.now().toString(36)}`;
}

export function normalizeShipKey(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

export function isValidShipKey(value: string): boolean {
  return /^[A-Z][A-Z0-9]{1,7}$/.test(normalizeShipKey(value));
}

function deriveLegacyShipKey(name: string): string {
  const words = name
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);

  const initials = words
    .map((word) => word[0])
    .join('')
    .slice(0, 4);

  if (initials.length >= 2) return initials;

  const compact = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4);

  if (/^[A-Z][A-Z0-9]{1,7}$/.test(compact)) {
    return compact;
  }

  return 'PRJ';
}

function rekeyProjectData(
  project: ProjectWorkspace,
  shipKey: string,
): ProjectWorkspace {
  const requirementMap = new Map<string, string>();
  const testMap = new Map<string, string>();

  const requirements = project.requirements.map(
    (requirement, index) => {
      const id = `${shipKey}-${index + 1}`;
      requirementMap.set(requirement.id, id);

      return {
        ...requirement,
        id,
      };
    },
  );

  const seededTests = project.seededTests.map(
    (testCase, index) => {
      const id = `${shipKey}-T${index + 1}`;
      testMap.set(testCase.id, id);

      return {
        ...testCase,
        id,
        requirementIds: testCase.requirementIds
          .map((requirementId) =>
            requirementMap.get(requirementId),
          )
          .filter((value): value is string => Boolean(value)),
        acceptanceCriteriaRefs:
          testCase.acceptanceCriteriaRefs
            .map((reference) => {
              const requirementId =
                requirementMap.get(reference.requirementId);

              if (!requirementId) return null;

              return {
                ...reference,
                requirementId,
              };
            })
            .filter(
              (
                value,
              ): value is NonNullable<typeof value> =>
                value !== null,
            ),
      };
    },
  );

  const traceabilityLinks = project.traceabilityLinks
    .map((link) => {
      const requirementId =
        requirementMap.get(link.requirementId);
      const testCaseId = testMap.get(link.testCaseId);

      if (!requirementId || !testCaseId) return null;

      return {
        ...link,
        requirementId,
        testCaseId,
      };
    })
    .filter(
      (
        value,
      ): value is NonNullable<typeof value> =>
        value !== null,
    );

  return {
    ...project,
    shipKey,
    idSchemeVersion: 2,
    requirements,
    seededTests,
    traceabilityLinks,
  };
}

function migrateStoredProject(
  project: ProjectWorkspace,
): ProjectWorkspace {
  const shipKey =
    project.shipKey && isValidShipKey(project.shipKey)
      ? normalizeShipKey(project.shipKey)
      : deriveLegacyShipKey(project.name);

  if (project.idSchemeVersion === 2) {
    return {
      ...project,
      shipKey,
    };
  }

  return rekeyProjectData(
    {
      ...project,
      shipKey,
      idSchemeVersion: project.idSchemeVersion ?? 1,
    },
    shipKey,
  );
}

function loadCustomProjects(): void {
  customProjects = new Map();

  if (!fs.existsSync(STORE_FILE)) return;

  const parsed = JSON.parse(
    fs.readFileSync(STORE_FILE, 'utf8'),
  ) as StoredProjectsFile;

  let migrated = false;
  const usedKeys = new Set<string>(['SHOP']);

  for (const rawProject of parsed.projects ?? []) {
    let project = migrateStoredProject(rawProject);
    let candidate = project.shipKey;
    let suffix = 2;

    while (usedKeys.has(candidate)) {
      const base = project.shipKey.slice(
        0,
        Math.max(2, 8 - String(suffix).length),
      );

      candidate = `${base}${suffix}`;
      suffix += 1;
    }

    if (
      candidate !== rawProject.shipKey ||
      project.shipKey !== rawProject.shipKey
    ) {
      migrated = true;
    }

    project = {
      ...project,
      shipKey: candidate,
    };

    usedKeys.add(candidate);
    customProjects.set(project.id, project);
  }

  if (migrated) {
    persistCustomProjects();
  }
}

function persistCustomProjects(): void {
  fs.mkdirSync(STORE_DIR, { recursive: true });

  const payload: StoredProjectsFile = {
    projects: [...customProjects.values()],
  };

  fs.writeFileSync(
    STORE_FILE,
    JSON.stringify(payload, null, 2),
    'utf8',
  );
}

export function initializeProjectStore(input: {
  requirements: Requirement[];
  seededTests: TestCase[];
  traceabilityLinks: TraceabilityLink[];
}): void {
  if (initialized) return;

  const now = new Date().toISOString();

  demoProject = {
    id: 'shopsphere-demo',
    name: 'ShopSphere Demo',
    shipKey: 'SHOP',
    description:
      'Built-in Spec2Ship sample project for authentication QA and release-readiness analysis.',
    createdAt: now,
    updatedAt: now,
    isDemo: true,
    idSchemeVersion: 2,
    requirements: clone(input.requirements),
    seededTests: clone(input.seededTests),
    traceabilityLinks: clone(input.traceabilityLinks),
  };

  loadCustomProjects();
  initialized = true;
}

function requireInitialized(): void {
  if (!initialized || !demoProject) {
    throw new Error('Project store has not been initialized.');
  }
}

function summary(project: ProjectWorkspace): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    shipKey: project.shipKey,
    description: project.description,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    isDemo: project.isDemo,
    requirementCount: project.requirements.length,
    testCount: project.seededTests.length,
  };
}

export function listProjects(): ProjectSummary[] {
  requireInitialized();

  return [
    summary(demoProject as ProjectWorkspace),
    ...[...customProjects.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(summary),
  ];
}

export function getProject(
  projectId?: string | null,
): ProjectWorkspace | null {
  requireInitialized();

  if (!projectId || projectId === 'shopsphere-demo') {
    return clone(demoProject as ProjectWorkspace);
  }

  const project = customProjects.get(projectId);
  return project ? clone(project) : null;
}

export function shipKeyInUse(
  shipKey: string,
  exceptProjectId?: string,
): boolean {
  requireInitialized();

  const canonical = normalizeShipKey(shipKey);

  if (
    demoProject &&
    demoProject.id !== exceptProjectId &&
    demoProject.shipKey === canonical
  ) {
    return true;
  }

  return [...customProjects.values()].some(
    (project) =>
      project.id !== exceptProjectId &&
      project.shipKey === canonical,
  );
}

function cloneDemoDataForShipKey(
  shipKey: string,
): Pick<
  ProjectWorkspace,
  'requirements' | 'seededTests' | 'traceabilityLinks'
> {
  const demo = demoProject as ProjectWorkspace;

  const requirementIdMap = new Map<string, string>();
  const testIdMap = new Map<string, string>();

  const requirements = demo.requirements.map(
    (requirement, index) => {
      const id = `${shipKey}-${index + 1}`;
      requirementIdMap.set(requirement.id, id);

      return {
        ...clone(requirement),
        id,
        sourceFile: `template:shopsphere`,
      };
    },
  );

  const seededTests = demo.seededTests.map(
    (testCase, index) => {
      const id = `${shipKey}-T${index + 1}`;
      testIdMap.set(testCase.id, id);

      return {
        ...clone(testCase),
        id,
        requirementIds: testCase.requirementIds
          .map((requirementId) =>
            requirementIdMap.get(requirementId),
          )
          .filter((value): value is string => Boolean(value)),
        acceptanceCriteriaRefs:
          testCase.acceptanceCriteriaRefs
            .map((reference) => {
              const requirementId =
                requirementIdMap.get(reference.requirementId);

              if (!requirementId) return null;

              return {
                ...reference,
                requirementId,
              };
            })
            .filter(
              (
                value,
              ): value is NonNullable<typeof value> =>
                value !== null,
            ),
      };
    },
  );

  const traceabilityLinks = demo.traceabilityLinks
    .map((link) => {
      const requirementId =
        requirementIdMap.get(link.requirementId);
      const testCaseId = testIdMap.get(link.testCaseId);

      if (!requirementId || !testCaseId) return null;

      return {
        ...clone(link),
        requirementId,
        testCaseId,
      };
    })
    .filter(
      (
        value,
      ): value is NonNullable<typeof value> =>
        value !== null,
    );

  return {
    requirements,
    seededTests,
    traceabilityLinks,
  };
}

export function createProject(input: {
  name: string;
  shipKey: string;
  description?: string;
  template?: 'blank' | 'shopsphere';
}): ProjectWorkspace {
  requireInitialized();

  const shipKey = normalizeShipKey(input.shipKey);

  if (!isValidShipKey(shipKey)) {
    throw new Error(
      'Ship Key must be 2–8 characters, start with a letter, and contain only letters or numbers.',
    );
  }

  if (shipKeyInUse(shipKey)) {
    throw new Error(
      `Ship Key ${shipKey} is already used by another project.`,
    );
  }

  const now = new Date().toISOString();
  const useDemo = input.template === 'shopsphere';
  const templateData = useDemo
    ? cloneDemoDataForShipKey(shipKey)
    : {
        requirements: [],
        seededTests: [],
        traceabilityLinks: [],
      };

  const project: ProjectWorkspace = {
    id: safeId(input.name),
    name: input.name.trim(),
    shipKey,
    description: input.description?.trim() ?? '',
    createdAt: now,
    updatedAt: now,
    isDemo: false,
    idSchemeVersion: 2,
    ...templateData,
  };

  customProjects.set(project.id, project);
  persistCustomProjects();

  return clone(project);
}

function nextNumber(
  ids: string[],
  pattern: RegExp,
): number {
  let max = 0;

  for (const id of ids) {
    const match = id.toUpperCase().match(pattern);

    if (!match) continue;

    const parsed = Number(match[1]);

    if (Number.isFinite(parsed)) {
      max = Math.max(max, parsed);
    }
  }

  return max + 1;
}

export function nextRequirementId(
  project: ProjectWorkspace,
): string {
  const key = normalizeShipKey(project.shipKey);
  const pattern = new RegExp(`^${key}-(\\d+)$`, 'i');

  const sequence = nextNumber(
    project.requirements.map((requirement) => requirement.id),
    pattern,
  );

  return `${key}-${sequence}`;
}

export function nextTestCaseIds(
  project: ProjectWorkspace,
  count = 1,
): string[] {
  const key = normalizeShipKey(project.shipKey);
  const pattern = new RegExp(`^${key}-T(\\d+)$`, 'i');

  const start = nextNumber(
    project.seededTests.map((testCase) => testCase.id),
    pattern,
  );

  return Array.from(
    { length: count },
    (_, index) => `${key}-T${start + index}`,
  );
}

export function saveProject(
  project: ProjectWorkspace,
): ProjectWorkspace {
  requireInitialized();

  if (project.isDemo || project.id === 'shopsphere-demo') {
    throw new Error('The built-in demo project cannot be modified.');
  }

  const next: ProjectWorkspace = {
    ...clone(project),
    shipKey: normalizeShipKey(project.shipKey),
    updatedAt: new Date().toISOString(),
    isDemo: false,
    idSchemeVersion: 2,
  };

  customProjects.set(next.id, next);
  persistCustomProjects();

  return clone(next);
}
