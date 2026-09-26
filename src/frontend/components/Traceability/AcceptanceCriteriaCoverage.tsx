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
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: 'var(--text-muted)',
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
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
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
                borderColor: isCovered ? 'var(--low-border)' : 'var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                background: isCovered ? 'rgba(16, 185, 129, 0.08)' : 'rgba(139, 92, 246, 0.04)',
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
                  background: isCovered ? 'var(--low-bright)' : 'rgba(139, 92, 246, 0.18)',
                  color: isCovered ? '#fff' : 'var(--text-muted)',
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
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
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
                      <span className="badge badge--pass" aria-label="Covered">
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
                    <span className="badge badge--fail" aria-label="Not covered">
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
