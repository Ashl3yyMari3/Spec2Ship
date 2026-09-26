import React, { useState } from 'react';
import type { RiskScore, RiskTier, Requirement } from '@backend/types/models';

interface Props {
  scores: RiskScore[];
  requirements: Requirement[];
}

// --- Tier helpers ---

function tierOrbClass(tier: RiskTier): string {
  switch (tier) {
    case 'Critical': return 'risk-score-orb--critical';
    case 'High':     return 'risk-score-orb--high';
    case 'Medium':   return 'risk-score-orb--medium';
    case 'Low':      return 'risk-score-orb--low';
    default:         return '';
  }
}

function tierReqCardClass(tier: RiskTier): string {
  switch (tier) {
    case 'Critical': return 'risk-req-card risk-req-card--critical';
    case 'High':     return 'risk-req-card risk-req-card--high';
    case 'Medium':   return 'risk-req-card risk-req-card--medium';
    case 'Low':      return 'risk-req-card risk-req-card--low';
    default:         return 'risk-req-card';
  }
}

function tierBadgeClass(tier: RiskTier): string {
  switch (tier) {
    case 'Critical': return 'badge badge--critical';
    case 'High':     return 'badge badge--high';
    case 'Medium':   return 'badge badge--medium';
    case 'Low':      return 'badge badge--low';
    default:         return 'badge';
  }
}

function criticalityClass(c: string): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: string): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

// --- Planet SVGs for KPI cards ---
const PLANET_SVGS: Record<RiskTier, string> = {
  Critical: '/src/frontend/assets/cosmic/critical-planet.svg',
  High:     '/src/frontend/assets/cosmic/high-risk-planet.svg',
  Medium:   '/src/frontend/assets/cosmic/medium-risk-planet.svg',
  Low:      '/src/frontend/assets/cosmic/low-risk-planet.svg',
};

const TIER_ICONS: Record<RiskTier, React.ReactElement> = {
  Critical: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.5L13 12H1L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M7 5.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="7" cy="10" r="0.6" fill="currentColor"/>
    </svg>
  ),
  High: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 4.5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="7" cy="9.5" r="0.6" fill="currentColor"/>
    </svg>
  ),
  Medium: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 7h12M7 1l2 6-2 6-2-6 2-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Low: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7.5L5.5 11 12 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

const FACTOR_WEIGHTS: { key: string; label: string; weight: string }[] = [
  { key: 'criticality',           label: 'Criticality',              weight: '0.35' },
  { key: 'coverageGap',           label: 'Coverage Gap',             weight: '0.30' },
  { key: 'executionCompleteness', label: 'Execution Completeness',    weight: '0.20' },
  { key: 'changeImpact',          label: 'Change Impact',            weight: '0.15' },
];

function getRawValue(riskScore: RiskScore, key: string): number {
  switch (key) {
    case 'criticality':           return riskScore.factors.criticalityRaw;
    case 'coverageGap':           return riskScore.factors.coverageGapRaw;
    case 'executionCompleteness': return riskScore.factors.executionCompletenessRaw;
    case 'changeImpact':          return riskScore.factors.changeImpactRaw;
    default:                      return 0;
  }
}

function getWeightedContribution(riskScore: RiskScore, key: string): number {
  switch (key) {
    case 'criticality':           return riskScore.weightedContributions.criticality;
    case 'coverageGap':           return riskScore.weightedContributions.coverageGap;
    case 'executionCompleteness': return riskScore.weightedContributions.executionCompleteness;
    case 'changeImpact':          return riskScore.weightedContributions.changeImpact;
    default:                      return 0;
  }
}

