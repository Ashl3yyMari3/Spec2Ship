/**
 * server.ts — Express application factory.
 *
 * Separated from index.ts so integration tests can import the app
 * without opening a real port.
 *
 * Data is loaded once at startup and cached in module scope.
 * All 8 API routes are registered here.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

const DATA_ROOT = path.resolve(__dirname, '../../data');

const requirements = loadRequirements(
  path.join(DATA_ROOT, 'requirements'),
);

const seededTests = loadTestCasesFromDirectory(
  path.join(DATA_ROOT, 'tests'),
);

const rawLinks = loadTraceabilityLinksFromDirectory(
  path.join(DATA_ROOT, 'traceability'),
);

const suggestions = generateTestSuggestions(
  requirements,
  seededTests,
);

const allTestCases = [
  ...seededTests,
  ...suggestions,
];

// Validate links against the full test set
const links = validateLinks(
  rawLinks,
  requirements,
  allTestCases,
);

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

export function createApp(): express.Express {
  const app = express();

  // CORS is only needed for local development because production
  // serves the frontend and API from the same origin.
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
  // GET /api/requirements
  // ------------------------------------------------------------------

  app.get('/api/requirements', (_req, res) => {
    res.json(requirements);
  });

  // ------------------------------------------------------------------
  // GET /api/tests
  // ------------------------------------------------------------------

  app.get('/api/tests', (_req, res) => {
    res.json(allTestCases);
  });

  // ------------------------------------------------------------------
  // GET /api/test-suggestions
  // ------------------------------------------------------------------

  app.get('/api/test-suggestions', (_req, res) => {
    res.json(suggestions);
  });


// ------------------------------------------------------------------
// POST /api/ai/analyze-requirement
// ------------------------------------------------------------------

app.post('/api/ai/analyze-requirement', aiRateLimiter, async (req, res) => {
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
});


  // ------------------------------------------------------------------
  // POST /api/ai/chat
  // ------------------------------------------------------------------

  app.post('/api/ai/chat', aiRateLimiter, async (req, res) => {
    const { message, history = [] } = req.body ?? {};

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
        requirements,
        allTestCases,
        links,
      );
      const riskScores = computeAllRiskScores(
        requirements,
        allTestCases,
        links,
      );
      const releaseReadiness = buildReleaseReadinessReport(
        requirements,
        allTestCases,
        links,
      );
      const impactReports = requirements
        .map((requirement) =>
          computeImpact(
            requirement.id,
            requirements,
            allTestCases,
            links,
          ),
        )
        .filter((report) => report !== null);

      const answer = await askSpec2ShipCopilot(
        message.trim(),
        history,
        {
          requirements,
          testCases: allTestCases,
          traceabilityLinks: links,
          coverage,
          riskScores,
          releaseReadiness,
          impactReports,
        },
      );

      res.json({ answer });
    } catch (error) {
      console.error('Spec2Ship AI chat failed:', error);
      res.status(500).json({
        error: 'Spec2Ship AI could not answer that question.',
      });
    }
  });

  // ------------------------------------------------------------------
  // GET /api/traceability
  // ------------------------------------------------------------------

  app.get('/api/traceability', (_req, res) => {
    const matrix = buildTraceabilityMatrix(
      requirements,
      allTestCases,
      links,
    );

    res.json(matrix);
  });

  // ------------------------------------------------------------------
  // GET /api/coverage-gaps
  // ------------------------------------------------------------------

  app.get('/api/coverage-gaps', (_req, res) => {
    const report = computeCoverageGaps(
      requirements,
      allTestCases,
      links,
    );

    res.json(report);
  });

  // ------------------------------------------------------------------
  // GET /api/impact/:requirementId
  // ------------------------------------------------------------------

  app.get('/api/impact/:requirementId', (req, res) => {
    const { requirementId } = req.params;

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
      requirements,
      allTestCases,
      links,
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

  // ------------------------------------------------------------------
  // GET /api/risk
  // ------------------------------------------------------------------

  app.get('/api/risk', (_req, res) => {
    const scores = computeAllRiskScores(
      requirements,
      allTestCases,
      links,
    );

    res.json(scores);
  });

  // ------------------------------------------------------------------
  // GET /api/release-readiness
  // ------------------------------------------------------------------

  app.get('/api/release-readiness', (_req, res) => {
    const report = buildReleaseReadinessReport(
      requirements,
      allTestCases,
      links,
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
