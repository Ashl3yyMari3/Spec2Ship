import React from 'react';
import type { Requirement } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import RequirementsList from '../components/Requirements/RequirementsList';

export default function RequirementsPage(): React.ReactElement {
  const { data, loading, error } = useApi<Requirement[]>('/api/requirements');

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Requirements</h1>
        <p className="page-header__subtitle">
          All parsed requirements with acceptance criteria
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading requirements…
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load requirements</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data !== null && (
        <RequirementsList requirements={data} />
      )}
    </>
  );
}
