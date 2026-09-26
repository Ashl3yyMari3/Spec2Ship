import React, { useState } from 'react';
import type { RiskScore, RiskTier, Requirement } from '@backend/types/models';

interface Props {
  scores: RiskScore[];
  requirements: Requirement[];
}

function tierBadgeClass(tier: RiskTier): string {
  switch (tier) {
    case 'Critical': return 'badge badge--critical';
    case 'High': return 'badge badge--high';
    case 'Medium': return 'badge badge--medium';
    case 'Low': return 'badge badge--low';
    default: return 'badge';
  }
}

function criticalityClass(c: string): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

const FACTOR_WEIGHTS: { key: string; label: string; weight: string }[] = [
  { key: 'criticality', label: 'Criticality', weight: '0.35' },
  { key: 'coverageGap', label: 'Coverage Gap', weight: '0.30' },
  { key: 'executionCompleteness', label: 'Execution Completeness', weight: '0.20' },
  { key: 'changeImpact', label: 'Change Impact', weight: '0.15' },
];

function getRawValue(riskScore: RiskScore, key: string): number {
  switch (key) {
    case 'criticality': return riskScore.factors.criticalityRaw;
    case 'coverageGap': return riskScore.factors.coverageGapRaw;
    case 'executionCompleteness': return riskScore.factors.executionCompletenessRaw;
    case 'changeImpact': return riskScore.factors.changeImpactRaw;
    default: return 0;
  }
}

function getWeightedContribution(riskScore: RiskScore, key: string): number {
  switch (key) {
    case 'criticality': return riskScore.weightedContributions.criticality;
    case 'coverageGap': return riskScore.weightedContributions.coverageGap;
    case 'executionCompleteness': return riskScore.weightedContributions.executionCompleteness;
    case 'changeImpact': return riskScore.weightedContributions.changeImpact;
    default: return 0;
  }
}

function RiskCard({ riskScore, requirement }: { riskScore: RiskScore; requirement: Requirement | undefined }): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="card" aria-labelledby={`risk-req-${riskScore.requirementId}`}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <p className="card__id" style={{ marginBottom: 2 }}>{riskScore.requirementId}</p>
          {requirement && (
            <h2 className="card__title" id={`risk-req-${riskScore.requirementId}`} style={{ fontSize: 15, marginBottom: 0 }}>
              {requirement.title}
            </h2>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {requirement && (
            <span className={criticalityClass(requirement.criticality)}>
              {criticalityLabel(requirement.criticality)}
            </span>
          )}
          <span className={tierBadgeClass(riskScore.tier)} style={{ fontSize: 12 }}>
            {riskScore.tier}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: 22,
              color: riskScore.tier === 'Critical'
                ? 'var(--color-critical-text)'
                : riskScore.tier === 'High'
                  ? 'var(--color-high-text)'
                  : riskScore.tier === 'Medium'
                    ? 'var(--color-medium-text)'
                    : 'var(--color-low-text)',
              minWidth: 44,
              textAlign: 'right',
            }}
            aria-label={`Risk score: ${riskScore.score}`}
          >
            {riskScore.score}
          </span>
        </div>
      </div>

      {/* Factor breakdown toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`risk-factors-${riskScore.requirementId}`}
        style={{
          background: 'none',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '4px 12px',
          fontSize: 12,
          color: 'var(--color-muted)',
          cursor: 'pointer',
          marginBottom: expanded ? 14 : 0,
        }}
      >
        {expanded ? 'Hide factor breakdown' : 'Show factor breakdown'}
      </button>

      {/* Factor table */}
      {expanded && (
        <div id={`risk-factors-${riskScore.requirementId}`} style={{ overflowX: 'auto', marginTop: 2 }}>
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
            aria-label={`Risk factor breakdown for ${riskScore.requirementId}`}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th scope="col" style={{ textAlign: 'left', padding: '6px 12px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Factor</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 12px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Raw Value</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 12px 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Weight</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 0 8px 0', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Contribution</th>
              </tr>
            </thead>
            <tbody>
              {FACTOR_WEIGHTS.map(({ key, label, weight }) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th scope="row" style={{ textAlign: 'left', padding: '7px 12px 7px 0', fontWeight: 500, color: 'var(--color-text)' }}>{label}</th>
                  <td style={{ textAlign: 'right', padding: '7px 12px 7px 0', fontFamily: 'monospace', color: 'var(--color-muted)' }}>{getRawValue(riskScore, key)}</td>
                  <td style={{ textAlign: 'right', padding: '7px 12px 7px 0', color: 'var(--color-muted)', fontSize: 12 }}>{weight}</td>
                  <td style={{ textAlign: 'right', padding: '7px 0 7px 0', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text)' }}>
                    {getWeightedContribution(riskScore, key).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '2px solid var(--color-border)' }}>
                <th scope="row" style={{ textAlign: 'left', padding: '7px 12px 7px 0', fontWeight: 700, color: 'var(--color-text)' }}>Total Score</th>
                <td colSpan={2} />
                <td style={{ textAlign: 'right', padding: '7px 0 7px 0', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-text)' }}>
                  {riskScore.score}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

type SortField = 'score' | 'tier' | 'id';

export default function RiskDashboard({ scores, requirements }: Props): React.ReactElement {
  const [sortField, setSortField] = useState<SortField>('score');
  const reqMap = new Map(requirements.map((r) => [r.id, r]));

  const tierOrder: Record<RiskTier, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const sorted = [...scores].sort((a, b) => {
    if (sortField === 'score') return b.score - a.score;
    if (sortField === 'tier') return tierOrder[a.tier] - tierOrder[b.tier];
    return a.requirementId.localeCompare(b.requirementId);
  });

  // Summary counts
  const tierCounts = scores.reduce<Record<RiskTier, number>>(
    (acc, s) => { acc[s.tier] = (acc[s.tier] ?? 0) + 1; return acc; },
    { Critical: 0, High: 0, Medium: 0, Low: 0 },
  );

  return (
    <section aria-label="Risk dashboard">
      {/* Tier summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {(['Critical', 'High', 'Medium', 'Low'] as RiskTier[]).map((tier) => (
          <div key={tier} className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
            <p style={{ fontSize: 28, fontWeight: 700 }}>
              <span className={tierBadgeClass(tier)} style={{ fontSize: 22, padding: '2px 10px' }}>
                {tierCounts[tier]}
              </span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--color-muted)', marginTop: 6 }}>{tier} Risk</p>
          </div>
        ))}
      </div>

      {/* Sort control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <label htmlFor="risk-sort" style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          Sort by:
        </label>
        <select
          id="risk-sort"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          style={{
            padding: '5px 10px',
            fontSize: 13,
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          <option value="score">Score (High → Low)</option>
          <option value="tier">Risk Tier</option>
          <option value="id">Requirement ID</option>
        </select>
      </div>

      {/* Risk cards */}
      {sorted.map((rs) => (
        <RiskCard key={rs.requirementId} riskScore={rs} requirement={reqMap.get(rs.requirementId)} />
      ))}
    </section>
  );
}
