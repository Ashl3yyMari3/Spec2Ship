import React from 'react';
import type { TraceabilityMatrix } from '@backend/types/models';

interface Props {
  matrix: TraceabilityMatrix;
}

interface SummaryMetrics {
  totalRequirements: number;
  totalTestCases: number;
  fullyCovered: number;
  partiallyCovered: number;
  noCoverage: number;
}

export function computeSummaryMetrics(matrix: TraceabilityMatrix): SummaryMetrics {
  const totalRequirements = matrix.requirements.length;
  const totalTestCases = matrix.testCases.length;

  let fullyCovered = 0;
  let partiallyCovered = 0;
  let noCoverage = 0;

  for (const req of matrix.requirements) {
    const reqLinks = matrix.links.filter((l) => l.requirementId === req.id);
    if (reqLinks.length === 0) {
      noCoverage++;
    } else if (reqLinks.every((l) => l.coverageType === 'full')) {
      fullyCovered++;
    } else {
      partiallyCovered++;
    }
  }

  return { totalRequirements, totalTestCases, fullyCovered, partiallyCovered, noCoverage };
}

interface MetricCardProps {
  label: string;
  value: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

function MetricCard({ label, value, variant = 'default' }: MetricCardProps): React.ReactElement {
  const variantStyles: Record<string, React.CSSProperties> = {
    default: { borderTopColor: 'var(--color-accent)' },
    success: { borderTopColor: '#22c55e' },
    warning: { borderTopColor: 'var(--color-high-border)' },
    danger: { borderTopColor: 'var(--color-critical-border)' },
  };

  return (
    <div
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderTop: '3px solid',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        flex: '1 1 160px',
        minWidth: 0,
        boxShadow: 'var(--shadow-sm)',
        ...variantStyles[variant],
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '4px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

export default function TraceabilitySummary({ matrix }: Props): React.ReactElement {
  const metrics = computeSummaryMetrics(matrix);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
      <MetricCard label="Total Requirements" value={metrics.totalRequirements} variant="default" />
      <MetricCard label="Total Test Cases" value={metrics.totalTestCases} variant="default" />
      <MetricCard label="Fully Covered" value={metrics.fullyCovered} variant="success" />
      <MetricCard label="Partially Covered" value={metrics.partiallyCovered} variant="warning" />
      <MetricCard label="No Coverage" value={metrics.noCoverage} variant="danger" />
    </div>
  );
}
