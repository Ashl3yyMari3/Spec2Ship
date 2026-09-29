import React, { useState } from 'react';
import type { Requirement } from '@backend/types/models';

interface Props {
  requirement: Requirement;
}

interface SuggestedTest {
  title: string;
  type: 'functional' | 'negative' | 'boundary' | 'security' | 'edge';
  description: string;
}

interface AIAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  ambiguities: string[];
  missingCoverage: string[];
  suggestedTests: SuggestedTest[];
  impactAreas: string[];
}

export default function AIRequirementAnalysis({
  requirement,
}: Props): React.ReactElement {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-requirement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requirement: `${requirement.title}\n${requirement.description}`,
          acceptanceCriteria: requirement.acceptanceCriteria,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `AI analysis failed with status ${response.status}.`,
        );
      }

      const result = (await response.json()) as AIAnalysis;
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'AI requirement analysis failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ai-analysis">
      <button
        type="button"
        className="ai-analysis__button"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? 'Analyzing…' : '✦ Analyze with AI'}
      </button>

      {error && (
        <div className="ai-analysis__error" role="alert">
          {error}
        </div>
      )}

      {analysis && (
        <section
          className="ai-analysis__results"
          aria-label={`AI analysis for ${requirement.id}`}
        >
          <div className="ai-analysis__header">
            <div>
              <p className="ai-analysis__eyebrow">
                AI Requirement Analysis
              </p>

              <h3 className="ai-analysis__title">
                QA Intelligence
              </h3>
            </div>

            <span
              className={`badge badge--${analysis.riskLevel}`}
            >
              {analysis.riskLevel.toUpperCase()} RISK
            </span>
          </div>

          <p className="ai-analysis__summary">
            {analysis.summary}
          </p>

          <div className="ai-analysis__grid">
            <AnalysisList
              title="Ambiguities"
              items={analysis.ambiguities}
            />

            <AnalysisList
              title="Missing Coverage"
              items={analysis.missingCoverage}
            />

            <AnalysisList
              title="Impact Areas"
              items={analysis.impactAreas}
            />
          </div>

          <div className="ai-analysis__tests">
            <h4>Suggested Tests</h4>

            {analysis.suggestedTests.length === 0 ? (
              <p>No additional tests suggested.</p>
            ) : (
              analysis.suggestedTests.map((test, index) => (
                <article
                  className="ai-analysis__test"
                  key={`${test.title}-${index}`}
                >
                  <div className="ai-analysis__test-header">
                    <strong>{test.title}</strong>

                    <span className="badge badge--type">
                      {test.type}
                    </span>
                  </div>

                  <p>{test.description}</p>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

interface AnalysisListProps {
  title: string;
  items: string[];
}

function AnalysisList({
  title,
  items,
}: AnalysisListProps): React.ReactElement {
  return (
    <div className="ai-analysis__section">
      <h4>{title}</h4>

      {items.length === 0 ? (
        <p>None identified.</p>
      ) : (
        <ul>
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}