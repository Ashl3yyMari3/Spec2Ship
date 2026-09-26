import React from 'react';
import type { ReleaseReadinessReport } from '@backend/types/models';
import VerdictBanner from './VerdictBanner';
import ReportSummary from './ReportSummary';
import RequirementStatusTable from './RequirementStatusTable';
import ReasonList from './ReasonList';

interface Props {
  report: ReleaseReadinessReport;
  onDownloadJson: () => void;
  onPrint: () => void;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

function SectionDivider(): React.ReactElement {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: '1px solid var(--color-border)',
        margin: '28px 0',
      }}
    />
  );
}

export default function ReleaseReport({ report, onDownloadJson, onPrint }: Props): React.ReactElement {
  return (
    <article aria-label="Release Readiness Report">
      {/* Report actions — print and download */}
      <div
        className="report-actions"
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={onPrint}
          aria-label="Print this report"
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          Print Report
        </button>
        <button
          type="button"
          onClick={onDownloadJson}
          aria-label="Download report as JSON"
          style={{
            padding: '7px 16px',
            fontSize: 13,
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          Download JSON
        </button>
      </div>

      {/* Metadata */}
      <p
        className="report-meta"
        style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 20 }}
        aria-label={`Report generated at ${report.generatedAt}`}
      >
        Generated: <time dateTime={report.generatedAt}>{formatTimestamp(report.generatedAt)}</time>
      </p>

      {/* Verdict banner */}
      <VerdictBanner verdict={report.overallVerdict} rationale={report.verdictRationale} />

      {/* Verdict-specific reasons / confirmations */}
      {report.overallVerdict === 'Not Ready' && (
        <ReasonList
          title="Blocking Reasons"
          reasons={report.blockingReasons}
          variant="blocking"
        />
      )}

      {report.overallVerdict === 'Review Required' && (
        <ReasonList
          title="Review Reasons"
          reasons={report.reviewReasons}
          variant="review"
        />
      )}

      {report.overallVerdict === 'Ready' && (
        <ReasonList
          title="Readiness Confirmations"
          reasons={report.readyConfirmations}
          variant="ready"
        />
      )}

      <SectionDivider />

      {/* Summary metrics */}
      <ReportSummary
        coveragePercentage={report.coveragePercentage}
        totalRequirements={report.summary.totalRequirements}
        coveredRequirements={report.summary.coveredRequirements}
        uncoveredRequirements={report.summary.uncoveredRequirements}
        passingTests={report.summary.passingTests}
        failingTests={report.summary.failingTests}
        notRunTests={report.summary.notRunTests}
        blockedTests={report.summary.blockedTests}
        criticalRiskCount={report.summary.criticalRiskCount}
        highRiskCount={report.summary.highRiskCount}
        mediumRiskCount={report.summary.mediumRiskCount}
        lowRiskCount={report.summary.lowRiskCount}
      />

      <SectionDivider />

      {/* Requirement status table */}
      <section aria-label="Per-requirement release status">
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 16,
          }}
        >
          Requirement Status ({report.requirementStatuses.length})
        </h2>
        <RequirementStatusTable requirementStatuses={report.requirementStatuses} />
      </section>
    </article>
  );
}
