import React from 'react';
import type { ReleaseVerdict } from '@backend/types/models';

interface Props {
  verdict: ReleaseVerdict;
  rationale: string;
}

function verdictStyle(verdict: ReleaseVerdict): React.CSSProperties {
  switch (verdict) {
    case 'Not Ready':
      return {
        background: 'var(--color-critical-bg)',
        borderColor: 'var(--color-critical-border)',
        color: 'var(--color-critical-text)',
      };
    case 'Review Required':
      return {
        background: 'var(--color-medium-bg)',
        borderColor: 'var(--color-medium-border)',
        color: 'var(--color-medium-text)',
      };
    case 'Ready':
      return {
        background: 'var(--color-low-bg)',
        borderColor: 'var(--color-low-border)',
        color: 'var(--color-low-text)',
      };
    default:
      return {};
  }
}

function verdictLabel(verdict: ReleaseVerdict): string {
  return verdict;
}

export default function VerdictBanner({ verdict, rationale }: Props): React.ReactElement {
  const style = verdictStyle(verdict);
  const role = verdict === 'Not Ready' ? 'alert' : 'status';

  return (
    <div
      role={role}
      aria-label={`Release verdict: ${verdictLabel(verdict)}`}
      style={{
        border: '2px solid',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginBottom: 24,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
          }}
          aria-label={`Verdict: ${verdictLabel(verdict)}`}
        >
          {verdictLabel(verdict)}
        </span>
        <span
          style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '2px 10px',
            borderRadius: 12,
            border: '1px solid currentColor',
            opacity: 0.75,
          }}
          aria-hidden="true"
        >
          Overall Verdict
        </span>
      </div>
      <p
        style={{
          marginTop: 8,
          fontSize: 14,
          lineHeight: 1.55,
          color: 'inherit',
          opacity: 0.9,
        }}
      >
        {rationale}
      </p>
    </div>
  );
}
