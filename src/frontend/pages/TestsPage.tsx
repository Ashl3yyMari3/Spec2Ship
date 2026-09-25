import React from 'react';
import type { TestCase } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import TestCasesList from '../components/TestCases/TestCasesList';

export default function TestsPage(): React.ReactElement {
  const { data, loading, error } = useApi<TestCase[]>('/api/tests');

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Test Cases</h1>
        <p className="page-header__subtitle">
          All seeded and suggested test cases with traceability references
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading test cases…
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load test cases</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data !== null && (
        <TestCasesList tests={data} />
      )}
    </>
  );
}
