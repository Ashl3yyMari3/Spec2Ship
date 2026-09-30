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
import { searchProjects } from './services/globalSearchService.js';
import {
  createProject,
  getProject,
  initializeProjectStore,
  listProjects,
  listProjectWorkspaces,
  saveProject,
  isValidShipKey,
  normalizeShipKey,
  shipKeyInUse,
  nextRequirementId,
  nextTestCaseIds,
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


  app.get('/api/search', (req, res) => {
    const query =
      typeof req.query.q === 'string'
        ? req.query.q.trim()
        : '';

    if (!query) {
      res.json({
        query: '',
        results: [],
      });
      return;
    }

    if (query.length > 120) {
      res.status(400).json({
        error: 'Search query must be 120 characters or fewer.',
      });
      return;
    }

    const limitValue =
      typeof req.query.limit === 'string'
        ? Number(req.query.limit)
        : 30;

    const limit = Number.isFinite(limitValue)
      ? Math.min(Math.max(Math.floor(limitValue), 1), 50)
      : 30;

    const results = searchProjects(
      listProjectWorkspaces(),
      query,
      limit,
    );

    res.json({
      query,
      results,
    });
  });

  app.post('/api/projects', (req, res) => {
    const {
      name,
      shipKey,
      description = '',
      template = 'blank',
    } = req.body ?? {};

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.length > 100 ||
      typeof shipKey !== 'string' ||
      !isValidShipKey(shipKey) ||
      typeof description !== 'string' ||
      description.length > 500 ||
      (template !== 'blank' && template !== 'shopsphere')
    ) {
      res.status(400).json({
        error:
          'Project name and a valid Ship Key are required. Ship Key must be 2–8 letters or numbers and start with a letter.',
      });
      return;
    }

    const canonicalShipKey = normalizeShipKey(shipKey);

    if (shipKeyInUse(canonicalShipKey)) {
      res.status(409).json({
        error: `Ship Key ${canonicalShipKey} is already used by another project.`,
      });
      return;
    }

    const project = createProject({
      name,
      shipKey: canonicalShipKey,
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

    const requirementId = nextRequirementId(project);

    project.requirements.push({
      id: requirementId,
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

        const availableIds = nextTestCaseIds(
          project,
          newSuggestions.length,
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

    for (const test of tests) {
      if (
        !test ||
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
            'One or more test cases are invalid. Review the title, description, linked requirement, type, status, and coverage fields.',
        });
        return;
      }
    }

    const assignedIds = nextTestCaseIds(project, tests.length);

    tests.forEach((test, index) => {
      const assignedId = assignedIds[index];

      project.seededTests.push({
        id: assignedId,
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
        testCaseId: assignedId,
        coverageType: test.coverageType,
        notes:
          'Added through Spec2Ship and linked to the selected requirement.',
      });
    });

    const saved = saveProject(project);

    res.status(201).json({
      addedCount: tests.length,
      assignedIds,
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

    const normalizedRequirementIds = [
      ...new Set(requirementIds as string[]),
    ];

    const testCaseId = nextTestCaseIds(project, 1)[0];

    project.seededTests.push({
      id: testCaseId,
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
        testCaseId,
        coverageType,
        notes:
          'Linked through Spec2Ship Project Setup.',
      });
    }

    const saved = saveProject(project);
    res.status(201).json({
      testCaseId,
      project: saved,
    });
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
