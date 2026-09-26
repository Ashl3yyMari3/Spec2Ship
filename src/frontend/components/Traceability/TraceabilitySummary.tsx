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
  const variantMap: Record<string, { border: string; shadow: string; color: string }> = {
    default: { border: 'var(--border-glass)',        shadow: 'var(--shadow-violet)',   color: 'var(--violet-light)' },
    success: { border: 'var(--low-border)',           shadow: 'var(--shadow-low)',      color: 'var(--low-text)' },
    warning: { border: 'var(--high-border)',          shadow: 'var(--shadow-high)',     color: 'var(--high-text)' },
    danger:  { border: 'var(--critical-border)',      shadow: 'var(--shadow-critical)', color: 'var(--critical-text)' },
  };
  const v = variantMap[variant];

  return (
    <div
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${v.border}`,
        borderRadius: 'var(--radius-xl)',
        padding: '18px 22px',
        flex: '1 1 150px',
        minWidth: 0,
        boxShadow: `var(--shadow-card), ${v.shadow}`,
      }}
    >
      <div style={{ fontSize: '36px', fontWeight: 800, color: v.color, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px', fontWeight: 500 }}>
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
