import React, { useState } from 'react';
import type { TraceabilityMatrix } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import TraceabilitySummary from '../components/Traceability/TraceabilitySummary';
import TraceabilityMatrixTable from '../components/Traceability/TraceabilityMatrix';
import RequirementTraceabilityDetail from '../components/Traceability/RequirementTraceabilityDetail';

export default function TraceabilityPage(): React.ReactElement {
  const { data, loading, error } = useApi<TraceabilityMatrix>('/api/traceability');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const selectedRequirement =
    data && selectedReqId
      ? (data.requirements.find((r) => r.id === selectedReqId) ?? null)
      : null;

  function handleSelectRequirement(id: string): void {
    setSelectedReqId((prev) => (prev === id ? null : id));
  }

  function handleCloseDetail(): void {
    setSelectedReqId(null);
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Traceability</h1>
        <p className="page-header__subtitle">
          Explore requirement-to-test relationships, inspect acceptance-criteria mappings, and switch to the matrix only when you need the full grid.
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading traceability data…
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load traceability data</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data !== null && (
        <>
          <TraceabilitySummary matrix={data} />

          <TraceabilityMatrixTable
            matrix={data}
            selectedRequirementId={selectedReqId}
            onSelectRequirement={handleSelectRequirement}
          />

          {selectedRequirement && (
            <RequirementTraceabilityDetail
              requirement={selectedRequirement}
              matrix={data}
              onClose={handleCloseDetail}
            />
          )}
        </>
      )}
    </>
  );
}
