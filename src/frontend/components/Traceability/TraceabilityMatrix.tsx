import React from 'react';
import type { Requirement, TraceabilityMatrix, Criticality } from '@backend/types/models';

// ---------------------------------------------------------------------------
// Coverage logic
// ---------------------------------------------------------------------------

export type CoverageStatus = 'full' | 'partial' | 'none';

export function computeCoverageStatus(
  req: Requirement,
  matrix: TraceabilityMatrix,
): CoverageStatus {
  const links = matrix.links.filter((l) => l.requirementId === req.id);
  if (links.length === 0) return 'none';
  if (links.every((l) => l.coverageType === 'full')) return 'full';
  return 'partial';
}

export function getLinkedTestCount(req: Requirement, matrix: TraceabilityMatrix): number {
  // Count unique test cases linked to this requirement via links OR requirementIds
  const linkIds = new Set(
    matrix.links
      .filter((l) => l.requirementId === req.id)
      .map((l) => l.testCaseId),
  );
  matrix.testCases.forEach((tc) => {
    if (tc.requirementIds.includes(req.id)) linkIds.add(tc.id);
  });
  return linkIds.size;
}

// ---------------------------------------------------------------------------
// Filters / Search
// ---------------------------------------------------------------------------

export type CriticalityFilter = 'all' | Criticality;
export type CoverageFilter = 'all' | 'full' | 'partial' | 'none';
export type ChangedFilter = 'all' | 'changed' | 'unchanged';

export interface MatrixFilters {
  search: string;
  criticality: CriticalityFilter;
  coverage: CoverageFilter;
  changed: ChangedFilter;
}

export const DEFAULT_FILTERS: MatrixFilters = {
  search: '',
  criticality: 'all',
  coverage: 'all',
  changed: 'all',
};

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

function criticalityClass(c: Criticality): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: Criticality): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function CoverageBadge({ status }: { status: CoverageStatus }): React.ReactElement {
  const styles: Record<CoverageStatus, React.CSSProperties> = {
    full: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' },
    partial: { background: '#fff7ed', color: '#9a3412', border: '1px solid #fdba74' },
    none: { background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' },
  };
  const labels: Record<CoverageStatus, string> = {
    full: 'Full',
    partial: 'Partial',
    none: 'No Coverage',
  };
  return (
    <span
      className="badge"
      style={styles[status]}
      aria-label={`Coverage: ${labels[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

interface FilterBarProps {
  filters: MatrixFilters;
  onChange: (f: MatrixFilters) => void;
}

function FilterBar({ filters, onChange }: FilterBarProps): React.ReactElement {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.criticality !== 'all' ||
    filters.coverage !== 'all' ||
    filters.changed !== 'all';

  const inputStyle: React.CSSProperties = {
    fontSize: '13px',
    padding: '5px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    height: '32px',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <input
        type="search"
        placeholder="Search by ID or title…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        aria-label="Search requirements"
        style={{ ...inputStyle, minWidth: '200px', flex: '1 1 200px' }}
      />

      <select
        value={filters.criticality}
        onChange={(e) => onChange({ ...filters, criticality: e.target.value as CriticalityFilter })}
        aria-label="Filter by criticality"
        style={selectStyle}
      >
        <option value="all">All Criticalities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filters.coverage}
        onChange={(e) => onChange({ ...filters, coverage: e.target.value as CoverageFilter })}
        aria-label="Filter by coverage"
        style={selectStyle}
      >
        <option value="all">All Coverage</option>
        <option value="full">Full</option>
        <option value="partial">Partial</option>
        <option value="none">No Coverage</option>
      </select>

      <select
        value={filters.changed}
        onChange={(e) => onChange({ ...filters, changed: e.target.value as ChangedFilter })}
        aria-label="Filter by changed status"
        style={selectStyle}
      >
        <option value="all">All Changed Status</option>
        <option value="changed">Changed</option>
        <option value="unchanged">Unchanged</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          aria-label="Reset all filters"
          style={{
            fontSize: '12px',
            padding: '5px 12px',
            height: '32px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main matrix component
// ---------------------------------------------------------------------------

interface Props {
  matrix: TraceabilityMatrix;
  selectedRequirementId: string | null;
  onSelectRequirement: (id: string) => void;
}

export default function TraceabilityMatrix({
  matrix,
  selectedRequirementId,
  onSelectRequirement,
}: Props): React.ReactElement {
  const [filters, setFilters] = React.useState<MatrixFilters>(DEFAULT_FILTERS);

  const filteredRequirements = React.useMemo(() => {
    return matrix.requirements.filter((req) => {
      const q = filters.search.trim().toLowerCase();
      if (q && !req.id.toLowerCase().includes(q) && !req.title.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.criticality !== 'all' && req.criticality !== filters.criticality) {
        return false;
      }
      if (filters.coverage !== 'all') {
        const status = computeCoverageStatus(req, matrix);
        if (status !== filters.coverage) return false;
      }
      if (filters.changed !== 'all') {
        if (filters.changed === 'changed' && !req.changed) return false;
        if (filters.changed === 'unchanged' && req.changed) return false;
      }
      return true;
    });
  }, [matrix, filters]);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />

      {filteredRequirements.length === 0 ? (
        <p className="state-message" role="status">
          {matrix.requirements.length === 0
            ? 'No requirements available.'
            : 'No requirements match your current filters.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13.5px',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-label="Traceability matrix"
          >
            <thead>
              <tr
                style={{
                  background: 'var(--color-surface)',
                  borderBottom: '2px solid var(--color-border)',
                }}
              >
                {['ID', 'Title', 'Criticality', 'Coverage', 'Tests', 'Changed'].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((req, idx) => {
                const coverageStatus = computeCoverageStatus(req, matrix);
                const testCount = getLinkedTestCount(req, matrix);
                const isSelected = req.id === selectedRequirementId;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequirement(req.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectRequirement(req.id);
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    aria-selected={isSelected}
                    style={{
                      cursor: 'pointer',
                      background: isSelected
                        ? '#eff6ff'
                        : isEven
                        ? 'var(--color-bg)'
                        : 'var(--color-surface)',
                      borderBottom: '1px solid var(--color-border)',
                      outline: isSelected ? '2px solid var(--color-accent)' : undefined,
                      outlineOffset: '-2px',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {req.id}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontWeight: isSelected ? 600 : 400,
                        color: 'var(--color-text)',
                        maxWidth: '300px',
                      }}
                    >
                      {req.title}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span className={criticalityClass(req.criticality)}>
                        {criticalityLabel(req.criticality)}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <CoverageBadge status={coverageStatus} />
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'center',
                        color: testCount === 0 ? 'var(--color-muted)' : 'var(--color-text)',
                        fontWeight: 500,
                      }}
                    >
                      {testCount}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      {req.changed ? (
                        <span className="badge badge--high">Changed</span>
                      ) : (
                        <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
