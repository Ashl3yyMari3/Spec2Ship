import React from 'react';
import type { Requirement, TraceabilityMatrix, Criticality } from '@backend/types/models';
import AcceptanceCriteriaCoverage from './AcceptanceCriteriaCoverage';
import LinkedTests from './LinkedTests';

interface Props {
  requirement: Requirement;
  matrix: TraceabilityMatrix;
  onClose: () => void;
}

function criticalityClass(c: Criticality): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: Criticality): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-muted)',
  marginBottom: '2px',
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'var(--color-text)',
  lineHeight: 1.55,
};

export default function RequirementTraceabilityDetail({
  requirement: req,
  matrix,
  onClose,
}: Props): React.ReactElement {
  return (
    <section
      aria-label={`Traceability detail for ${req.id}`}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        background: 'var(--color-bg)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '20px',
      }}
    >
      {/* Detail header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-accent)',
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            {req.id}
          </span>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {req.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label={`Close detail panel for ${req.id}`}
          style={{
            fontSize: '13px',
            padding: '5px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Close
        </button>
      </div>

      {/* Detail body */}
      <div style={{ padding: '20px' }}>
        {/* Requirement meta */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div>
            <dt style={fieldLabelStyle}>Criticality</dt>
            <dd>
              <span className={criticalityClass(req.criticality)}>
                {criticalityLabel(req.criticality)}
              </span>
            </dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Domain</dt>
            <dd style={fieldValueStyle}>{req.domain}</dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Changed</dt>
            <dd>
              {req.changed ? (
                <span className="badge badge--high">Changed</span>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Unchanged</span>
              )}
            </dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Source File</dt>
            <dd
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--color-muted)',
                wordBreak: 'break-all',
              }}
            >
              {req.sourceFile}
            </dd>
          </div>
          {req.tags.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <dt style={fieldLabelStyle}>Tags</dt>
              <dd style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                {req.tags.map((tag) => (
                  <span key={tag} className="badge badge--type">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </div>

        {/* Description */}
        {req.description && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...fieldLabelStyle, fontSize: '11px' }}>Description</p>
            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {req.description}
            </p>
          </div>
        )}

        {/* Acceptance Criteria Coverage */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-surface)',
          }}
        >
          <AcceptanceCriteriaCoverage
            requirement={req}
            testCases={matrix.testCases}
          />
        </div>

        {/* Linked Test Cases */}
        <div
          style={{
            padding: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-surface)',
          }}
        >
          <LinkedTests requirementId={req.id} matrix={matrix} />
        </div>
      </div>
    </section>
  );
}
