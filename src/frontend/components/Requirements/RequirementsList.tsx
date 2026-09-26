import React from 'react';
import type { Requirement, Criticality } from '@backend/types/models';

interface Props {
  requirements: Requirement[];
}

function criticalityClass(c: Criticality): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: Criticality): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default function RequirementsList({ requirements }: Props): React.ReactElement {
  if (requirements.length === 0) {
    return (
      <p className="state-message" role="status">
        No requirements loaded.
      </p>
    );
  }

  return (
    <section aria-label="Requirements list">
      {requirements.map((req) => (
        <article key={req.id} className="card" aria-labelledby={`req-title-${req.id}`}>
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
            {req.id}
          </p>

          <h2 className="card__title" id={`req-title-${req.id}`}>
            {req.title}
          </h2>

          <p className="card__description">{req.description}</p>

          <div className="card__meta">
            <span className={criticalityClass(req.criticality)}>
              {criticalityLabel(req.criticality)}
            </span>
            <span className="badge badge--type">
              Domain: {req.domain}
            </span>
            <span className="badge badge--type">
              {req.acceptanceCriteria.length} acceptance{' '}
              {req.acceptanceCriteria.length === 1 ? 'criterion' : 'criteria'}
            </span>
            {req.changed && (
              <span className="badge badge--high">Changed</span>
            )}
          </div>

          {req.acceptanceCriteria.length > 0 && (
            <div
              style={{
                background: 'rgba(139,92,246,0.06)',
                border: '1px solid rgba(139,92,246,0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginTop: 4,
              }}
            >
              <p className="ac-section__heading">Acceptance Criteria</p>
              <ol className="ac-list" aria-label={`Acceptance criteria for ${req.id}`}>
                {req.acceptanceCriteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ol>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
