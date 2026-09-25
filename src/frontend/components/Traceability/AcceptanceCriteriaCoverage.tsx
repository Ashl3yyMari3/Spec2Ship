import React from 'react';
import type { Requirement, TestCase } from '@backend/types/models';

interface Props {
  requirement: Requirement;
  testCases: TestCase[];
}

interface CriterionCoverage {
  index: number;      // 0-based
  text: string;
  coveredByTestIds: string[];
}

function buildCriterionCoverage(
  req: Requirement,
  testCases: TestCase[],
): CriterionCoverage[] {
  return req.acceptanceCriteria.map((text, index) => {
    const coveredByTestIds = testCases
      .filter((tc) =>
        tc.acceptanceCriteriaRefs.some(
          (ref) => ref.requirementId === req.id && ref.criterionIndex === index,
        ),
      )
      .map((tc) => tc.id);

    return { index, text, coveredByTestIds };
  });
}

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-muted)',
  marginBottom: '10px',
};

export default function AcceptanceCriteriaCoverage({
  requirement,
  testCases,
}: Props): React.ReactElement {
  if (requirement.acceptanceCriteria.length === 0) {
    return (
      <div>
        <p style={sectionHeadingStyle}>Acceptance Criteria Coverage</p>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
          No acceptance criteria available.
        </p>
      </div>
    );
  }

  const criterionCoverage = buildCriterionCoverage(requirement, testCases);

  return (
    <div>
      <p style={sectionHeadingStyle}>Acceptance Criteria Coverage</p>
      <ol
        style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}
        aria-label={`Acceptance criteria coverage for ${requirement.id}`}
      >
        {criterionCoverage.map((item) => {
          const isCovered = item.coveredByTestIds.length > 0;
          return (
            <li
              key={item.index}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px 12px',
                border: '1px solid',
                borderColor: isCovered ? '#86efac' : 'var(--color-border)',
                borderRadius: 'var(--radius)',
                background: isCovered ? '#f0fdf4' : 'var(--color-surface)',
                alignItems: 'flex-start',
              }}
            >
              {/* Number */}
              <span
                style={{
                  flexShrink: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isCovered ? '#22c55e' : 'var(--color-border)',
                  color: isCovered ? '#fff' : 'var(--color-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1px',
                }}
                aria-hidden="true"
              >
                {item.index + 1}
              </span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0, lineHeight: 1.5 }}>
                  {item.text}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  {isCovered ? (
                    <>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#166534',
                          background: '#dcfce7',
                          border: '1px solid #86efac',
                          borderRadius: '10px',
                          padding: '1px 8px',
                        }}
                        aria-label="Covered"
                      >
                        Covered
                      </span>
                      {item.coveredByTestIds.map((tcId) => (
                        <span
                          key={tcId}
                          className="badge badge--type"
                          style={{ fontFamily: 'monospace', fontSize: '11px' }}
                        >
                          {tcId}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#991b1b',
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '10px',
                        padding: '1px 8px',
                      }}
                      aria-label="Not covered"
                    >
                      Not Covered
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
