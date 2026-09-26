import React from 'react';
import type { CoverageGapReport, Requirement } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import CoverageGaps from '../components/Gaps/CoverageGaps';

export default function CoverageGapsPage(): React.ReactElement {
  const { data: report, loading: reportLoading, error: reportError } = useApi<CoverageGapReport>('/api/coverage-gaps');
  const { data: requirements, loading: reqLoading, error: reqError } = useApi<Requirement[]>('/api/requirements');

  const loading = reportLoading || reqLoading;
  const error = reportError ?? reqError;

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Coverage Gaps</h1>
        <p className="page-header__subtitle">
          Requirements with insufficient test coverage, by gap type
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading coverage gap analysis…
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load coverage gap data</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && report !== null && requirements !== null && (
        <CoverageGaps report={report} requirements={requirements} />
      )}
    </>
  );
}
