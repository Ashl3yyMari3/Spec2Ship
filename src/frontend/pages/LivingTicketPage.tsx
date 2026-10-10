import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type {
  Requirement,
  TestCase,
  CoverageGapReport,
} from '@backend/types/models';
import { useApi } from '../hooks/useApi';

const testStatusStyles: Record<
  TestCase['status'],
  {
    label: string;
    color: string;
    background: string;
  }
> = {
  pass: {
    label: 'Passed',
    color: '#4ade80',
    background: 'rgba(74, 222, 128, 0.12)',
  },
  fail: {
    label: 'Failed',
    color: '#f87171',
    background: 'rgba(248, 113, 113, 0.12)',
  },
  blocked: {
    label: 'Blocked',
    color: '#fbbf24',
    background: 'rgba(251, 191, 36, 0.12)',
  },
  not_run: {
    label: 'Not Run',
    color: '#c4b5fd',
    background: 'rgba(196, 181, 253, 0.12)',
  },
};

export default function LivingTicketPage(): React.ReactElement {
  const { requirementId } = useParams<{ requirementId: string }>();

  const requirements = useApi<Requirement[]>('/api/requirements');
  const tests = useApi<TestCase[]>('/api/tests');
  const coverage = useApi<CoverageGapReport>('/api/coverage-gaps');
  const requirement = requirements.data?.find(
    (item) => item.id === requirementId,
  );

  const linkedTests = (tests.data ?? []).filter(
    (test) => test.requirementIds.includes(requirementId ?? ''),
  );

  const criterionCoverage = coverage.data?.evaluations.find(
    (evaluation) => evaluation.requirementId === requirementId,
  );

  const testSummary = {
    passed: linkedTests.filter((test) => test.status === 'pass').length,
    failed: linkedTests.filter((test) => test.status === 'fail').length,
    blocked: linkedTests.filter((test) => test.status === 'blocked').length,
    notRun: linkedTests.filter((test) => test.status === 'not_run').length,
  };

  const executedCount = testSummary.passed + testSummary.failed;

  const executionPercent =
    linkedTests.length > 0
      ? Math.round((executedCount / linkedTests.length) * 100)
      : 0;

  const remainingCount = linkedTests.length - executedCount;

  if (requirements.loading || tests.loading) {
    return <p role="status">Loading Living Ticket...</p>;
  }

  if (requirements.error || tests.error) {
    return (
      <p role="alert">
        Unable to load ticket: {requirements.error || tests.error}
      </p>
    );
  }

  if (!requirement) {
    return <p role="alert">Requirement not found.</p>;
  }

  return (
    <main>
      <Link to="/requirements">← Back to Requirements</Link>

      <header className="page-header">
        <p>{requirement.id} · Living Ticket</p>
        <h1 className="page-header__title">
          {requirement.title}
        </h1>
        <p className="page-header__subtitle">
          {requirement.description}
        </p>
      </header>

      
      <section className="card">
        <h2>Acceptance Criteria Coverage</h2>

        {coverage.loading ? (
          <p role="status">Checking acceptance criteria coverage...</p>
        ) : coverage.error ? (
          <p role="alert">
            Unable to load coverage: {coverage.error}
          </p>
        ) : !criterionCoverage ? (
          <p>Coverage information is not available for this requirement.</p>
        ) : (
          <>
            <p style={{ marginBottom: 20, opacity: 0.8 }}>
              {criterionCoverage.coveredCriteriaCount} of{' '}
              {criterionCoverage.totalCriteria} criteria have explicitly
              linked tests.
            </p>

            <div style={{ display: 'grid', gap: 12 }}>
              {requirement.acceptanceCriteria.map((criterion, index) => {
                const isCovered =
                  criterionCoverage.coveredCriteriaIndexes.includes(index);

                const supportingTests = linkedTests.filter(
                  (test) =>
                    criterionCoverage.linkedTestIds.includes(test.id) &&
                    test.acceptanceCriteriaRefs.some(
                      (ref) =>
                        ref.requirementId === requirement.id &&
                        ref.criterionIndex === index,
                  ),
                );

                return (
                  <article
                    key={index}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: 'rgba(139, 92, 246, 0.06)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 10,
                      }}
                    >
                      <strong>Criterion {index + 1}</strong>

                      <span
                        style={{
                          padding: '5px 12px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          color: isCovered ? '#4ade80' : '#fbbf24',
                          background: isCovered
                            ? 'rgba(74, 222, 128, 0.12)'
                            : 'rgba(251, 191, 36, 0.12)',
                        }}
                      >
                        {isCovered ? 'Tests Linked' : 'Needs Linkage'}
                      </span>
                    </div>

                    <p style={{ margin: 0 }}>{criterion}</p>

                    {supportingTests.length > 0 && (
                      <p
                        style={{
                          fontSize: 12,
                          opacity: 0.75,
                          marginTop: 12,
                          marginBottom: 0,
                      }}
                      >
                        Supporting tests:{' '}
                        {supportingTests.map((test) => test.id).join(', ')}
                    </p>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
  
    


      <section className="card">
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      gap: 12,
    }}
  >
    <h2 style={{ margin: 0 }}>Linked QA Tests</h2>

    <span className="badge badge--type">
      {linkedTests.length} Tests
    </span>
  </div>
  <div
  style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 24,
  }}
>
  {[
    { label: 'Passed', count: testSummary.passed, color: '#4ade80' },
    { label: 'Failed', count: testSummary.failed, color: '#f87171' },
    { label: 'Blocked', count: testSummary.blocked, color: '#fbbf24' },
    { label: 'Not Run', count: testSummary.notRun, color: '#c4b5fd' },
  ].map((item) => (
    <div
      key={item.label}
      style={{
        padding: '16px 8px',
        borderRadius: 12,
        textAlign: 'center',
        background: 'rgba(139, 92, 246, 0.08)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: item.color,
        }}
      >
        {item.count}
      </div>
      <div
        style={{
          fontSize: 12,
          marginTop: 4,
          opacity: 0.8,
        }}
      >
        {item.label}
      </div>
    </div>
  ))}
</div>

<div style={{ marginBottom: 24 }}>
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    }}
  >
    <strong>QA Execution Progress</strong>
    <span style={{ color: '#c4b5fd', fontWeight: 700 }}>
      {executionPercent}%
    </span>
  </div>

  <div
    role="progressbar"
    aria-label="QA test execution progress"
    aria-valuenow={executionPercent}
    aria-valuemin={0}
    aria-valuemax={100}
    style={{
      height: 10,
      background: 'rgba(139, 92, 246, 0.15)',
      borderRadius: 20,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${executionPercent}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #8b5cf6, #22d3ee)',
        borderRadius: 20,
        transition: 'width 0.3s ease',
      }}
    />
  </div>

  <p style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
    {executedCount} of {linkedTests.length} tests executed
    {' · '}
    {remainingCount} remaining
  </p>
</div>

  {linkedTests.length === 0 ? (
    <p>No tests linked to this requirement yet.</p>
  ) : (
    <div style={{ display: 'grid', gap: 12 }}>
      {linkedTests.map((test) => {
        const status = testStatusStyles[test.status];

        return (
          <article
            key={test.id}
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgba(139, 92, 246, 0.06)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <strong>{test.id}</strong>

              <span
                style={{
                  color: status.color,
                  background: status.background,
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {status.label}
              </span>
            </div>

            <h3 style={{ margin: '0 0 8px' }}>
              {test.title}
            </h3>

            <p
              style={{
                margin: 0,
                fontSize: 13,
                opacity: 0.75,
              }}
            >
              {test.description}
            </p>
          </article>
        );
      })}
    </div>
  )}
</section>
    </main>
  );
}