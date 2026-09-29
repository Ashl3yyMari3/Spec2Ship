import { GoogleGenAI } from '@google/genai';

export interface AIRequirementAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  ambiguities: string[];
  missingCoverage: string[];
  suggestedTests: {
    title: string;
    type: 'functional' | 'negative' | 'boundary' | 'security' | 'edge';
    description: string;
  }[];
  impactAreas: string[];
}

export async function analyzeRequirement(
  requirement: string,
  acceptanceCriteria: string[],
): Promise<AIRequirementAnalysis> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const prompt = `
You are an expert software QA analyst.

Analyze the following software requirement and its acceptance criteria.

Identify:
- overall QA risk
- ambiguities or missing information
- missing test coverage
- suggested functional, negative, boundary, security, and edge-case tests
- areas of the application that could be affected

Be conservative about risk.
Do not invent application behavior that is not supported by the requirement.

Return ONLY valid JSON using this exact structure:

{
  "riskLevel": "low | medium | high | critical",
  "summary": "string",
  "ambiguities": ["string"],
  "missingCoverage": ["string"],
  "suggestedTests": [
    {
      "title": "string",
      "type": "functional | negative | boundary | security | edge",
      "description": "string"
    }
  ],
  "impactAreas": ["string"]
}

REQUIREMENT:
${requirement}

ACCEPTANCE CRITERIA:
${acceptanceCriteria
  .map((criterion, index) => `${index + 1}. ${criterion}`)
  .join('\n')}
`;

const models = [
  'gemini-3.8-flash',
  'gemini-3.7-flash',
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

      const text = response.text;

      if (!text) {
        throw new Error('AI returned an empty response.');
      }

      try {
        return JSON.parse(text) as AIRequirementAnalysis;
      } catch {
        throw new Error('AI returned an invalid JSON response.');
      }
    } catch (error: any) {
      lastError = error;

      const isTemporaryError =
        error?.status === 503 || error?.status === 429;

      if (!isTemporaryError) {
        throw error;
      }

      if (attempt < 2) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(
          `[spec2ship-ai] ${model} unavailable. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}

throw lastError ?? new Error('All configured Gemini models were unavailable.');
}