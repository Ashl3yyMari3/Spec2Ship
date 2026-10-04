import React from 'react';
import type {
  TraceabilityMatrix,
} from '@backend/types/models';

interface Props {
  matrix: TraceabilityMatrix;
}

interface SummaryMetrics {
  totalRequirements: number;
  totalTestCases: number;
  mappedRequirements: number;
  unmappedRequirements: number;
  orphanTests: number;
}

export function computeSummaryMetrics(
  matrix: TraceabilityMatrix,
): SummaryMetrics {
  const validRequirementIds = new Set(
    matrix.requirements.map(
      (requirement) => requirement.id,
    ),
  );

  const linkIdsByRequirement =
    new Map<string, Set<string>>();

  for (const requirement of matrix.requirements) {
    linkIdsByRequirement.set(
      requirement.id,
      new Set(),
    );
  }

  for (const link of matrix.links) {
    linkIdsByRequirement
      .get(link.requirementId)
      ?.add(link.testCaseId);
  }

  for (const testCase of matrix.testCases) {
    for (const requirementId of
      testCase.requirementIds) {
      if (
        validRequirementIds.has(
          requirementId,
        )
      ) {
        linkIdsByRequirement
          .get(requirementId)
          ?.add(testCase.id);
      }
    }
  }

  const mappedRequirements =
    matrix.requirements.filter(
      (requirement) =>
        (
          linkIdsByRequirement.get(
            requirement.id,
          )?.size ?? 0
        ) > 0,
    ).length;

  const linkedTestIds = new Set(
    matrix.links.map(
      (link) => link.testCaseId,
    ),
  );

  const orphanTests = matrix.testCases.filter(
    (testCase) =>
      !linkedTestIds.has(testCase.id) &&
      !testCase.requirementIds.some((id) =>
        validRequirementIds.has(id),
      ),
  ).length;

  return {
    totalRequirements:
      matrix.requirements.length,
    totalTestCases:
      matrix.testCases.length,
    mappedRequirements,
    unmappedRequirements:
      matrix.requirements.length -
      mappedRequirements,
    orphanTests,
  };
}

function MetricCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: number;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'danger';
}): React.ReactElement {
  const variantMap = {
    default: {
      border: 'var(--border-glass)',
      shadow: 'var(--shadow-violet)',
      color: 'var(--violet-light)',
    },
    success: {
      border: 'var(--low-border)',
      shadow: 'var(--shadow-low)',
      color: 'var(--low-text)',
    },
    warning: {
      border: 'var(--high-border)',
      shadow: 'var(--shadow-high)',
      color: 'var(--high-text)',
    },
    danger: {
      border: 'var(--critical-border)',
      shadow: 'var(--shadow-critical)',
      color: 'var(--critical-text)',
    },
  };

  const style = variantMap[variant];

  return (
    <div
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-xl)',
        padding: '18px 22px',
        flex: '1 1 150px',
        minWidth: 0,
        boxShadow: `var(--shadow-card), ${style.shadow}`,
      }}
    >
      <div
        style={{
          fontSize: '34px',
          fontWeight: 800,
          color: style.color,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '5px',
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function TraceabilitySummary({
  matrix,
}: Props): React.ReactElement {
  const metrics =
    computeSummaryMetrics(matrix);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
      }}
    >
      <MetricCard
        label="Requirements"
        value={metrics.totalRequirements}
      />
      <MetricCard
        label="Test Cases"
        value={metrics.totalTestCases}
      />
      <MetricCard
        label="Requirements with Tests"
        value={metrics.mappedRequirements}
        variant="success"
      />
      <MetricCard
        label="Requirements without Tests"
        value={metrics.unmappedRequirements}
        variant={
          metrics.unmappedRequirements > 0
            ? 'danger'
            : 'success'
        }
      />
      <MetricCard
        label="Tests without Requirements"
        value={metrics.orphanTests}
        variant={
          metrics.orphanTests > 0
            ? 'warning'
            : 'success'
        }
      />
    </div>
  );
}
