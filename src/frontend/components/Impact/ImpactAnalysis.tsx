import React from 'react';
import type { ImpactReport, TestType, TestStatus, TestOrigin } from '@backend/types/models';

interface Props {
  report: ImpactReport;
}

function testTypeLabel(type: TestType): string {
  const labels: Record<TestType, string> = {
    functional: 'Functional',
    negative:   'Negative',
    boundary:   'Boundary',
    security:   'Security',
    edge:       'Edge',
  };
  return labels[type] ?? type;
}

function testStatusLabel(status: TestStatus): string {
  const labels: Record<TestStatus, string> = {
    pass:    'Pass',
    fail:    'Fail',
    not_run: 'Not Run',
    blocked: 'Blocked',
  };
  return labels[status] ?? status;
}

function testStatusBadgeClass(status: TestStatus): string {
  switch (status) {
    case 'pass':    return 'badge badge--pass';
    case 'fail':    return 'badge badge--fail';
    case 'not_run': return 'badge badge--not-run';
    case 'blocked': return 'badge badge--blocked';
    default:        return 'badge';
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

// Section header with count
function SectionHeader({ title, count, description }: { title: string; count: number; description: string }): React.ReactElement {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          {title}
        </h2>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--violet-light)',
            background: 'rgba(139,92,246,0.14)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 20,
            padding: '1px 8px',
          }}
        >
          {count}
        </span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
    </div>
  );
}

export default function ImpactAnalysis({ report }: Props): React.ReactElement {
  const directTests = report.directlyImpactedTests;
  const transitiveReqs = report.transitivelyImpactedReqs;

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px 10px 0',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
    borderBottom: '1px solid var(--border-glass-bright)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '9px 12px 9px 0',
    fontSize: 13,
    color: 'var(--text-secondary)',
    verticalAlign: 'middle' as const,
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  };

  return (
    <section aria-label="Change impact analysis">
      {/* Recommendation panel */}
      <div
        className="card"
        style={{
          borderLeft: '3px solid var(--violet)',
          boxShadow: 'var(--shadow-card), var(--shadow-violet)',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
          Recommendation
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{report.recommendation}</p>
      </div>

      {/* Directly impacted tests */}
      <div className="card" style={{ marginBottom: 20 }}>
        <SectionHeader
          title="Directly Impacted Tests"
          count={directTests.length}
          description="Test cases that directly cover this requirement and would need to be re-run or updated."
        />

        {directTests.length === 0 ? (
          <p className="state-message" role="status" style={{ paddingTop: 8, paddingBottom: 8 }}>
            No directly impacted tests found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} aria-label="Directly impacted tests">
              <thead>
                <tr>
                  <th scope="col" style={thStyle}>Test ID</th>
                  <th scope="col" style={thStyle}>Title</th>
                  <th scope="col" style={thStyle}>Type</th>
                  <th scope="col" style={thStyle}>Status</th>
                  <th scope="col" style={thStyle}>Origin</th>
                  <th scope="col" style={thStyle}>Execution</th>
                </tr>
              </thead>
              <tbody>
                {directTests.map((tc) => (
                  <tr key={tc.id}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: 'var(--violet-light)', whiteSpace: 'nowrap' }}>{tc.id}</td>
                    <td style={tdStyle}>{tc.title}</td>
                    <td style={tdStyle}>
                      <span className="badge badge--type">{testTypeLabel(tc.type)}</span>
                    </td>
                    <td style={tdStyle}>
                      <span className={testStatusBadgeClass(tc.status)}>{testStatusLabel(tc.status)}</span>
                    </td>
                    <td style={tdStyle}>
                      <span className={originBadgeClass(tc.origin)}>{originLabel(tc.origin)}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: 'var(--text-muted)' }}>
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
        <SectionHeader
          title="Transitively Impacted Requirements"
          count={transitiveReqs.length}
          description="Requirements that share tests with the selected requirement and may be indirectly affected."
        />

        {transitiveReqs.length === 0 ? (
          <p className="state-message" role="status" style={{ paddingTop: 8, paddingBottom: 8 }}>
            No transitively impacted requirements found.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }} aria-label="Transitively impacted requirements">
              <thead>
                <tr>
                  <th scope="col" style={thStyle}>ID</th>
                  <th scope="col" style={thStyle}>Title</th>
                  <th scope="col" style={thStyle}>Criticality</th>
                  <th scope="col" style={thStyle}>Domain</th>
                </tr>
              </thead>
              <tbody>
                {transitiveReqs.map((req) => (
                  <tr key={req.id}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 11, color: 'var(--violet-light)', whiteSpace: 'nowrap' }}>{req.id}</td>
                    <td style={tdStyle}>{req.title}</td>
                    <td style={tdStyle}>
                      <span className={criticalityClass(req.criticality)}>{criticalityLabel(req.criticality)}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12, color: 'var(--text-muted)' }}>{req.domain}</td>
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
