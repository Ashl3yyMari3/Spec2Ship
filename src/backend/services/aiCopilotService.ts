import { GoogleGenAI } from '@google/genai';
import type {
  Requirement,
  TestCase,
  TraceabilityLink,
  CoverageGapReport,
  RiskScore,
  ReleaseReadinessReport,
  ImpactReport,
} from '../types/models.js';

export interface CopilotChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Spec2ShipCopilotContext {
  requirements: Requirement[];
  testCases: TestCase[];
  traceabilityLinks: TraceabilityLink[];
  coverage: CoverageGapReport;
  riskScores: RiskScore[];
  releaseReadiness: ReleaseReadinessReport;
  impactReports: ImpactReport[];
}

function buildConversation(history: CopilotChatMessage[]): string {
  if (history.length === 0) return 'No previous conversation.';

  return history
    .slice(-8)
    .map((item) => `${item.role.toUpperCase()}: ${item.content}`)
    .join('\n\n');
}

export async function askSpec2ShipCopilot(
  message: string,
  history: CopilotChatMessage[],
  context: Spec2ShipCopilotContext,
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const evidence = JSON.stringify(context, null, 2);

  const prompt = `
You are Spec2Ship AI, a QA release-intelligence copilot.

Your job is to help QA engineers understand the CURRENT Spec2Ship project using only the supplied project evidence.

Important rules:
- Treat deterministic Spec2Ship calculations as the source of truth.
- Never recalculate or override the supplied risk scores or release verdict.
- Never invent requirements, tests, statuses, coverage, or change-impact relationships.
- If the evidence does not answer a question, say what information is missing.
- Clearly distinguish a factual observation from a recommendation.
- When recommending tests, label them as suggestions rather than existing project tests.
- Keep answers concise, practical, and QA-focused.
- When relevant, cite requirement IDs and test case IDs from the evidence.
- If asked whether the release is ready, use releaseReadiness.overallVerdict and explain its supplied reasons.

PROJECT EVIDENCE:
${evidence}

RECENT CONVERSATION:
${buildConversation(history)}

USER QUESTION:
${message}

Answer as Spec2Ship AI.
`;

  let response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      break;
    } catch (error: any) {
      const isTemporaryError =
        error?.status === 503 || error?.status === 429;

      if (!isTemporaryError || attempt === 3) {
        throw error;
      }

      const delay = 1000 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  const text = response?.text?.trim();

  if (!text) {
    throw new Error('AI returned an empty response.');
  }

  return text;
}
