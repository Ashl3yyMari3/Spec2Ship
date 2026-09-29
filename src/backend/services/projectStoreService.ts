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
  description: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
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

function loadCustomProjects(): void {
  customProjects = new Map();

  if (!fs.existsSync(STORE_FILE)) return;

  const parsed = JSON.parse(
    fs.readFileSync(STORE_FILE, 'utf8'),
  ) as StoredProjectsFile;

  for (const project of parsed.projects ?? []) {
    customProjects.set(project.id, project);
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
    description:
      'Built-in Spec2Ship sample project for authentication QA and release-readiness analysis.',
    createdAt: now,
    updatedAt: now,
    isDemo: true,
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

export function createProject(input: {
  name: string;
  description?: string;
  template?: 'blank' | 'shopsphere';
}): ProjectWorkspace {
  requireInitialized();

  const now = new Date().toISOString();
  const useDemo = input.template === 'shopsphere';

  const project: ProjectWorkspace = {
    id: safeId(input.name),
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    createdAt: now,
    updatedAt: now,
    isDemo: false,
    requirements: useDemo
      ? clone((demoProject as ProjectWorkspace).requirements)
      : [],
    seededTests: useDemo
      ? clone((demoProject as ProjectWorkspace).seededTests)
      : [],
    traceabilityLinks: useDemo
      ? clone((demoProject as ProjectWorkspace).traceabilityLinks)
      : [],
  };

  customProjects.set(project.id, project);
  persistCustomProjects();

  return clone(project);
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
    updatedAt: new Date().toISOString(),
    isDemo: false,
  };

  customProjects.set(next.id, next);
  persistCustomProjects();

  return clone(next);
}
