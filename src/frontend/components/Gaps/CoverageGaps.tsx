import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AICoverageAnalysis,
  AICoverageSuggestion,
  CoverageGapReport,
  CoverageStatus,
  Requirement,
  RequirementCoverageEvaluation,
} from '@backend/types/models';
import { useProject } from '../../context/ProjectContext';
import '../../styles/coverage-gaps.css';

interface Props {
  report: CoverageGapReport;
  requirements: Requirement[];
}

interface AnalysisState {
  analysis: AICoverageAnalysis | null;
  selected: Set<number>;
  analyzing: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
}

function statusLabel(status: CoverageStatus): string {
  switch (status) {
    case 'full':
      return 'Full Coverage';
    case 'partial':
      return 'Partial Coverage';
    case 'none':
      return 'No Coverage';
    default:
      return status;
  }
}

function criticalityLabel(value: string): string {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function RequirementCoverageCard({
  requirement,
  evaluation,
  readOnly,
  projectApiUrl,
  onCoverageChanged,
}: {
  requirement: Requirement;
  evaluation: RequirementCoverageEvaluation;
  readOnly: boolean;
  projectApiUrl: (url: string) => string;
  onCoverageChanged: () => Promise<void>;
}): React.ReactElement {
  const [state, setState] =
    useState<AnalysisState>({
      analysis: null,
      selected: new Set(),
      analyzing: false,
      saving: false,
      error: null,
      success: null,
    });

  const covered = useMemo(
    () =>
      new Set(
        evaluation.coveredCriteriaIndexes,
      ),
    [evaluation.coveredCriteriaIndexes],
  );

  useEffect(() => {
    setState((current) => ({
      ...current,
      analysis: null,
      selected: new Set(),
      error: null,
    }));
  }, [
    requirement.id,
    evaluation.status,
    evaluation.coveredCriteriaCount,
  ]);

  async function analyze(): Promise<void> {
    if (state.analyzing) return;

    setState((current) => ({
      ...current,
      analyzing: true,
      error: null,
      success: null,
    }));

    try {
      const response = await fetch(
        projectApiUrl(
          `/api/coverage-gaps/${encodeURIComponent(
            requirement.id,
          )}/analyze`,
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const payload = (await response.json()) as
        | AICoverageAnalysis
        | { error?: string };

      if (
        !response.ok ||
        !('suggestions' in payload)
      ) {
        throw new Error(
          'error' in payload && payload.error
            ? payload.error
            : 'Could not analyze coverage gaps.',
        );
      }

      setState((current) => ({
        ...current,
        analysis: payload,
        selected: new Set(
          payload.suggestions.map(
            (_suggestion, index) => index,
          ),
        ),
        analyzing: false,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        analyzing: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not analyze coverage gaps.',
      }));
    }
  }

  function toggleSuggestion(index: number): void {
    setState((current) => {
      const selected = new Set(current.selected);

      if (selected.has(index)) {
        selected.delete(index);
      } else {
        selected.add(index);
      }

      return {
        ...current,
        selected,
      };
    });
  }

  async function addSelected(): Promise<void> {
    if (
      !state.analysis ||
      state.saving ||
      state.selected.size === 0 ||
      readOnly
    ) {
      return;
    }

    const suggestions =
      state.analysis.suggestions.filter(
        (_suggestion, index) =>
          state.selected.has(index),
      );

    setState((current) => ({
      ...current,
      saving: true,
      error: null,
      success: null,
    }));

    try {
      const response = await fetch(
        projectApiUrl(
          `/api/coverage-gaps/${encodeURIComponent(
            requirement.id,
          )}/accept-suggestions`,
        ),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ suggestions }),
        },
      );

      const payload = (await response.json()) as {
        error?: string;
        addedCount?: number;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ??
            'Could not add selected tests.',
        );
      }

      await onCoverageChanged();

      setState((current) => ({
        ...current,
        analysis: null,
        selected: new Set(),
        saving: false,
        success: `${payload.addedCount ?? suggestions.length} test suggestion${(payload.addedCount ?? suggestions.length) === 1 ? '' : 's'} added. Coverage was recalculated.`,
      }));
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not add selected tests.',
      }));
    }
  }

  const aiButtonLabel =
    evaluation.status === 'full'
      ? '✦ AI Coverage Review'
      : '✦ Analyze Gaps with AI';

  return (
    <article
      className={`coverage-card coverage-card--${evaluation.status}`}
    >
      <div className="coverage-card__header">
        <div className="coverage-card__identity">
          <div className="coverage-card__meta">
            <code>{requirement.id}</code>
            <span
              className={`coverage-status coverage-status--${evaluation.status}`}
            >
              {statusLabel(evaluation.status)}
            </span>
            <span
              className={`badge badge--${requirement.criticality}`}
            >
              {criticalityLabel(
                requirement.criticality,
              )}
            </span>
          </div>

          <h2>{requirement.title}</h2>
          <p>{requirement.description}</p>
        </div>

        <div
          className="coverage-card__score"
          aria-label={`${evaluation.coveredCriteriaCount} of ${evaluation.totalCriteria} acceptance criteria covered`}
        >
          <strong>
            {evaluation.coveredCriteriaCount}/
            {evaluation.totalCriteria}
          </strong>
          <span>criteria covered</span>
        </div>
      </div>

      <div className="coverage-card__bar">
        <span
          style={{
            width:
              evaluation.totalCriteria === 0
                ? '0%'
                : `${Math.round(
                    (evaluation.coveredCriteriaCount /
                      evaluation.totalCriteria) *
                      100,
                  )}%`,
          }}
        />
      </div>

      {evaluation.status !== 'full' && (
        <div className="coverage-card__gap-callout">
          <strong>
            {evaluation.uncoveredCriteriaIndexes.length}{' '}
            acceptance criterion
            {evaluation.uncoveredCriteriaIndexes.length ===
            1
              ? ''
              : 's'}{' '}
            still need test coverage.
          </strong>
          <span>
            Spec2Ship calculated this from the
            requirement-to-test acceptance-criteria
            mappings.
          </span>
        </div>
      )}

      <details className="coverage-card__criteria">
        <summary>
          Acceptance criteria coverage
        </summary>

        <ol>
          {requirement.acceptanceCriteria.map(
            (criterion, index) => (
              <li
                key={`${requirement.id}-ac-${index}`}
                className={
                  covered.has(index)
                    ? 'is-covered'
                    : 'is-uncovered'
                }
              >
                <span
                  className="coverage-card__criterion-icon"
                  aria-hidden="true"
                >
                  {covered.has(index) ? '✓' : '○'}
                </span>
                <span>
                  <strong>AC {index + 1}</strong>
                  {criterion}
                </span>
              </li>
            ),
          )}
        </ol>
      </details>

      <div className="coverage-card__tests">
        <strong>
          Linked tests ({evaluation.linkedTestIds.length})
        </strong>

        {evaluation.linkedTestIds.length === 0 ? (
          <span>No linked tests yet.</span>
        ) : (
          <div>
            {evaluation.linkedTestIds.map(
              (testId) => (
                <code key={testId}>{testId}</code>
              ),
            )}
          </div>
        )}
      </div>

      <div className="coverage-card__ai">
        <div className="coverage-card__ai-heading">
          <div>
            <p>AI Coverage Analyst</p>
            <span>
              {evaluation.status === 'full'
                ? 'The stated acceptance criteria are covered. AI can still look for meaningful resilience, negative, security, or edge scenarios that are not already represented.'
                : 'AI will use the deterministic uncovered criteria plus the existing linked tests to suggest scenarios that can close the gaps.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => void analyze()}
            disabled={state.analyzing}
          >
            {state.analyzing
              ? 'Analyzing…'
              : aiButtonLabel}
          </button>
        </div>

        {state.analyzing && (
          <div
            className="coverage-ai__loading"
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true" />
            <div>
              <strong>
                Comparing requirement evidence…
              </strong>
              <p>
                Checking existing tests for missing
                scenarios without overriding the
                deterministic coverage score.
              </p>
            </div>
          </div>
        )}

        {state.error && (
          <div
            className="coverage-ai__message coverage-ai__message--error"
            role="alert"
          >
            {state.error}
          </div>
        )}

        {state.success && (
          <div
            className="coverage-ai__message coverage-ai__message--success"
            role="status"
          >
            {state.success}
          </div>
        )}

        {state.analysis && (
          <div className="coverage-ai__review">
            <div className="coverage-ai__summary">
              <strong>AI review</strong>
              <p>{state.analysis.summary}</p>
            </div>

            {state.analysis.uncoveredCriteria.length >
              0 && (
              <div className="coverage-ai__deterministic">
                <strong>
                  Deterministic gaps supplied to AI
                </strong>
                <ul>
                  {state.analysis.uncoveredCriteria.map(
                    (item) => (
                      <li key={item.criterionIndex}>
                        AC {item.criterionIndex + 1}:{' '}
                        {item.criterion}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}

            {state.analysis.suggestions.length ===
            0 ? (
              <div className="coverage-ai__empty">
                AI did not identify a useful new test
                scenario beyond the evidence already in
                this requirement.
              </div>
            ) : (
              <>
                <div className="coverage-ai__suggestions">
                  {state.analysis.suggestions.map(
                    (suggestion, index) => (
                      <SuggestionRow
                        key={`${suggestion.title}-${index}`}
                        suggestion={suggestion}
                        checked={state.selected.has(
                          index,
                        )}
                        onToggle={() =>
                          toggleSuggestion(index)
                        }
                      />
                    ),
                  )}
                </div>

                {readOnly ? (
                  <div className="coverage-ai__message">
                    ShopSphere is the read-only demo.
                    Create or open your own project to
                    add AI suggestions as tests.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="coverage-ai__accept"
                    disabled={
                      state.saving ||
                      state.selected.size === 0
                    }
                    onClick={() =>
                      void addSelected()
                    }
                  >
                    {state.saving
                      ? 'Adding Tests…'
                      : `Add Selected Tests (${state.selected.size})`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function SuggestionRow({
  suggestion,
  checked,
  onToggle,
}: {
  suggestion: AICoverageSuggestion;
  checked: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <label className="coverage-ai__suggestion">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
      />

      <span className="coverage-ai__suggestion-copy">
        <span className="coverage-ai__suggestion-top">
          <strong>{suggestion.title}</strong>
          <span>
            <em>{suggestion.type}</em>
            <em
              className={`coverage-ai__priority coverage-ai__priority--${suggestion.priority}`}
            >
              {suggestion.priority}
            </em>
          </span>
        </span>

        <span>{suggestion.description}</span>

        <small>
          Related to{' '}
          {suggestion.acceptanceCriteriaIndexes
            .map((index) => `AC ${index + 1}`)
            .join(', ')}
        </small>

        <small>
          <strong>Why:</strong>{' '}
          {suggestion.reason}
        </small>

        {suggestion.assumption && (
          <small>
            <strong>Assumption:</strong>{' '}
            {suggestion.assumption}
          </small>
        )}
      </span>
    </label>
  );
}

export default function CoverageGaps({
  report,
  requirements,
}: Props): React.ReactElement {
  const { selectedProjectId, projectApiUrl } =
    useProject();

  const [localReport, setLocalReport] =
    useState(report);
  const [refreshError, setRefreshError] =
    useState<string | null>(null);

  useEffect(() => {
    setLocalReport(report);
  }, [report]);

  const requirementMap = useMemo(
    () =>
      new Map(
        requirements.map((requirement) => [
          requirement.id,
          requirement,
        ]),
      ),
    [requirements],
  );

  const evaluations = useMemo(() => {
    const order: Record<CoverageStatus, number> = {
      none: 0,
      partial: 1,
      full: 2,
    };

    return [...localReport.evaluations].sort(
      (a, b) =>
        order[a.status] - order[b.status] ||
        a.requirementId.localeCompare(
          b.requirementId,
        ),
    );
  }, [localReport.evaluations]);

  async function refreshCoverage(): Promise<void> {
    setRefreshError(null);

    const response = await fetch(
      projectApiUrl('/api/coverage-gaps'),
    );

    if (!response.ok) {
      const payload = (await response.json()) as {
        error?: string;
      };

      const message =
        payload.error ??
        'Coverage changed, but the refreshed report could not be loaded.';

      setRefreshError(message);
      throw new Error(message);
    }

    const payload =
      (await response.json()) as CoverageGapReport;

    setLocalReport(payload);
  }

  return (
    <section
      className="coverage-gaps"
      aria-label="Coverage gap analysis"
    >
      <div className="coverage-summary">
        <SummaryCard
          value={localReport.totalRequirements}
          label="Requirements"
          variant="neutral"
        />
        <SummaryCard
          value={localReport.fullCount}
          label="Full"
          variant="full"
        />
        <SummaryCard
          value={localReport.partialCount}
          label="Partial"
          variant="partial"
        />
        <SummaryCard
          value={localReport.noneCount}
          label="None"
          variant="none"
        />
      </div>

      <div className="coverage-gaps__explainer">
        <strong>
          What Spec2Ship means by coverage
        </strong>
        <p>
          Deterministic coverage answers whether the
          stated acceptance criteria have linked tests.
          Test execution is tracked separately. AI then
          looks for additional meaningful scenarios
          without changing the deterministic coverage
          result.
        </p>
      </div>

      {refreshError && (
        <div
          className="coverage-ai__message coverage-ai__message--error"
          role="alert"
        >
          {refreshError}
        </div>
      )}

      <div className="coverage-gaps__list">
        {evaluations.map((evaluation) => {
          const requirement =
            requirementMap.get(
              evaluation.requirementId,
            );

          if (!requirement) return null;

          return (
            <RequirementCoverageCard
              key={requirement.id}
              requirement={requirement}
              evaluation={evaluation}
              readOnly={
                selectedProjectId ===
                'shopsphere-demo'
              }
              projectApiUrl={projectApiUrl}
              onCoverageChanged={
                refreshCoverage
              }
            />
          );
        })}
      </div>
    </section>
  );
}

function SummaryCard({
  value,
  label,
  variant,
}: {
  value: number;
  label: string;
  variant:
    | 'neutral'
    | 'full'
    | 'partial'
    | 'none';
}): React.ReactElement {
  return (
    <div
      className={`coverage-summary__card coverage-summary__card--${variant}`}
    >
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
