import React, { useState } from 'react';
import type { ImpactReport, Requirement } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import ImpactAnalysis from '../components/Impact/ImpactAnalysis';

export default function ImpactPage(): React.ReactElement {
  const { data: requirements, loading: reqLoading, error: reqError } = useApi<Requirement[]>('/api/requirements');
  const [selectedId, setSelectedId] = useState<string>('');
  const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const id = e.target.value;
    setSelectedId(id);
    setImpactReport(null);
    setImpactError(null);

    if (!id) return;

    setImpactLoading(true);
    fetch(`/api/impact/${encodeURIComponent(id)}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body: { error?: string }) => {
            throw new Error(body.error ?? `Request failed: ${res.status} ${res.statusText}`);
          });
        }
        return res.json() as Promise<ImpactReport>;
      })
      .then((data) => {
        setImpactReport(data);
        setImpactLoading(false);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setImpactError(message);
        setImpactLoading(false);
      });
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Change Impact</h1>
        <p className="page-header__subtitle">
          Select a requirement to see which tests and requirements are affected by a change
        </p>
      </div>

      {/* Requirement selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <label
          htmlFor="impact-req-select"
          style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-text)' }}
        >
          Requirement
        </label>

        {reqLoading && (
          <p className="state-message" role="status" aria-live="polite" style={{ padding: '8px 0', textAlign: 'left' }}>
            Loading requirements…
          </p>
        )}

        {reqError && !reqLoading && (
          <div className="state-message state-message--error" role="alert">
            <p className="state-message__title">Failed to load requirements</p>
            <p>{reqError}</p>
          </div>
        )}

        {!reqLoading && !reqError && requirements !== null && (
          <select
            id="impact-req-select"
            value={selectedId}
            onChange={handleSelectChange}
            style={{
              width: '100%',
              maxWidth: 480,
              padding: '8px 12px',
              fontSize: 13,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              background: 'var(--color-bg)',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
            aria-label="Select a requirement to analyze"
          >
            <option value="">— Select a requirement —</option>
            {requirements.map((req) => (
              <option key={req.id} value={req.id}>
                {req.id} — {req.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Impact results */}
      {!selectedId && !reqLoading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-muted)', marginBottom: 4 }}>
            Select a requirement to analyze its change impact.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            The analysis shows directly impacted tests and transitively impacted requirements.
          </p>
        </div>
      )}

      {selectedId && impactLoading && (
        <p className="state-message" role="status" aria-live="polite">
          Analyzing change impact for {selectedId}…
        </p>
      )}

      {selectedId && impactError && !impactLoading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load impact analysis</p>
          <p>{impactError}</p>
        </div>
      )}

      {selectedId && !impactLoading && !impactError && impactReport !== null && (
        <ImpactAnalysis report={impactReport} />
      )}
    </>
  );
}
