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
