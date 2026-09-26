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
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--text-muted)',
  marginBottom: '4px',
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'var(--text-secondary)',
  lineHeight: 1.6,
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
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass-bright)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card), var(--shadow-violet)',
        marginTop: '20px',
        overflow: 'hidden',
      }}
    >
      {/* Detail header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(139, 92, 246, 0.07)',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--violet-light)',
              background: 'rgba(139,92,246,0.14)',
              border: '1px solid rgba(139,92,246,0.28)',
              borderRadius: 8,
              padding: '2px 8px',
              letterSpacing: '0.06em',
              display: 'inline-block',
              marginBottom: '6px',
            }}
          >
            {req.id}
          </span>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text-primary)',
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
          className="btn"
          style={{ flexShrink: 0 }}
        >
          Close
        </button>
      </div>

      {/* Detail body */}
      <div style={{ padding: '20px 22px' }}>
        {/* Requirement meta */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
            padding: '16px',
            background: 'rgba(139, 92, 246, 0.05)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
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
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Unchanged</span>
              )}
            </dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Source File</dt>
            <dd
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--text-muted)',
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
            <p style={fieldLabelStyle}>Description</p>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {req.description}
            </p>
          </div>
        )}

        {/* Acceptance Criteria Coverage */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(139, 92, 246, 0.05)',
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
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(139, 92, 246, 0.05)',
          }}
        >
          <LinkedTests requirementId={req.id} matrix={matrix} />
        </div>
      </div>
    </section>
  );
}
