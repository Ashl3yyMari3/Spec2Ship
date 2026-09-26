import React from 'react';
import type { RiskScore, Requirement } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import RiskDashboard from '../components/Risk/RiskDashboard';

export default function RiskPage(): React.ReactElement {
  const { data: scores, loading: scoresLoading, error: scoresError } = useApi<RiskScore[]>('/api/risk');
  const { data: requirements, loading: reqLoading, error: reqError } = useApi<Requirement[]>('/api/requirements');

  const loading = scoresLoading || reqLoading;
  const error = scoresError ?? reqError;

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Risk Dashboard</h1>
        <p className="page-header__subtitle">
          Risk scores and factor breakdowns for each requirement
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading risk analysis…
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load risk data</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && scores !== null && requirements !== null && (
        scores.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-muted)' }}>
              No risk data available.
            </p>
          </div>
        ) : (
          <RiskDashboard scores={scores} requirements={requirements} />
        )
      )}
    </>
  );
}
