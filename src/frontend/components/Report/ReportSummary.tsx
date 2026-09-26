import React from 'react';

interface SummaryEntry {
  label: string;
  value: number;
  valueColor?: string;
}

interface Props {
  coveragePercentage: number;
  totalRequirements: number;
  coveredRequirements: number;
  uncoveredRequirements: number;
  passingTests: number;
  failingTests: number;
  notRunTests: number;
  blockedTests: number;
  criticalRiskCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

function MetricCard({
  label,
  value,
  valueColor,
  large,
}: {
  label: string;
  value: string | number;
  valueColor?: string;
  large?: boolean;
}): React.ReactElement {
  return (
    <div
      className="card"
      style={{ textAlign: 'center', marginBottom: 0 }}
      aria-label={`${label}: ${value}`}
    >
      <p
        style={{
          fontSize: large ? 36 : 28,
          fontWeight: 700,
          color: valueColor ?? 'var(--color-text)',
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }): React.ReactElement {
  return (
    <h2
      style={{
        fontSize: 13,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: 'var(--color-muted)',
        marginBottom: 12,
        marginTop: 24,
      }}
    >
      {title}
    </h2>
  );
}

export default function ReportSummary({
  coveragePercentage,
  totalRequirements,
  coveredRequirements,
  uncoveredRequirements,
  passingTests,
  failingTests,
  notRunTests,
  blockedTests,
  criticalRiskCount,
  highRiskCount,
  mediumRiskCount,
  lowRiskCount,
}: Props): React.ReactElement {
  const reqMetrics: SummaryEntry[] = [
    { label: 'Total Requirements', value: totalRequirements },
    { label: 'Covered', value: coveredRequirements, valueColor: 'var(--color-low-text)' },
    {
      label: 'Uncovered',
      value: uncoveredRequirements,
      valueColor: uncoveredRequirements > 0 ? 'var(--color-critical-text)' : 'var(--color-low-text)',
    },
  ];

  const testMetrics: SummaryEntry[] = [
    { label: 'Passing', value: passingTests, valueColor: 'var(--color-low-text)' },
    {
      label: 'Failing',
      value: failingTests,
      valueColor: failingTests > 0 ? 'var(--color-critical-text)' : 'var(--color-low-text)',
    },
    {
      label: 'Not Run',
      value: notRunTests,
      valueColor: notRunTests > 0 ? 'var(--color-not-run-text)' : 'var(--color-low-text)',
    },
    {
      label: 'Blocked',
      value: blockedTests,
      valueColor: blockedTests > 0 ? 'var(--color-blocked-text)' : 'var(--color-low-text)',
    },
  ];

  const riskMetrics: SummaryEntry[] = [
    {
      label: 'Critical Risk',
      value: criticalRiskCount,
      valueColor: criticalRiskCount > 0 ? 'var(--color-critical-text)' : 'var(--color-low-text)',
    },
    {
      label: 'High Risk',
      value: highRiskCount,
      valueColor: highRiskCount > 0 ? 'var(--color-high-text)' : 'var(--color-low-text)',
    },
    {
      label: 'Medium Risk',
      value: mediumRiskCount,
      valueColor: mediumRiskCount > 0 ? 'var(--color-medium-text)' : 'var(--color-low-text)',
    },
    { label: 'Low Risk', value: lowRiskCount, valueColor: 'var(--color-low-text)' },
  ];

  return (
    <section aria-label="Report summary metrics">
      {/* Coverage percentage — prominent */}
      <SectionHeader title="Test Coverage" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
          marginBottom: 4,
        }}
      >
        <MetricCard
          label="Coverage Percentage"
          value={`${coveragePercentage.toFixed(1)}%`}
          valueColor={
            coveragePercentage >= 90
              ? 'var(--color-low-text)'
              : coveragePercentage >= 70
              ? 'var(--color-medium-text)'
              : 'var(--color-critical-text)'
          }
          large
        />
        {reqMetrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} valueColor={m.valueColor} />
        ))}
      </div>

      {/* Test execution */}
      <SectionHeader title="Test Execution" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
          marginBottom: 4,
        }}
      >
        {testMetrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} valueColor={m.valueColor} />
        ))}
      </div>

      {/* Risk counts */}
      <SectionHeader title="Risk Distribution" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 12,
        }}
      >
        {riskMetrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} valueColor={m.valueColor} />
        ))}
      </div>
    </section>
  );
}
