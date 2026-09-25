import React from 'react';
import type { TestCase, TestStatus, TestOrigin, AcceptanceCriteriaRef } from '@backend/types/models';

interface Props {
  tests: TestCase[];
}

function statusClass(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass: 'badge--pass',
    fail: 'badge--fail',
    not_run: 'badge--not-run',
    blocked: 'badge--blocked',
  };
  return `badge ${map[s]}`;
}

function statusLabel(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass: 'Pass',
    fail: 'Fail',
    not_run: 'Not Run',
    blocked: 'Blocked',
  };
  return map[s];
}

function originClass(o: TestOrigin): string {
  return `badge badge--origin-${o}`;
}

function originLabel(o: TestOrigin): string {
  return o === 'seeded' ? 'Seeded' : 'Suggested';
}

function formatAcRef(ref: AcceptanceCriteriaRef): string {
  // criterionIndex is 0-based internally; display as 1-based
  return `${ref.requirementId} · AC ${ref.criterionIndex + 1}`;
}

export default function TestCasesList({ tests }: Props): React.ReactElement {
  if (tests.length === 0) {
    return (
      <p className="state-message" role="status">
        No test cases available.
      </p>
    );
  }

  return (
    <section aria-label="Test cases list">
      {tests.map((tc) => (
        <article key={tc.id} className="card" aria-labelledby={`tc-title-${tc.id}`}>
          <p className="card__id">{tc.id}</p>

          <h2 className="card__title" id={`tc-title-${tc.id}`}>
            {tc.title}
          </h2>

          <p className="card__description">{tc.description}</p>

          <div className="card__meta">
            <span className={statusClass(tc.status)}>
              {statusLabel(tc.status)}
            </span>
            <span className={originClass(tc.origin)}>
              {originLabel(tc.origin)}
            </span>
            <span className="badge badge--type">
              {tc.type.charAt(0).toUpperCase() + tc.type.slice(1)}
            </span>
            <span className="badge badge--type">
              Automated: {tc.automated ? 'Yes' : 'No'}
            </span>
          </div>

          <dl style={{ fontSize: '13px', display: 'grid', gap: '6px' }}>
            {tc.requirementIds.length > 0 && (
              <div>
                <dt
                  style={{
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Linked Requirements
                </dt>
                <dd>
                  {tc.requirementIds.map((id) => (
                    <span
                      key={id}
                      className="badge badge--type"
                      style={{ marginRight: '6px', fontFamily: 'monospace' }}
                    >
                      {id}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {tc.acceptanceCriteriaRefs.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                <dt
                  style={{
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Acceptance Criteria References
                </dt>
                <dd>
                  {tc.acceptanceCriteriaRefs.map((ref, i) => (
                    <span
                      key={i}
                      className="badge badge--type"
                      style={{ marginRight: '6px', fontFamily: 'monospace' }}
                    >
                      {formatAcRef(ref)}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {tc.notes && (
              <div style={{ marginTop: '4px' }}>
                <dt
                  style={{
                    fontWeight: 600,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: 'var(--color-muted)',
                    marginBottom: '2px',
                  }}
                >
                  Notes
                </dt>
                <dd style={{ color: 'var(--color-muted)', fontSize: '13px' }}>
                  {tc.notes}
                </dd>
              </div>
            )}
          </dl>
        </article>
      ))}
    </section>
  );
}
