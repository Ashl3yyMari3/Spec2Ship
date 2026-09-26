import React from 'react';
import type { TestCase, TraceabilityMatrix, TestStatus, TestOrigin, CoverageType } from '@backend/types/models';

interface Props {
  requirementId: string;
  matrix: TraceabilityMatrix;
}

function getLinkedTestCases(requirementId: string, matrix: TraceabilityMatrix): {
  testCase: TestCase;
  coverageType: CoverageType | null;
  notes: string;
}[] {
  // Gather test IDs from links first (preserving coverageType/notes)
  const linkMap = new Map<string, { coverageType: CoverageType; notes: string }>();
  matrix.links
    .filter((l) => l.requirementId === requirementId)
    .forEach((l) => {
      linkMap.set(l.testCaseId, { coverageType: l.coverageType, notes: l.notes });
    });

  // Also include test cases that reference this requirement via requirementIds
  const allIds = new Set<string>(linkMap.keys());
  matrix.testCases.forEach((tc) => {
    if (tc.requirementIds.includes(requirementId)) allIds.add(tc.id);
  });

  const tcById = new Map(matrix.testCases.map((tc) => [tc.id, tc]));
  return Array.from(allIds)
    .map((id) => {
      const tc = tcById.get(id);
      if (!tc) return null;
      const linkInfo = linkMap.get(id) ?? null;
      return {
        testCase: tc,
        coverageType: linkInfo?.coverageType ?? null,
        notes: linkInfo?.notes ?? '',
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeClass(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass: 'badge badge--pass',
    fail: 'badge badge--fail',
    not_run: 'badge badge--not-run',
    blocked: 'badge badge--blocked',
  };
  return map[s];
}

function statusLabel(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass: 'Pass',
    fail: 'Fail',
    not_run: 'Not Run',
    blocked: 'Blocked',
  };
  return map[s];
}

function originClass(o: TestOrigin): string {
  return `badge badge--origin-${o}`;
}

function originLabel(o: TestOrigin): string {
  return o === 'seeded' ? 'Seeded' : 'Suggested';
}

function CoverageTypeBadge({ type }: { type: CoverageType | null }): React.ReactElement | null {
  if (!type) return null;
  const classMap: Record<CoverageType, string> = {
    full:    'badge coverage-badge-full',
    partial: 'badge coverage-badge-partial',
  };
  const labels: Record<CoverageType, string> = {
    full:    'Full Coverage',
    partial: 'Partial Coverage',
  };
  return (
    <span className={classMap[type]}>
      {labels[type]}
    </span>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--text-muted)',
  marginBottom: '4px',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LinkedTests({ requirementId, matrix }: Props): React.ReactElement {
  const linked = getLinkedTestCases(requirementId, matrix);

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--text-muted)',
    marginBottom: '10px',
  };

  if (linked.length === 0) {
    return (
      <div>
        <p style={sectionHeadingStyle}>Linked Test Cases</p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No test cases are currently linked to this requirement.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={sectionHeadingStyle}>
        Linked Test Cases{' '}
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '12px' }}>
          ({linked.length})
        </span>
      </p>
      <div style={{ display: 'grid', gap: '10px' }}>
        {linked.map(({ testCase: tc, coverageType, notes }) => (
          <div
            key={tc.id}
            style={{
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              background: 'rgba(139, 92, 246, 0.05)',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--violet-light)',
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.25)',
                  borderRadius: 6,
                  padding: '1px 6px',
                  letterSpacing: '0.06em',
                }}
              >
                {tc.id}
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  flex: 1,
                  minWidth: '160px',
                }}
              >
                {tc.title}
              </span>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              <span className={statusBadgeClass(tc.status)}>{statusLabel(tc.status)}</span>
              <span className={originClass(tc.origin)}>{originLabel(tc.origin)}</span>
              <span className="badge badge--type">
                {tc.type.charAt(0).toUpperCase() + tc.type.slice(1)}
              </span>
              <span className="badge badge--type">
                {tc.automated ? 'Automated' : 'Manual'}
              </span>
              <CoverageTypeBadge type={coverageType} />
            </div>

            {/* Detail fields */}
            <dl style={{ display: 'grid', gap: '4px', margin: 0 }}>
              {tc.description && (
                <div>
                  <dt style={fieldLabelStyle}>Description</dt>
                  <dd style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {tc.description}
                  </dd>
                </div>
              )}
              {notes && (
                <div style={{ marginTop: '4px' }}>
                  <dt style={fieldLabelStyle}>Notes</dt>
                  <dd style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
