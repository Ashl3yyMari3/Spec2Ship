/**
 * server.ts — Express application factory.
 *
 * Separated from index.ts so tests can import the app without opening a port.
 * Built-in ShopSphere data is used as the default demo project, while custom
 * projects are resolved per request through the project workspace store.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import type { Request } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import {
  loadRequirements,
  loadTestCasesFromDirectory,
  loadTraceabilityLinksFromDirectory,
  validateLinks,
  isValidRequirementId,
} from './services/dataLoader.js';

import { generateTestSuggestions } from './services/testSuggestionService.js';
import { buildTraceabilityMatrix } from './services/traceabilityService.js';
import { computeCoverageGaps } from './services/coverageService.js';
import { computeImpact } from './services/impactService.js';
import { computeAllRiskScores } from './services/riskService.js';
import { buildReleaseReadinessReport } from './services/reportService.js';
import { analyzeRequirement } from './services/aiRequirementService.js';
import { askSpec2ShipCopilot } from './services/aiCopilotService.js';
import {
  createProject,
  getProject,
  initializeProjectStore,
  listProjects,
  saveProject,
  type ProjectWorkspace,
} from './services/projectStoreService.js';
import type {
  TestCase,
  TraceabilityLink,
} from './types/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Built-in demo data
// ---------------------------------------------------------------------------

const DATA_ROOT = path.resolve(__dirname, '../../data');

const demoRequirements = loadRequirements(
  path.join(DATA_ROOT, 'requirements'),
);

const demoSeededTests = loadTestCasesFromDirectory(
  path.join(DATA_ROOT, 'tests'),
);

const demoTraceabilityLinks = loadTraceabilityLinksFromDirectory(
  path.join(DATA_ROOT, 'traceability'),
);

initializeProjectStore({
  requirements: demoRequirements,
  seededTests: demoSeededTests,
  traceabilityLinks: demoTraceabilityLinks,
});

interface ProjectRuntime {
  project: ProjectWorkspace;
  suggestions: TestCase[];
  allTestCases: TestCase[];
  links: TraceabilityLink[];
}

function projectIdFromRequest(req: Request): string | null {
  const value = req.query.projectId;
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null;
}

function buildProjectRuntime(req: Request): ProjectRuntime | null {
  const project = getProject(projectIdFromRequest(req));

  if (!project) return null;

  const suggestions = generateTestSuggestions(
    project.requirements,
    project.seededTests,
  );

  const allTestCases = [
    ...project.seededTests,
    ...suggestions,
  ];

  const links = validateLinks(
    project.traceabilityLinks,
    project.requirements,
    allTestCases,
  );

  return {
    project,
    suggestions,
    allTestCases,
    links,
  };
}

function sendMissingProject(res: express.Response): void {
  res.status(404).json({
    error: 'Project not found.',
  });
}


function normalizedId(value: string): string {
  return value.trim().toUpperCase();
}

function nextAvailableTestIds(
  requirementId: string,
  count: number,
  existingIds: Iterable<string>,
): string[] {
  const used = new Set(
    [...existingIds].map((id) => normalizedId(id)),
  );

  const requirementSegment = normalizedId(requirementId)
    .replace(/^REQ-/, '')
    .replace(/[^A-Z0-9-]/g, '-');

  const prefix = `TC-AI-${requirementSegment}-`;
  const ids: string[] = [];
  let sequence = 1;

  while (ids.length < count) {
    const candidate = `${prefix}${String(sequence).padStart(2, '0')}`;

    if (!used.has(candidate)) {
      ids.push(candidate);
      used.add(candidate);
    }

    sequence += 1;
  }

  return ids;
}

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

export function createApp(): express.Express {
  const app = express();

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  if (process.env.NODE_ENV !== 'production') {
    app.use(
      cors({
        origin: [
          'http://localhost:5173',
          'http://localhost:3001',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:3001',
        ],
      }),
    );
  }

  app.use(express.json());

  const aiRateLimiter = rateLimit({
    windowMs: 60_000,
    limit: 20,
    legacyHeaders: false,
  });

  // ------------------------------------------------------------------
  // Projects
  // ------------------------------------------------------------------

  app.get('/api/projects', (_req, res) => {
    res.json(listProjects());
  });

  app.post('/api/projects', (req, res) => {
    const {
      name,
      description = '',
      template = 'blank',
    } = req.body ?? {};

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.length > 100 ||
      typeof description !== 'string' ||
      description.length > 500 ||
      (template !== 'blank' && template !== 'shopsphere')
    ) {
      res.status(400).json({
        error:
          'Project name is required. Description and template must be valid.',
      });
      return;
    }

    const project = createProject({
      name,
      description,
      template,
    });

    res.status(201).json(project);
  });

  app.get('/api/projects/:projectId', (req, res) => {
    const project = getProject(req.params.projectId);

    if (!project) {
      sendMissingProject(res);
      return;
    }

    res.json(project);
  });


  app.post('/api/projects/:projectId/requirements', (req, res) => {
    const project = getProject(req.params.projectId);

    if (!project) {
      sendMissingProject(res);
      return;
    }

    if (project.isDemo) {
      res.status(403).json({
        error: 'The built-in demo project is read-only.',
      });
      return;
    }

    const {
      id,
      title,
      description,
      acceptanceCriteria,
      domain = 'general',
      criticality = 'medium',
      tags = [],
      changed = false,
    } = req.body ?? {};

    const validCriticality = [
      'low',
      'medium',
      'high',
      'critical',
    ].includes(criticality);

    if (
      typeof id !== 'string' ||
      !isValidRequirementId(id) ||
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      !Array.isArray(acceptanceCriteria) ||
      acceptanceCriteria.length === 0 ||
      acceptanceCriteria.length > 25 ||
      !acceptanceCriteria.every(
        (criterion) =>
          typeof criterion === 'string' &&
          criterion.trim().length > 0 &&
          criterion.length <= 1500,
      ) ||
      typeof domain !== 'string' ||
      domain.length > 80 ||
      !validCriticality ||
      !Array.isArray(tags) ||
      !tags.every((tag) => typeof tag === 'string') ||
      typeof changed !== 'boolean'
    ) {
      res.status(400).json({
        error: 'Requirement data is invalid.',
      });
      return;
    }

    if (
      project.requirements.some(
        (requirement) =>
          normalizedId(requirement.id) === normalizedId(id),
      )
    ) {
      res.status(409).json({
        error: `Requirement ID ${normalizedId(id)} already exists in this project. Choose a different requirement ID.`,
      });
      return;
    }

    project.requirements.push({
      id: normalizedId(id),
      title: title.trim(),
      description: description.trim(),
      acceptanceCriteria: acceptanceCriteria.map(
        (criterion: string) => criterion.trim(),
      ),
      domain: domain.trim() || 'general',
      criticality,
      sourceFile: `workspace:${project.id}`,
      tags: tags.map((tag: string) => tag.trim()).filter(Boolean),
      changed,
    });

    const saved = saveProject(project);
    res.status(201).json(saved);
  });

  app.post(
    '/api/projects/:projectId/requirements/:requirementId/ai-tests',
    aiRateLimiter,
    async (req, res) => {
      const project = getProject(req.params.projectId);

      if (!project) {
        sendMissingProject(res);
        return;
      }

      const requirement = project.requirements.find(
        (item) => item.id === req.params.requirementId,
      );

      if (!requirement) {
        res.status(404).json({
          error: 'Requirement not found in this project.',
        });
        return;
      }

      try {
        const analysis = await analyzeRequirement(
          `${requirement.title}\n${requirement.description}`,
          requirement.acceptanceCriteria,
        );

        const existingTitles = new Set(
          project.seededTests.map((testCase) =>
            testCase.title.trim().toLowerCase(),
          ),
        );

        const newSuggestions = analysis.suggestedTests
          .filter(
            (test) =>
              !existingTitles.has(
                test.title.trim().toLowerCase(),
              ),
          )
          .slice(0, 12);

        const availableIds = nextAvailableTestIds(
          requirement.id,
          newSuggestions.length,
          project.seededTests.map((testCase) => testCase.id),
        );

        const suggestions = newSuggestions.map((test, index) => ({
          id: availableIds[index],
          title: test.title,
          description: test.description,
          type: test.type,
          requirementId: requirement.id,
          status: 'not_run' as const,
          automated: false,
          coverageType: 'partial' as const,
        }));

        res.json({
          requirementId: requirement.id,
          riskLevel: analysis.riskLevel,
          summary: analysis.summary,
          suggestions,
        });
      } catch (error) {
        console.error('AI test generation failed:', error);
        res.status(500).json({
          error: 'AI test generation failed.',
        });
      }
    },
  );

  app.post('/api/projects/:projectId/tests/batch', (req, res) => {
    const project = getProject(req.params.projectId);

    if (!project) {
      sendMissingProject(res);
      return;
    }

    if (project.isDemo) {
      res.status(403).json({
        error: 'The built-in demo project is read-only.',
      });
      return;
    }

    const { tests } = req.body ?? {};

    if (
      !Array.isArray(tests) ||
      tests.length === 0 ||
      tests.length > 200
    ) {
      res.status(400).json({
        error: 'A batch of 1 to 200 test cases is required.',
      });
      return;
    }

    const validTypes = [
      'functional',
      'negative',
      'boundary',
      'security',
      'edge',
    ];

    const validStatuses = [
      'pass',
      'fail',
      'not_run',
      'blocked',
    ];

    const existingIds = new Set(
      project.seededTests.map((testCase) =>
        normalizedId(testCase.id),
      ),
    );

    const incomingIds = new Set<string>();
    const duplicateIds = new Set<string>();

    for (const test of tests) {
      if (test && typeof test.id === 'string' && test.id.trim()) {
        const canonicalId = normalizedId(test.id);

        if (
          existingIds.has(canonicalId) ||
          incomingIds.has(canonicalId)
        ) {
          duplicateIds.add(canonicalId);
        }

        incomingIds.add(canonicalId);
      }
    }

    if (duplicateIds.size > 0) {
      const ids = [...duplicateIds];

      res.status(409).json({
        error:
          `These test case IDs already exist or appear more than once in this import: ${ids.join(', ')}. Regenerate the AI suggestions or change the duplicate IDs before saving.`,
        duplicateIds: ids,
      });
      return;
    }

    for (const test of tests) {
      if (
        !test ||
        typeof test.id !== 'string' ||
        !test.id.trim() ||
        test.id.length > 80 ||
        typeof test.title !== 'string' ||
        !test.title.trim() ||
        typeof test.description !== 'string' ||
        !test.description.trim() ||
        !validTypes.includes(test.type) ||
        typeof test.requirementId !== 'string' ||
        !project.requirements.some(
          (requirement) =>
            requirement.id === test.requirementId,
        ) ||
        !validStatuses.includes(test.status ?? 'not_run') ||
        typeof (test.automated ?? false) !== 'boolean' ||
        (test.coverageType !== 'full' &&
          test.coverageType !== 'partial') ||
        (test.automation !== undefined &&
          (!test.automation ||
            typeof test.automation !== 'object' ||
            !['playwright', 'selenium', 'cypress', 'appium', 'other'].includes(
              test.automation.framework,
            )))
      ) {
        res.status(400).json({
          error:
            'One or more test cases are invalid. Review the test ID, title, description, linked requirement, type, status, and coverage fields.',
        });
        return;
      }
    }

    for (const test of tests) {
      project.seededTests.push({
        id: normalizedId(test.id),
        title: test.title.trim(),
        description: test.description.trim(),
        type: test.type,
        requirementIds: [test.requirementId],
        acceptanceCriteriaRefs: [],
        status: test.status ?? 'not_run',
        automated: test.automated ?? false,
        origin: 'seeded',
        notes:
          typeof test.notes === 'string'
            ? test.notes.trim()
            : 'AI-generated suggestion reviewed and added in Project Setup.',
        automation:
          test.automation && typeof test.automation === 'object'
            ? {
                framework: test.automation.framework,
                sourceFile:
                  typeof test.automation.sourceFile === 'string'
                    ? test.automation.sourceFile
                    : undefined,
                projectName:
                  typeof test.automation.projectName === 'string'
                    ? test.automation.projectName
                    : undefined,
                durationMs:
                  typeof test.automation.durationMs === 'number'
                    ? test.automation.durationMs
                    : undefined,
                importedAt:
                  typeof test.automation.importedAt === 'string'
                    ? test.automation.importedAt
                    : new Date().toISOString(),
              }
            : undefined,
      });

      project.traceabilityLinks.push({
        requirementId: test.requirementId,
        testCaseId: normalizedId(test.id),
        coverageType: test.coverageType,
        notes:
          'AI-generated suggestion reviewed and linked in Project Setup.',
      });
    }

    const saved = saveProject(project);

    res.status(201).json({
      addedCount: tests.length,
      project: saved,
    });
  });

  app.post('/api/projects/:projectId/tests', (req, res) => {
    const project = getProject(req.params.projectId);

    if (!project) {
      sendMissingProject(res);
      return;
    }

    if (project.isDemo) {
      res.status(403).json({
        error: 'The built-in demo project is read-only.',
      });
      return;
    }

    const {
      id,
      title,
      description,
      type,
      requirementIds,
      status = 'not_run',
      automated = false,
      notes = '',
      coverageType = 'partial',
    } = req.body ?? {};

    const validTypes = [
      'functional',
      'negative',
      'boundary',
      'security',
      'edge',
    ];

    const validStatuses = [
      'pass',
      'fail',
      'not_run',
      'blocked',
    ];

    if (
      typeof id !== 'string' ||
      !id.trim() ||
      id.length > 80 ||
      typeof title !== 'string' ||
      !title.trim() ||
      typeof description !== 'string' ||
      !description.trim() ||
      !validTypes.includes(type) ||
      !Array.isArray(requirementIds) ||
      requirementIds.length === 0 ||
      !requirementIds.every(
        (requirementId) =>
          typeof requirementId === 'string' &&
          project.requirements.some(
            (requirement) => requirement.id === requirementId,
          ),
      ) ||
      !validStatuses.includes(status) ||
      typeof automated !== 'boolean' ||
      typeof notes !== 'string' ||
      notes.length > 1000 ||
      (coverageType !== 'full' && coverageType !== 'partial')
    ) {
      res.status(400).json({
        error: 'Test case data is invalid.',
      });
      return;
    }

    if (
      project.seededTests.some(
        (testCase) =>
          normalizedId(testCase.id) === normalizedId(id),
      )
    ) {
      res.status(409).json({
        error: `Test Case ID ${normalizedId(id)} already exists in this project. Use a different ID or let AI generate the next available ID.`,
      });
      return;
    }

    const normalizedRequirementIds = [
      ...new Set(requirementIds as string[]),
    ];

    project.seededTests.push({
      id: normalizedId(id),
      title: title.trim(),
      description: description.trim(),
      type,
      requirementIds: normalizedRequirementIds,
      acceptanceCriteriaRefs: [],
      status,
      automated,
      origin: 'seeded',
      notes: notes.trim(),
    });

    for (const requirementId of normalizedRequirementIds) {
      project.traceabilityLinks.push({
        requirementId,
        testCaseId: normalizedId(id),
        coverageType,
        notes:
          'Linked through Spec2Ship Project Setup.',
      });
    }

    const saved = saveProject(project);
    res.status(201).json(saved);
  });

  // ------------------------------------------------------------------
  // Project-scoped QA data
  // ------------------------------------------------------------------

  app.get('/api/requirements', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    res.json(runtime.project.requirements);
  });

  app.get('/api/tests', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    res.json(runtime.allTestCases);
  });

  app.get('/api/test-suggestions', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    res.json(runtime.suggestions);
  });

  // ------------------------------------------------------------------
  // POST /api/ai/analyze-requirement
  // ------------------------------------------------------------------

  app.post(
    '/api/ai/analyze-requirement',
    aiRateLimiter,
    async (req, res) => {
      const { requirement, acceptanceCriteria } = req.body;

      if (
        typeof requirement !== 'string' ||
        !requirement.trim() ||
        !Array.isArray(acceptanceCriteria) ||
        !acceptanceCriteria.every(
          (criterion) => typeof criterion === 'string',
        )
      ) {
        res.status(400).json({
          error:
            'A requirement and an array of acceptance criteria are required.',
        });
        return;
      }

      if (
        requirement.length > 5000 ||
        acceptanceCriteria.length > 25 ||
        acceptanceCriteria.some(
          (criterion) => criterion.length > 1500,
        )
      ) {
        res.status(400).json({
          error: 'Requirement analysis input exceeds allowed limits.',
        });
        return;
      }

      try {
        const analysis = await analyzeRequirement(
          requirement.trim(),
          acceptanceCriteria,
        );

        res.json(analysis);
      } catch (error) {
        console.error('AI requirement analysis failed:', error);
        res.status(500).json({
          error: 'AI requirement analysis failed.',
        });
      }
    },
  );

  // ------------------------------------------------------------------
  // POST /api/ai/chat
  // ------------------------------------------------------------------

  app.post('/api/ai/chat', aiRateLimiter, async (req, res) => {
    const { message, history = [] } = req.body ?? {};
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    const validHistory =
      Array.isArray(history) &&
      history.length <= 10 &&
      history.every(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          item.content.length <= 3000,
      );

    if (
      typeof message !== 'string' ||
      !message.trim() ||
      message.length > 2000 ||
      !validHistory
    ) {
      res.status(400).json({
        error: 'A valid message and optional chat history are required.',
      });
      return;
    }

    try {
      const coverage = computeCoverageGaps(
        runtime.project.requirements,
        runtime.allTestCases,
        runtime.links,
      );

      const riskScores = computeAllRiskScores(
        runtime.project.requirements,
        runtime.allTestCases,
        runtime.links,
      );

      const releaseReadiness = buildReleaseReadinessReport(
        runtime.project.requirements,
        runtime.allTestCases,
        runtime.links,
      );

      const impactReports = runtime.project.requirements
        .map((requirement) =>
          computeImpact(
            requirement.id,
            runtime.project.requirements,
            runtime.allTestCases,
            runtime.links,
          ),
        )
        .filter((report) => report !== null);

      const answer = await askSpec2ShipCopilot(
        message.trim(),
        history,
        {
          requirements: runtime.project.requirements,
          testCases: runtime.allTestCases,
          traceabilityLinks: runtime.links,
          coverage,
          riskScores,
          releaseReadiness,
          impactReports,
        },
      );

      res.json({
        projectId: runtime.project.id,
        answer,
      });
    } catch (error) {
      console.error('Spec2Ship AI chat failed:', error);
      res.status(500).json({
        error: 'Spec2Ship AI could not answer that question.',
      });
    }
  });

  app.get('/api/traceability', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    const matrix = buildTraceabilityMatrix(
      runtime.project.requirements,
      runtime.allTestCases,
      runtime.links,
    );

    res.json(matrix);
  });

  app.get('/api/coverage-gaps', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    const report = computeCoverageGaps(
      runtime.project.requirements,
      runtime.allTestCases,
      runtime.links,
    );

    res.json(report);
  });

  app.get('/api/impact/:requirementId', (req, res) => {
    const { requirementId } = req.params;
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    if (!isValidRequirementId(requirementId)) {
      res.status(400).json({
        error:
          'Invalid requirement ID format. Expected pattern: [A-Z][A-Z0-9]*(-[A-Z0-9]+)+',
        requirementId,
      });
      return;
    }

    const report = computeImpact(
      requirementId,
      runtime.project.requirements,
      runtime.allTestCases,
      runtime.links,
    );

    if (!report) {
      res.status(404).json({
        error: `Requirement "${requirementId}" not found.`,
        requirementId,
      });
      return;
    }

    res.json(report);
  });

  app.get('/api/risk', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    const scores = computeAllRiskScores(
      runtime.project.requirements,
      runtime.allTestCases,
      runtime.links,
    );

    res.json(scores);
  });

  app.get('/api/release-readiness', (req, res) => {
    const runtime = buildProjectRuntime(req);

    if (!runtime) {
      sendMissingProject(res);
      return;
    }

    const report = buildReleaseReadinessReport(
      runtime.project.requirements,
      runtime.allTestCases,
      runtime.links,
    );

    res.json(report);
  });

  // ------------------------------------------------------------------
  // Production frontend
  // ------------------------------------------------------------------

  if (process.env.NODE_ENV === 'production') {
    const frontendDist = path.resolve(
      process.cwd(),
      'dist/frontend',
    );

    app.use(express.static(frontendDist));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        next();
        return;
      }

      res.sendFile(
        path.join(frontendDist, 'index.html'),
      );
    });
  }

  return app;
}
