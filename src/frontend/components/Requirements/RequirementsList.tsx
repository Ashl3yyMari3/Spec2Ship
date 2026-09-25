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
          <p className="card__id">{req.id}</p>

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
            <div>
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
