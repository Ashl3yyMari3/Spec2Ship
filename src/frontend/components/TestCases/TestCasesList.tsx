import React from 'react';
import type { TestCase, TestStatus, TestOrigin, AcceptanceCriteriaRef } from '@backend/types/models';

interface Props {
  tests: TestCase[];
}

function statusClass(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass:    'badge--pass',
    fail:    'badge--fail',
    not_run: 'badge--not-run',
    blocked: 'badge--blocked',
  };
  return `badge ${map[s]}`;
}

function statusLabel(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass:    'Pass',
    fail:    'Fail',
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
          {/* ID pill */}
          <p
            style={{
              display: 'inline-block',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--violet-light)',
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: 8,
              padding: '2px 8px',
              marginBottom: 6,
              letterSpacing: '0.06em',
            }}
          >
            {tc.id}
          </p>

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
              {tc.automated ? 'Automated' : 'Manual'}
            </span>
          </div>

          <dl style={{ fontSize: '13px', display: 'grid', gap: '8px' }}>
            {tc.requirementIds.length > 0 && (
              <div>
                <dt
                  style={{
                    fontWeight: 700,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Linked Requirements
                </dt>
                <dd style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tc.requirementIds.map((id) => (
                    <span
                      key={id}
                      className="badge badge--type"
                      style={{ fontFamily: 'monospace', color: 'var(--violet-light)' }}
                    >
                      {id}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {tc.acceptanceCriteriaRefs.length > 0 && (
              <div>
                <dt
                  style={{
                    fontWeight: 700,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  Acceptance Criteria References
                </dt>
                <dd style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {tc.acceptanceCriteriaRefs.map((ref, i) => (
                    <span
                      key={i}
                      className="badge badge--type"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {formatAcRef(ref)}
                    </span>
                  ))}
                </dd>
              </div>
            )}

            {tc.notes && (
              <div>
                <dt
                  style={{
                    fontWeight: 700,
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Notes
                </dt>
                <dd style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
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
