import React from 'react';
import type { ImpactReport, TestType, TestStatus, TestOrigin } from '@backend/types/models';

interface Props {
  report: ImpactReport;
}

function testTypeLabel(type: TestType): string {
  const labels: Record<TestType, string> = {
    functional: 'Functional',
    negative: 'Negative',
    boundary: 'Boundary',
    security: 'Security',
    edge: 'Edge',
  };
  return labels[type] ?? type;
}

function testStatusLabel(status: TestStatus): string {
  const labels: Record<TestStatus, string> = {
    pass: 'Pass',
    fail: 'Fail',
    not_run: 'Not Run',
    blocked: 'Blocked',
  };
  return labels[status] ?? status;
}

function testStatusBadgeClass(status: TestStatus): string {
  switch (status) {
    case 'pass': return 'badge badge--pass';
    case 'fail': return 'badge badge--fail';
    case 'not_run': return 'badge badge--not-run';
    case 'blocked': return 'badge badge--blocked';
    default: return 'badge';
  }
}

function originBadgeClass(origin: TestOrigin): string {
  return origin === 'seeded' ? 'badge badge--origin-seeded' : 'badge badge--origin-suggested';
}

function originLabel(origin: TestOrigin): string {
  return origin === 'seeded' ? 'Seeded' : 'Suggested';
}

function criticalityClass(c: string): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

export default function ImpactAnalysis({ report }: Props): React.ReactElement {
  const directTests = report.directlyImpactedTests;
  const transitiveReqs = report.transitivelyImpactedReqs;

  return (
    <section aria-label="Change impact analysis">
      {/* Recommendation banner */}
      <div
        className="card"
        style={{ borderLeft: '4px solid var(--color-accent)', marginBottom: 24 }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)', marginBottom: 4 }}>
          Recommendation
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-text)' }}>{report.recommendation}</p>
      </div>

      {/* Directly impacted tests */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          Directly Impacted Tests
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-muted)', marginLeft: 8 }}>
            ({directTests.length})
          </span>
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 14 }}>
          Test cases that directly cover this requirement and would need to be re-run or updated.
        </p>

        {directTests.length === 0 ? (
          <p className="state-message" role="status" style={{ paddingTop: 8, paddingBottom: 8 }}>
            No directly impacted tests found. {report.recommendation}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} aria-label="Directly impacted tests">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>Test ID</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Title</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Type</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Status</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Origin</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Execution</th>
                </tr>
              </thead>
              <tbody>
                {directTests.map((tc) => (
                  <tr key={tc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 10px 8px 0', fontFamily: 'monospace', fontSize: 11, color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>{tc.id}</td>
                    <td style={{ padding: '8px 10px 8px 0', fontSize: 13 }}>{tc.title}</td>
                    <td style={{ padding: '8px 10px 8px 0' }}>
                      <span className="badge badge--type">{testTypeLabel(tc.type)}</span>
                    </td>
                    <td style={{ padding: '8px 10px 8px 0' }}>
                      <span className={testStatusBadgeClass(tc.status)}>{testStatusLabel(tc.status)}</span>
                    </td>
                    <td style={{ padding: '8px 10px 8px 0' }}>
                      <span className={originBadgeClass(tc.origin)}>{originLabel(tc.origin)}</span>
                    </td>
                    <td style={{ padding: '8px 10px 8px 0', fontSize: 12, color: 'var(--color-muted)' }}>
                      {tc.automated ? 'Automated' : 'Manual'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transitively impacted requirements */}
      <div className="card">
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
          Transitively Impacted Requirements
          <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-muted)', marginLeft: 8 }}>
            ({transitiveReqs.length})
          </span>
        </h2>
        <p style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 14 }}>
          Requirements that share tests with the selected requirement and may be indirectly affected.
        </p>

        {transitiveReqs.length === 0 ? (
          <p className="state-message" role="status" style={{ paddingTop: 8, paddingBottom: 8 }}>
            No transitively impacted requirements found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} aria-label="Transitively impacted requirements">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>ID</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Title</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Criticality</th>
                  <th scope="col" style={{ textAlign: 'left', padding: '6px 10px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Domain</th>
                </tr>
              </thead>
              <tbody>
                {transitiveReqs.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '8px 10px 8px 0', fontFamily: 'monospace', fontSize: 11, color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>{req.id}</td>
                    <td style={{ padding: '8px 10px 8px 0', fontSize: 13 }}>{req.title}</td>
                    <td style={{ padding: '8px 10px 8px 0' }}>
                      <span className={criticalityClass(req.criticality)}>{criticalityLabel(req.criticality)}</span>
                    </td>
                    <td style={{ padding: '8px 10px 8px 0', fontSize: 12, color: 'var(--color-muted)' }}>{req.domain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
