import React, { useState } from 'react';
import type { RequirementStatus, CoverageStatus, RiskTier } from '@backend/types/models';

interface Props {
  requirementStatuses: RequirementStatus[];
}

function coverageStatusLabel(status: CoverageStatus): string {
  switch (status) {
    case 'full': return 'Full';
    case 'partial': return 'Partial';
    case 'none': return 'None';
    default: return status;
  }
}

function coverageStatusClass(status: CoverageStatus): string {
  switch (status) {
    case 'full': return 'badge badge--low';
    case 'partial': return 'badge badge--medium';
    case 'none': return 'badge badge--critical';
    default: return 'badge';
  }
}

function riskTierClass(tier: RiskTier): string {
  switch (tier) {
    case 'Critical': return 'badge badge--critical';
    case 'High': return 'badge badge--high';
    case 'Medium': return 'badge badge--medium';
    case 'Low': return 'badge badge--low';
    default: return 'badge';
  }
}

function criticalityClass(c: string): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function ExpandableRow({ rs }: { rs: RequirementStatus }): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const { requirement } = rs;
  const rowId = `req-row-${requirement.id}`;
  const detailId = `req-detail-${requirement.id}`;

  return (
    <>
      <tr
        style={{ borderBottom: '1px solid var(--color-border)' }}
        aria-expanded={expanded}
      >
        {/* Requirement ID */}
        <td
          style={{
            padding: '10px 12px',
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-accent)',
            whiteSpace: 'nowrap',
          }}
        >
          {requirement.id}
        </td>

        {/* Title */}
        <td style={{ padding: '10px 12px', minWidth: 180 }}>
          <span style={{ fontSize: 13.5, color: 'var(--color-text)', fontWeight: 500 }}>
            {requirement.title}
          </span>
          {requirement.changed && (
            <span
              className="badge"
              style={{
                marginLeft: 6,
                background: 'var(--color-medium-bg)',
                color: 'var(--color-medium-text)',
                borderColor: 'var(--color-medium-border)',
                fontSize: 10,
              }}
              title="Recently changed"
            >
              Changed
            </span>
          )}
        </td>

        {/* Criticality */}
        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
          <span className={criticalityClass(requirement.criticality)}>
            {criticalityLabel(requirement.criticality)}
          </span>
        </td>

        {/* Risk Score */}
        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, fontSize: 14 }}>
          {rs.riskScore}
        </td>

        {/* Risk Tier */}
        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
          <span className={riskTierClass(rs.riskTier)}>
            {rs.riskTier}
          </span>
        </td>

        {/* Coverage Status */}
        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
          <span className={coverageStatusClass(rs.coverageStatus)}>
            {coverageStatusLabel(rs.coverageStatus)}
          </span>
        </td>

        {/* Linked Test Count */}
        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontSize: 13 }}>
          {rs.linkedTests.length}
        </td>

        {/* Gap Details / Expand */}
        <td style={{ padding: '10px 12px', minWidth: 160 }}>
          {rs.gapDetails ? (
            <div>
              <button
                type="button"
                id={rowId}
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls={detailId}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: '3px 10px',
                  fontSize: 11,
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {expanded ? 'Hide detail' : 'View detail'}
              </button>
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-muted)', fontStyle: 'italic' }}>
              No unresolved coverage gap.
            </span>
          )}
        </td>
      </tr>

      {/* Expanded gap detail row */}
      {expanded && rs.gapDetails && (
        <tr
          id={detailId}
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
        >
          <td colSpan={8} style={{ padding: '10px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 4 }}>
              <strong>Gap Details:</strong>
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', lineHeight: 1.55 }}>
              {rs.gapDetails}
            </p>
            {rs.linkedTests.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
                  Linked Tests ({rs.linkedTests.length}):
                </p>
                <ul style={{ margin: 0, paddingLeft: 20, listStyle: 'disc' }}>
                  {rs.linkedTests.map((tc) => (
                    <li key={tc.id} style={{ fontSize: 12, color: 'var(--color-text)', padding: '1px 0' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>{tc.id}</span>
                      {' — '}
                      {tc.title}
                      {' '}
                      <span
                        className={`badge badge--${tc.status === 'pass' ? 'pass' : tc.status === 'fail' ? 'fail' : tc.status === 'blocked' ? 'blocked' : 'not-run'}`}
                        style={{ fontSize: 10 }}
                      >
                        {tc.status.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function RequirementStatusTable({ requirementStatuses }: Props): React.ReactElement {
  if (requirementStatuses.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <p style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          No requirement statuses available.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Requirement status table">
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
          aria-label="Requirement release status"
        >
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-surface)' }}>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Req ID
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}
              >
                Title
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Criticality
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Risk Score
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Risk Tier
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Coverage
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Tests
              </th>
              <th
                scope="col"
                style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}
              >
                Gap Details
              </th>
            </tr>
          </thead>
          <tbody>
            {requirementStatuses.map((rs) => (
              <ExpandableRow key={rs.requirement.id} rs={rs} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
