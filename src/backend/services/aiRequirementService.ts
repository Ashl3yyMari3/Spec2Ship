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

let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    break;
  } catch (error: any) {
    const isTemporaryError =
      error?.status === 503 || error?.status === 429;

    if (!isTemporaryError || attempt === 3) {
      throw error;
    }

    const delay = 1000 * Math.pow(2, attempt - 1);

    console.log(
      `[spec2ship-ai] Gemini unavailable. Retrying in ${delay}ms...`,
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

if (!response) {
  throw new Error('AI analysis failed after multiple attempts.');
}

  const text = response.text;

  if (!text) {
    throw new Error('AI returned an empty response.');
  }

  try {
    return JSON.parse(text) as AIRequirementAnalysis;
  } catch {
    throw new Error('AI returned an invalid JSON response.');
  }
}