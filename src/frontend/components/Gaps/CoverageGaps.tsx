import React from 'react';
import type { CoverageGapReport, CoverageGap, GapType, Requirement } from '@backend/types/models';

interface Props {
  report: CoverageGapReport;
  requirements: Requirement[];
}

function gapTypeLabel(gapType: GapType): string {
  switch (gapType) {
    case 'no_coverage':          return 'No Coverage';
    case 'no_executed_coverage': return 'No Executed Coverage';
    case 'missing_test_types':   return 'Missing Test Types';
    default:                     return gapType;
  }
}

function gapTypeDescription(gapType: GapType): string {
  switch (gapType) {
    case 'no_coverage':
      return 'No linked test cases exist for this requirement.';
    case 'no_executed_coverage':
      return 'Tests are linked but none have executed successfully — all are not_run or blocked.';
    case 'missing_test_types':
      return 'Coverage exists, but expected test type categories are absent. This is informational.';
    default:
      return '';
  }
}

function gapTypeBadgeClass(gapType: GapType): string {
  switch (gapType) {
    case 'no_coverage':          return 'badge badge--critical';
    case 'no_executed_coverage': return 'badge badge--high';
    case 'missing_test_types':   return 'badge badge--medium';
    default:                     return 'badge';
  }
}

function criticalityClass(c: string): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function GapCard({ gap, requirement }: { gap: CoverageGap; requirement: Requirement | undefined }): React.ReactElement {
  return (
    <article
      className="card"
      aria-labelledby={`gap-req-${gap.requirementId}`}
    >
      {/* Header row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
        {/* ID pill */}
        <p
          id={`gap-req-${gap.requirementId}`}
          style={{
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--violet-light)',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 8,
            padding: '2px 8px',
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          {gap.requirementId}
        </p>
        <span className={gapTypeBadgeClass(gap.gapType)}>{gapTypeLabel(gap.gapType)}</span>
        {requirement && (
          <span className={criticalityClass(requirement.criticality)}>
            {criticalityLabel(requirement.criticality)}
          </span>
        )}
      </div>

      {requirement && (
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
          {requirement.title}
        </h2>
      )}

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: gap.gapType === 'missing_test_types' ? 8 : 0, lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Gap: </strong>
        {gapTypeDescription(gap.gapType)}
      </p>

      {gap.message && gap.message !== gapTypeDescription(gap.gapType) && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, marginTop: 4, lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Detail: </strong>
          {gap.message}
        </p>
      )}

      {gap.gapType === 'missing_test_types' && gap.missingTypes.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Missing Test Types:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {gap.missingTypes.map((t) => (
              <span key={t} className="badge badge--type" style={{ fontFamily: 'monospace' }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

// KPI card for summary metrics
function SummaryKpiCard({ value, label, variant }: { value: number; label: string; variant: 'neutral' | 'good' | 'danger' }): React.ReactElement {
  const colors = {
    neutral: { value: 'var(--violet-light)',   border: 'var(--border-glass)',   glow: 'var(--shadow-violet)' },
    good:    { value: 'var(--low-text)',        border: 'var(--low-border)',      glow: 'var(--shadow-low)' },
    danger:  { value: 'var(--critical-text)',   border: 'var(--critical-border)', glow: 'var(--shadow-critical)' },
  };
  const c = colors[variant];
  return (
    <div
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        textAlign: 'center',
        boxShadow: `var(--shadow-card), ${c.glow}`,
        flex: '1 1 180px',
      }}
    >
      <p style={{ fontSize: 44, fontWeight: 800, color: c.value, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
        {label}
      </p>
    </div>
  );
}

export default function CoverageGaps({ report, requirements }: Props): React.ReactElement {
  const reqMap = new Map(requirements.map((r) => [r.id, r]));

  return (
    <section aria-label="Coverage gaps analysis">
      {/* Summary KPI cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <SummaryKpiCard value={report.totalRequirements} label="Total Requirements" variant="neutral" />
        <SummaryKpiCard value={report.coveredCount}      label="Covered Requirements" variant="good" />
        <SummaryKpiCard
          value={report.gapCount}
          label="Coverage Gaps"
          variant={report.gapCount > 0 ? 'danger' : 'good'}
        />
      </div>

      {/* Gap list */}
      {report.gaps.length === 0 ? (
        <div
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--low-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-card), var(--shadow-low)',
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--low-text)', marginBottom: 6 }}>
            No coverage gaps detected.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            All requirements have adequate test coverage.
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Gap Details ({report.gaps.length})
          </h2>
          {report.gaps.map((gap) => (
            <GapCard key={gap.requirementId} gap={gap} requirement={reqMap.get(gap.requirementId)} />
          ))}
        </>
      )}
    </section>
  );
}
