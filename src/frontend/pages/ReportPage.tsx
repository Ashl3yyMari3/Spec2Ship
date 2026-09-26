import React, { useCallback } from 'react';
import type { ReleaseReadinessReport } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import ReleaseReport from '../components/Report/ReleaseReport';

export default function ReportPage(): React.ReactElement {
  const { data: report, loading, error } = useApi<ReleaseReadinessReport>('/api/release-readiness');

  const handleDownloadJson = useCallback(() => {
    if (!report) return;
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spec2ship-release-readiness.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [report]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Release Readiness Report</h1>
        <p className="page-header__subtitle">
          Summarizes current requirement coverage, test execution, risk assessment, and release
          evidence for the current build.
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading release readiness report&#8230;
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Release Readiness Report could not be loaded</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && report !== null && (
        <ReleaseReport
          report={report}
          onDownloadJson={handleDownloadJson}
          onPrint={handlePrint}
        />
      )}
    </>
  );
}
