import { GoogleGenAI } from '@google/genai';
import type {
  AICoverageAnalysis,
  AICoverageSuggestion,
  AICoverageSuggestionPriority,
  Requirement,
  RequirementCoverageEvaluation,
  TestCase,
  TestType,
} from '../types/models.js';

const TEST_TYPES: TestType[] = [
  'functional',
  'negative',
  'boundary',
  'security',
  'edge',
];

const PRIORITIES: AICoverageSuggestionPriority[] = [
  'low',
  'medium',
  'high',
];

interface RawSuggestion {
  title?: unknown;
  description?: unknown;
  type?: unknown;
  acceptanceCriteriaIndexes?: unknown;
  reason?: unknown;
  priority?: unknown;
  assumption?: unknown;
}

interface RawAnalysis {
  summary?: unknown;
  suggestions?: unknown;
}

function normalizeText(value: unknown, maxLength: number): string {
  return typeof value === 'string'
    ? value.trim().slice(0, maxLength)
    : '';
}

function normalizeSuggestion(
  raw: RawSuggestion,
  requirement: Requirement,
): AICoverageSuggestion | null {
  const title = normalizeText(raw.title, 180);
  const description = normalizeText(raw.description, 1200);
  const reason = normalizeText(raw.reason, 900);

  if (
    !title ||
    !description ||
    !reason ||
    !TEST_TYPES.includes(raw.type as TestType) ||
    !PRIORITIES.includes(
      raw.priority as AICoverageSuggestionPriority,
    ) ||
    !Array.isArray(raw.acceptanceCriteriaIndexes)
  ) {
    return null;
  }

  const acceptanceCriteriaIndexes = [
    ...new Set(
      raw.acceptanceCriteriaIndexes
        .filter(
          (index): index is number =>
            Number.isInteger(index) &&
            index >= 0 &&
            index < requirement.acceptanceCriteria.length,
        )
        .map((index) => Number(index)),
    ),
  ].sort((a, b) => a - b);

  if (acceptanceCriteriaIndexes.length === 0) {
    return null;
  }

  const assumptionText = normalizeText(raw.assumption, 500);

  return {
    title,
    description,
    type: raw.type as TestType,
    acceptanceCriteriaIndexes,
    reason,
    priority:
      raw.priority as AICoverageSuggestionPriority,
    assumption: assumptionText || null,
  };
}

function dedupeSuggestions(
  suggestions: AICoverageSuggestion[],
  existingTests: TestCase[],
): AICoverageSuggestion[] {
  const existingTitles = new Set(
    existingTests.map((testCase) =>
      testCase.title.trim().toLowerCase(),
    ),
  );

  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = suggestion.title.trim().toLowerCase();

    if (existingTitles.has(key) || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function analyzeCoverageGapsWithAI(
  requirement: Requirement,
  existingTests: TestCase[],
  evaluation: RequirementCoverageEvaluation,
): Promise<AICoverageAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const uncoveredCriteria = evaluation.uncoveredCriteriaIndexes.map(
    (criterionIndex) => ({
      criterionIndex,
      criterion:
        requirement.acceptanceCriteria[criterionIndex] ?? '',
    }),
  );

  const existingEvidence = existingTests
    .map((testCase) => {
      const refs = testCase.acceptanceCriteriaRefs
        .filter(
          (ref) =>
            ref.requirementId === requirement.id,
        )
        .map((ref) => `AC[${ref.criterionIndex}]`)
        .join(', ');

      return [
        testCase.id,
        testCase.type,
        testCase.title,
        refs || 'no acceptance-criteria refs',
      ].join(' | ');
    })
    .join('\n');

  const prompt = `
You are Spec2Ship's AI coverage analyst.

The deterministic Spec2Ship coverage engine has already calculated
requirement coverage. Its result is authoritative. Do NOT change,
reinterpret, or override the supplied coverage status.

Your job is to identify meaningful TEST SCENARIOS that are not already
represented by the existing tests.

Rules:
- Do not duplicate an existing test.
- Do not claim that an acceptance criterion is uncovered unless it appears
  in DETERMINISTIC UNCOVERED CRITERIA below.
- Every suggestion must map to at least one supplied acceptance criterion
  using the exact zero-based criterion indexes.
- Do not invent product behavior beyond the requirement.
- If a suggestion depends on an assumption, state that assumption.
- Prefer useful negative, boundary, security, error-handling, validation,
  and edge scenarios when they are justified by the requirement.
- If deterministic coverage is partial or none, prioritize suggestions that
  close the listed uncovered acceptance criteria.
- If deterministic coverage is full, suggestions are optional and should
  only identify meaningful additional confidence scenarios.
- Return at most 10 suggestions.

Return ONLY valid JSON using this exact structure:
{
  "summary": "string",
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "type": "functional | negative | boundary | security | edge",
      "acceptanceCriteriaIndexes": [0],
      "reason": "string",
      "priority": "low | medium | high",
      "assumption": "string or empty string"
    }
  ]
}

REQUIREMENT ID:
${requirement.id}

TITLE:
${requirement.title}

DESCRIPTION:
${requirement.description}

DETERMINISTIC COVERAGE STATUS:
${evaluation.status}

DETERMINISTIC CRITERIA COVERAGE:
${evaluation.coveredCriteriaCount}/${evaluation.totalCriteria}

ACCEPTANCE CRITERIA:
${requirement.acceptanceCriteria
  .map((criterion, index) => `AC[${index}] ${criterion}`)
  .join('\n')}

DETERMINISTIC UNCOVERED CRITERIA:
${uncoveredCriteria.length > 0
  ? uncoveredCriteria
      .map(
        (item) =>
          `AC[${item.criterionIndex}] ${item.criterion}`,
      )
      .join('\n')
  : 'None. All acceptance criteria have deterministic test coverage.'}

EXISTING TESTS:
${existingEvidence || 'No existing tests are linked to this requirement.'}
`;

  const models = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
  ];

  let lastError: unknown;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (!response.text) {
          throw new Error('AI returned an empty response.');
        }

        let raw: RawAnalysis;

        try {
          raw = JSON.parse(response.text) as RawAnalysis;
        } catch {
          throw new Error(
            'AI returned an invalid JSON response.',
          );
        }

        const rawSuggestions = Array.isArray(raw.suggestions)
          ? raw.suggestions
          : [];

        const suggestions = dedupeSuggestions(
          rawSuggestions
            .map((item) =>
              normalizeSuggestion(
                item as RawSuggestion,
                requirement,
              ),
            )
            .filter(
              (
                item,
              ): item is AICoverageSuggestion =>
                item !== null,
            )
            .slice(0, 10),
          existingTests,
        );

        return {
          requirementId: requirement.id,
          coverageStatus: evaluation.status,
          totalCriteria: evaluation.totalCriteria,
          coveredCriteriaCount:
            evaluation.coveredCriteriaCount,
          uncoveredCriteria,
          summary:
            normalizeText(raw.summary, 1400) ||
            'AI coverage review completed.',
          suggestions,
        };
      } catch (error: any) {
        lastError = error;

        const isTemporaryError =
          error?.status === 503 ||
          error?.status === 429;

        if (!isTemporaryError) {
          throw error;
        }

        if (attempt < 2) {
          const delay =
            1000 * Math.pow(2, attempt - 1);

          await new Promise((resolve) =>
            setTimeout(resolve, delay),
          );
        }
      }
    }
  }

  throw (
    lastError ??
    new Error(
      'All configured Gemini models were unavailable.',
    )
  );
}
