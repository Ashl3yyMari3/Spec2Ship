import React, { useEffect, useMemo, useState } from 'react';
import type { Requirement, TestType } from '@backend/types/models';

interface AISuggestedTest {
  id: string;
  title: string;
  description: string;
  type: TestType;
  requirementId: string;
  status: 'not_run';
  automated: false;
  coverageType: 'partial';
}

interface AIResponse {
  requirementId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  suggestions: AISuggestedTest[];
}

interface Props {
  projectId: string;
  requirement: Requirement;
  disabled?: boolean;
  onSaved: () => Promise<void> | void;
}

export default function AIProjectTestGenerator({
  projectId,
  requirement,
  disabled = false,
  onSaved,
}: Props): React.ReactElement {
  const [result, setResult] = useState<AIResponse | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStage, setLoadingStage] = useState(0);

  const loadingMessages = [
    'Analyzing the requirement and acceptance criteria…',
    'Looking for negative, boundary, security, and edge cases…',
    'Drafting test scenarios for your review…',
  ];

  useEffect(() => {
    if (!generating) {
      setLoadingStage(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStage((current) =>
        (current + 1) % loadingMessages.length,
      );
    }, 2200);

    return () => window.clearInterval(timer);
  }, [generating]);

  const selectedTests = useMemo(
    () =>
      result?.suggestions.filter((test) => selected.has(test.id)) ?? [],
    [result, selected],
  );

  async function generate(): Promise<void> {
    if (generating || disabled) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(
          projectId,
        )}/requirements/${encodeURIComponent(
          requirement.id,
        )}/ai-tests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const payload = (await response.json()) as
        | AIResponse
        | { error?: string };

      if (!response.ok || !('suggestions' in payload)) {
        throw new Error(
          'error' in payload && payload.error
            ? payload.error
            : 'Could not generate test suggestions.',
        );
      }

      setResult(payload);
      setSelected(new Set(payload.suggestions.map((test) => test.id)));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not generate test suggestions.',
      );
    } finally {
      setGenerating(false);
    }
  }

  function toggle(testId: string): void {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }

      return next;
    });
  }

  async function saveSelected(): Promise<void> {
    if (saving || selectedTests.length === 0) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/tests/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tests: selectedTests.map((test) => ({
              ...test,
              notes:
                'AI-generated suggestion reviewed and accepted in Project Setup.',
            })),
          }),
        },
      );

      const payload = (await response.json()) as {
        error?: string;
        addedCount?: number;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? 'Could not save selected test cases.',
        );
      }

      setResult(null);
      setSelected(new Set());
      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save selected test cases.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="project-ai-tests">
      <button
        type="button"
        className="project-ai-tests__generate"
        onClick={() => void generate()}
        disabled={generating || disabled}
      >
        {generating ? '✦ Spec2Ship AI is working…' : '✦ Generate Tests with AI'}
      </button>

      {generating && (
        <div
          className="project-ai-tests__loading"
          role="status"
          aria-live="polite"
        >
          <span
            className="project-ai-tests__loading-orb"
            aria-hidden="true"
          />
          <div>
            <strong>{loadingMessages[loadingStage]}</strong>
            <span>
              Suggestions will appear here for you to review before anything
              is added to the project.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="project-ai-tests__error" role="alert">
          {error}
        </div>
      )}

      {result && (
        <section className="project-ai-tests__review">
          <div className="project-ai-tests__review-header">
            <div>
              <p>AI Test Review</p>
              <strong>
                {result.suggestions.length} suggestion
                {result.suggestions.length === 1 ? '' : 's'}
              </strong>
            </div>

            <span
              className={`project-ai-tests__risk project-ai-tests__risk--${result.riskLevel}`}
            >
              {result.riskLevel} risk
            </span>
          </div>

          <p className="project-ai-tests__summary">{result.summary}</p>

          {result.suggestions.length === 0 ? (
            <div className="project-ai-tests__empty">
              No new AI test suggestions were returned for this requirement.
            </div>
          ) : (
            <>
              <div className="project-ai-tests__list">
                {result.suggestions.map((test) => (
                  <label
                    className="project-ai-tests__item"
                    key={test.id}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(test.id)}
                      onChange={() => toggle(test.id)}
                    />

                    <span className="project-ai-tests__item-copy">
                      <span className="project-ai-tests__item-top">
                        <strong>{test.title}</strong>
                        <em>{test.type}</em>
                      </span>

                      <span>{test.description}</span>
                      <small>{test.id} · auto-assigned unique ID</small>
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                className="project-ai-tests__save"
                onClick={() => void saveSelected()}
                disabled={saving || selectedTests.length === 0}
              >
                {saving
                  ? 'Adding Tests…'
                  : `Add Selected Tests (${selectedTests.length})`}
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