// --- Chevron icon ---
function Chevron({ open }: { open: boolean }): React.ReactElement {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={{ transition: 'transform 0.18s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Risk Score Orb ---
function RiskScoreOrb({ score, tier }: { score: number; tier: RiskTier }): React.ReactElement {
  return (
    <div className={`risk-score-orb ${tierOrbClass(tier)}`} aria-label={`Risk score: ${score}`}>
      <div className="risk-score-orb__halo" />
      <div className="risk-score-orb__ring" />
      <div className="risk-score-orb__inner">
        <span className="risk-score-orb__value">{score}</span>
      </div>
    </div>
  );
}

// --- Individual Risk Card ---
function RiskCard({ riskScore, requirement }: { riskScore: RiskScore; requirement: Requirement | undefined }): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className={tierReqCardClass(riskScore.tier)}
      aria-labelledby={`risk-req-${riskScore.requirementId}`}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          {/* Requirement ID pill */}
          <p style={{
            display: 'inline-block',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--violet-light)',
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 8,
            padding: '2px 8px',
            marginBottom: 6,
            letterSpacing: '0.06em',
          }}>
            {riskScore.requirementId}
          </p>
          {requirement && (
            <h2
              id={`risk-req-${riskScore.requirementId}`}
              style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}
            >
              {requirement.title}
            </h2>
          )}
          {/* Meta badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {requirement && (
              <span className={criticalityClass(requirement.criticality)}>
                {criticalityLabel(requirement.criticality)}
              </span>
            )}
            <span className={tierBadgeClass(riskScore.tier)}>
              {riskScore.tier} Risk
            </span>
          </div>
        </div>

        {/* Risk Score Orb */}
        <RiskScoreOrb score={riskScore.score} tier={riskScore.tier} />
      </div>

      {/* Factor breakdown toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`risk-factors-${riskScore.requirementId}`}
        className="factor-toggle-btn"
      >
        <Chevron open={expanded} />
        {expanded ? 'Hide factor breakdown' : 'Show factor breakdown'}
      </button>

      {/* Factor breakdown panel */}
      {expanded && (
        <div
          id={`risk-factors-${riskScore.requirementId}`}
          className="factor-breakdown-panel"
        >
          <table
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}
            aria-label={`Risk factor breakdown for ${riskScore.requirementId}`}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass-bright)' }}>
                <th scope="col" style={{ textAlign: 'left', padding: '6px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Factor</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Raw Value</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 12px 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Weight</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 0 8px 0', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Contribution</th>
              </tr>
            </thead>
            <tbody>
              {FACTOR_WEIGHTS.map(({ key, label, weight }) => (
                <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th scope="row" style={{ textAlign: 'left', padding: '7px 12px 7px 0', fontWeight: 500, color: 'var(--text-secondary)', fontSize: 13 }}>{label}</th>
                  <td style={{ textAlign: 'right', padding: '7px 12px 7px 0', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: 13 }}>{getRawValue(riskScore, key)}</td>
                  <td style={{ textAlign: 'right', padding: '7px 12px 7px 0', color: 'var(--text-muted)', fontSize: 12 }}>{weight}</td>
                  <td style={{ textAlign: 'right', padding: '7px 0 7px 0', fontFamily: 'monospace', fontWeight: 600, color: 'var(--violet-light)', fontSize: 13 }}>
                    {getWeightedContribution(riskScore, key).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: '1px solid var(--border-glass-bright)' }}>
                <th scope="row" style={{ textAlign: 'left', padding: '8px 12px 7px 0', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>Total Score</th>
                <td colSpan={2} />
                <td style={{ textAlign: 'right', padding: '8px 0 7px 0', fontFamily: 'monospace', fontWeight: 800, color: 'var(--violet-light)', fontSize: 15 }}>
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
      {/* KPI cards grid */}
      <div className="risk-kpi-grid">
        {(['Critical', 'High', 'Medium', 'Low'] as RiskTier[]).map((tier) => (
          <div
            key={tier}
            className={`risk-kpi-card risk-kpi-card--${tier.toLowerCase()}`}
            aria-label={`${tier} risk: ${tierCounts[tier]} requirements`}
          >
            {/* Planet artwork */}
            <img
              src={PLANET_SVGS[tier]}
              alt=""
              aria-hidden="true"
              className="risk-kpi-card__planet"
            />
            {/* Status icon + label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4, position: 'relative', zIndex: 1 }}>
              <span style={{ color: tier === 'Critical' ? 'var(--critical-text)' : tier === 'High' ? 'var(--high-text)' : tier === 'Medium' ? 'var(--medium-text)' : 'var(--low-text)' }}>
                {TIER_ICONS[tier]}
              </span>
            </div>
            <p className="risk-kpi-card__value">{tierCounts[tier]}</p>
            <p className="risk-kpi-card__label">{tier} Risk</p>
            <p className="risk-kpi-card__sublabel">
              {tierCounts[tier] === 1 ? 'requirement' : 'requirements'}
            </p>
          </div>
        ))}
      </div>

      {/* Sort control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <label htmlFor="risk-sort" style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          Sort by:
        </label>
        <select
          id="risk-sort"
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          style={{ minWidth: 200 }}
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
