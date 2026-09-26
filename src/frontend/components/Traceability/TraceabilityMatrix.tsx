import React from 'react';
import type { Requirement, TraceabilityMatrix, Criticality, CoverageType } from '@backend/types/models';

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
  const classMap: Record<CoverageStatus, string> = {
    full:    'badge coverage-badge-full',
    partial: 'badge coverage-badge-partial',
    none:    'badge coverage-badge-none',
  };
  const labels: Record<CoverageStatus, string> = {
    full:    'Full',
    partial: 'Partial',
    none:    'No Coverage',
  };
  return (
    <span
      className={classMap[status]}
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

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '14px 18px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <input
        type="search"
        placeholder="Search by ID or title…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        aria-label="Search requirements"
        style={{ minWidth: '200px', flex: '1 1 200px' }}
      />

      <select
        value={filters.criticality}
        onChange={(e) => onChange({ ...filters, criticality: e.target.value as CriticalityFilter })}
        aria-label="Filter by criticality"
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
      >
        <option value="all">All Changed Status</option>
        <option value="changed">Changed</option>
        <option value="unchanged">Unchanged</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          aria-label="Reset all filters"
          className="btn"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Requirement × Test-Case Grid
// ---------------------------------------------------------------------------

/** Returns the link coverage type between a requirement and a test case, or null if uncovered. */
function getCellCoverage(
  reqId: string,
  tcId: string,
  matrix: TraceabilityMatrix,
): CoverageType | null {
  const link = matrix.links.find(
    (l) => l.requirementId === reqId && l.testCaseId === tcId,
  );
  return link ? link.coverageType : null;
}

interface GridCellProps {
  reqId: string;
  tcId: string;
  coverage: CoverageType | null;
}

function GridCell({ reqId, tcId, coverage }: GridCellProps): React.ReactElement {
  let symbol: string;
  let label: string;
  let ariaLabel: string;
  let cellStyle: React.CSSProperties;

  if (coverage === 'full') {
    symbol = '✓';
    label = 'Full';
    ariaLabel = `${reqId} covered by ${tcId}`;
    cellStyle = {
      background: 'rgba(16, 185, 129, 0.12)',
      color: 'var(--low-text)',
      fontWeight: 700,
    };
  } else if (coverage === 'partial') {
    symbol = '◐';
    label = 'Partial';
    ariaLabel = `${reqId} partially covered by ${tcId}`;
    cellStyle = {
      background: 'rgba(249, 115, 22, 0.12)',
      color: 'var(--high-text)',
      fontWeight: 700,
    };
  } else {
    symbol = '—';
    label = 'None';
    ariaLabel = `${reqId} not covered by ${tcId}`;
    cellStyle = {
      background: 'transparent',
      color: 'var(--text-muted)',
    };
  }

  return (
    <td
      aria-label={ariaLabel}
      style={{
        padding: '8px 6px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        whiteSpace: 'nowrap',
        ...cellStyle,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: '13px', display: 'block', lineHeight: 1 }}>
        {symbol}
      </span>
      <span
        style={{
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'block',
          marginTop: '2px',
          fontWeight: 600,
        }}
      >
        {label}
      </span>
    </td>
  );
}

interface RequirementTestGridProps {
  requirements: Requirement[];
  matrix: TraceabilityMatrix;
}

function RequirementTestGrid({
  requirements,
  matrix,
}: RequirementTestGridProps): React.ReactElement {
  // Collect the set of test cases that appear in at least one link involving
  // any of the currently visible requirements, then fall back to all test cases
  // that are linked to any requirement.  Keep ordering stable (by tc.id).
  const visibleReqIds = new Set(requirements.map((r) => r.id));

  const relevantTcIds = new Set<string>();
  for (const link of matrix.links) {
    if (visibleReqIds.has(link.requirementId)) {
      relevantTcIds.add(link.testCaseId);
    }
  }

  // Also include test cases referenced via testCase.requirementIds (mirrors
  // the logic in getLinkedTestCount so the grid stays consistent).
  for (const tc of matrix.testCases) {
    if (tc.requirementIds.some((rid) => visibleReqIds.has(rid))) {
      relevantTcIds.add(tc.id);
    }
  }

  const tcById = new Map(matrix.testCases.map((tc) => [tc.id, tc]));
  const columns = Array.from(relevantTcIds)
    .map((id) => tcById.get(id))
    .filter((tc): tc is NonNullable<typeof tc> => tc !== undefined)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (columns.length === 0) {
    return (
      <p
        className="state-message"
        role="status"
        style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}
      >
        No test cases are linked to the visible requirements.
      </p>
    );
  }

  const gridSectionHeadingStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'var(--text-muted)',
    margin: '0 0 8px 0',
  };

  const legendItems: { symbol: string; label: string; style: React.CSSProperties }[] = [
    { symbol: '✓', label: 'Full coverage',    style: { color: 'var(--low-text)', fontWeight: 700 } },
    { symbol: '◐', label: 'Partial coverage', style: { color: 'var(--high-text)', fontWeight: 700 } },
    { symbol: '—', label: 'No coverage',      style: { color: 'var(--text-muted)' } },
  ];

  return (
    <div style={{ marginTop: '28px' }}>
      {/* Section heading */}
      <h2
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}
      >
        Requirement × Test-Case Coverage Grid
      </h2>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '10px',
        }}
        aria-label="Grid legend"
      >
        {legendItems.map(({ symbol, label, style }) => (
          <span
            key={label}
            style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center' }}
          >
            <span style={{ fontSize: '14px', ...style }} aria-hidden="true">{symbol}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Scrollable container */}
      <div
        style={{
          overflowX: 'auto',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            fontSize: '12px',
            background: 'transparent',
            tableLayout: 'auto',
          }}
          aria-label="Requirement by test-case coverage grid"
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-glass-bright)' }}>
              {/* Top-left corner cell */}
              <th
                scope="col"
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontWeight: 700,
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid var(--border-glass-bright)',
                  minWidth: '140px',
                  position: 'sticky',
                  left: 0,
                  background: 'var(--bg-surface)',
                  zIndex: 1,
                }}
              >
                Requirement
              </th>
              {columns.map((tc) => (
                <th
                  key={tc.id}
                  scope="col"
                  title={tc.title}
                  style={{
                    padding: '8px 6px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid rgba(255,255,255,0.04)',
                    maxWidth: '90px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    height: '80px',
                    verticalAlign: 'bottom',
                  }}
                >
                  {tc.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requirements.map((req, idx) => (
              <tr
                key={req.id}
                style={{
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                {/* Row header — sticky so requirement ID stays visible while scrolling */}
                <th
                  scope="row"
                  style={{
                    padding: '8px 14px',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--violet-light)',
                    whiteSpace: 'nowrap',
                    borderRight: '1px solid var(--border-glass-bright)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    position: 'sticky',
                    left: 0,
                    background: idx % 2 === 0 ? 'var(--bg-surface)' : 'rgba(17,22,47,0.95)',
                    zIndex: 1,
                  }}
                >
                  {req.id}
                </th>
                {columns.map((tc) => (
                  <GridCell
                    key={tc.id}
                    reqId={req.id}
                    tcId={tc.id}
                    coverage={getCellCoverage(req.id, tc.id, matrix)}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Column count note */}
      <p style={{ ...gridSectionHeadingStyle, marginTop: '8px' }} aria-live="polite">
        {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} ×{' '}
        {columns.length} test case{columns.length !== 1 ? 's' : ''}
      </p>
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
        <>
          {/* Requirements summary table */}
          <div
            style={{
              overflowX: 'auto',
              background: 'var(--bg-glass)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13.5px',
                background: 'transparent',
              }}
              aria-label="Requirements summary table"
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass-bright)' }}>
                  {['ID', 'Title', 'Criticality', 'Coverage', 'Tests', 'Changed'].map((col) => (
                    <th
                      key={col}
                      scope="col"
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        fontWeight: 700,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                        color: 'var(--text-muted)',
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
                          ? 'rgba(139, 92, 246, 0.15)'
                          : isEven
                          ? 'transparent'
                          : 'rgba(255,255,255,0.02)',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        outline: isSelected ? '2px solid var(--violet)' : undefined,
                        outlineOffset: '-2px',
                        transition: 'background 0.12s',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 14px',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: 'var(--violet-light)',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {req.id}
                      </td>
                      <td
                        style={{
                          padding: '10px 14px',
                          fontWeight: isSelected ? 600 : 400,
                          color: 'var(--text-primary)',
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
                          color: testCount === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontWeight: 500,
                        }}
                      >
                        {testCount}
                      </td>
                      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                        {req.changed ? (
                          <span className="badge badge--high">Changed</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Requirement × Test-Case Coverage Grid */}
          <RequirementTestGrid requirements={filteredRequirements} matrix={matrix} />
        </>
      )}
    </div>
  );
}
