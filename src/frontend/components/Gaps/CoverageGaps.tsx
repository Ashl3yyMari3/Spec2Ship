import React from 'react';
import type { CoverageGapReport, CoverageGap, GapType, Requirement } from '@backend/types/models';

interface Props {
  report: CoverageGapReport;
  requirements: Requirement[];
}

function gapTypeLabel(gapType: GapType): string {
  switch (gapType) {
    case 'no_coverage':
      return 'No Coverage';
    case 'no_executed_coverage':
      return 'No Executed Coverage';
    case 'missing_test_types':
      return 'Missing Test Types';
    default:
      return gapType;
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
    case 'no_coverage':
      return 'badge badge--critical';
    case 'no_executed_coverage':
      return 'badge badge--high';
    case 'missing_test_types':
      return 'badge badge--medium';
    default:
      return 'badge';
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
    <article className="card" aria-labelledby={`gap-req-${gap.requirementId}`}>
      <div className="card__meta" style={{ marginBottom: 8 }}>
        <p className="card__id" id={`gap-req-${gap.requirementId}`} style={{ marginBottom: 0 }}>
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
        <h2 className="card__title" style={{ fontSize: 15, marginBottom: 6 }}>
          {requirement.title}
        </h2>
      )}

      <p className="card__description" style={{ marginBottom: 8 }}>
        <strong>Gap: </strong>{gapTypeDescription(gap.gapType)}
      </p>

      {gap.message && gap.message !== gapTypeDescription(gap.gapType) && (
        <p className="card__description" style={{ marginBottom: 8 }}>
          <strong>Detail: </strong>{gap.message}
        </p>
      )}

      {gap.gapType === 'missing_test_types' && gap.missingTypes.length > 0 && (
        <div style={{ marginTop: 4 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
            Missing Test Types:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
            {gap.missingTypes.map((t) => (
              <li key={t} style={{ fontSize: 13, color: 'var(--color-text)' }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default function CoverageGaps({ report, requirements }: Props): React.ReactElement {
  const reqMap = new Map(requirements.map((r) => [r.id, r]));

  return (
    <section aria-label="Coverage gaps analysis">
      {/* Summary metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text)' }}>
            {report.totalRequirements}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            Total Requirements
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-low-text)' }}>
            {report.coveredCount}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            Covered Requirements
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <p style={{ fontSize: 28, fontWeight: 700, color: report.gapCount > 0 ? 'var(--color-critical-text)' : 'var(--color-low-text)' }}>
            {report.gapCount}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 2 }}>
            Coverage Gaps
          </p>
        </div>
      </div>

      {/* Gap list */}
      {report.gaps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-low-text)', marginBottom: 4 }}>
            No coverage gaps detected.
          </p>
          <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>
            All requirements have adequate test coverage.
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14, color: 'var(--color-text)' }}>
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
