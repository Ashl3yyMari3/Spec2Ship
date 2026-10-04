import React, { useMemo, useState } from 'react';
import type {
  CoverageStatus,
  Criticality,
  Requirement,
  TestCase,
  TestStatus,
  TestType,
  TraceabilityMatrix,
} from '@backend/types/models';
import '../../styles/traceability.css';

export type CriticalityFilter = 'all' | Criticality;
export type CoverageFilter =
  | 'all'
  | 'full'
  | 'partial'
  | 'none';
export type ChangedFilter =
  | 'all'
  | 'changed'
  | 'unchanged';
export type TestTypeFilter = 'all' | TestType;
export type TestStatusFilter = 'all' | TestStatus;

export interface MatrixFilters {
  search: string;
  criticality: CriticalityFilter;
  coverage: CoverageFilter;
  changed: ChangedFilter;
  testType: TestTypeFilter;
  testStatus: TestStatusFilter;
}

export const DEFAULT_FILTERS: MatrixFilters = {
  search: '',
  criticality: 'all',
  coverage: 'all',
  changed: 'all',
  testType: 'all',
  testStatus: 'all',
};

type ViewMode = 'explorer' | 'matrix';

function linkedTestIds(
  req: Requirement,
  matrix: TraceabilityMatrix,
): Set<string> {
  const ids = new Set(
    matrix.links
      .filter(
        (link) =>
          link.requirementId === req.id,
      )
      .map((link) => link.testCaseId),
  );

  for (const testCase of matrix.testCases) {
    if (
      testCase.requirementIds.includes(req.id)
    ) {
      ids.add(testCase.id);
    }
  }

  return ids;
}

function linkedTests(
  req: Requirement,
  matrix: TraceabilityMatrix,
): TestCase[] {
  const ids = linkedTestIds(req, matrix);

  return matrix.testCases
    .filter((testCase) => ids.has(testCase.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function coveredCriteriaIndexes(
  req: Requirement,
  matrix: TraceabilityMatrix,
): Set<number> {
  const indexes = new Set<number>();

  for (const testCase of linkedTests(req, matrix)) {
    for (const ref of testCase.acceptanceCriteriaRefs) {
      if (
        ref.requirementId === req.id &&
        ref.criterionIndex >= 0 &&
        ref.criterionIndex <
          req.acceptanceCriteria.length
      ) {
        indexes.add(ref.criterionIndex);
      }
    }
  }

  return indexes;
}

export function computeCoverageStatus(
  req: Requirement,
  matrix: TraceabilityMatrix,
): CoverageStatus {
  const totalCriteria =
    req.acceptanceCriteria.length;
  const covered =
    coveredCriteriaIndexes(req, matrix).size;

  if (covered === 0) return 'none';

  if (covered < totalCriteria) {
    return 'partial';
  }

  return 'full';
}

export function getLinkedTestCount(
  req: Requirement,
  matrix: TraceabilityMatrix,
): number {
  return linkedTestIds(req, matrix).size;
}

function criticalityLabel(
  criticality: Criticality,
): string {
  return (
    criticality.charAt(0).toUpperCase() +
    criticality.slice(1)
  );
}

function coverageLabel(
  status: CoverageStatus,
): string {
  switch (status) {
    case 'full':
      return 'Full';
    case 'partial':
      return 'Partial';
    case 'none':
      return 'None';
    default:
      return status;
  }
}

function statusLabel(status: TestStatus): string {
  return status.replace('_', ' ');
}

function FilterBar({
  filters,
  onChange,
}: {
  filters: MatrixFilters;
  onChange: (filters: MatrixFilters) => void;
}): React.ReactElement {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.criticality !== 'all' ||
    filters.coverage !== 'all' ||
    filters.changed !== 'all' ||
    filters.testType !== 'all' ||
    filters.testStatus !== 'all';

  return (
    <div className="trace-filterbar">
      <label className="trace-filterbar__search">
        <span className="sr-only">
          Search requirements and linked tests
        </span>
        <input
          type="search"
          placeholder="Search requirement or linked test…"
          value={filters.search}
          onChange={(event) =>
            onChange({
              ...filters,
              search: event.target.value,
            })
          }
        />
      </label>

      <select
        value={filters.criticality}
        onChange={(event) =>
          onChange({
            ...filters,
            criticality:
              event.target
                .value as CriticalityFilter,
          })
        }
        aria-label="Filter by criticality"
      >
        <option value="all">
          All Criticalities
        </option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filters.coverage}
        onChange={(event) =>
          onChange({
            ...filters,
            coverage:
              event.target.value as CoverageFilter,
          })
        }
        aria-label="Filter by coverage"
      >
        <option value="all">All Coverage</option>
        <option value="full">Full</option>
        <option value="partial">Partial</option>
        <option value="none">None</option>
      </select>

      <select
        value={filters.testType}
        onChange={(event) =>
          onChange({
            ...filters,
            testType:
              event.target.value as TestTypeFilter,
          })
        }
        aria-label="Filter by linked test type"
      >
        <option value="all">
          All Test Types
        </option>
        <option value="functional">
          Functional
        </option>
        <option value="negative">Negative</option>
        <option value="boundary">Boundary</option>
        <option value="security">Security</option>
        <option value="edge">Edge</option>
      </select>

      <select
        value={filters.testStatus}
        onChange={(event) =>
          onChange({
            ...filters,
            testStatus:
              event.target
                .value as TestStatusFilter,
          })
        }
        aria-label="Filter by linked test status"
      >
        <option value="all">
          All Test Statuses
        </option>
        <option value="pass">Pass</option>
        <option value="fail">Fail</option>
        <option value="not_run">Not Run</option>
        <option value="blocked">Blocked</option>
      </select>

      <select
        value={filters.changed}
        onChange={(event) =>
          onChange({
            ...filters,
            changed:
              event.target.value as ChangedFilter,
          })
        }
        aria-label="Filter by changed status"
      >
        <option value="all">
          All Change States
        </option>
        <option value="changed">Changed</option>
        <option value="unchanged">
          Unchanged
        </option>
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          className="trace-filterbar__reset"
          onClick={() =>
            onChange(DEFAULT_FILTERS)
          }
        >
          Reset
        </button>
      )}
    </div>
  );
}

function RequirementRelationshipCard({
  requirement,
  matrix,
  selected,
  onSelect,
}: {
  requirement: Requirement;
  matrix: TraceabilityMatrix;
  selected: boolean;
  onSelect: (id: string) => void;
}): React.ReactElement {
  const tests = linkedTests(requirement, matrix);
  const covered =
    coveredCriteriaIndexes(
      requirement,
      matrix,
    );
  const coverage =
    computeCoverageStatus(
      requirement,
      matrix,
    );

  return (
    <article
      className={[
        'trace-requirement-card',
        selected
          ? 'trace-requirement-card--selected'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="trace-requirement-card__header">
        <div>
          <div className="trace-requirement-card__meta">
            <code>{requirement.id}</code>

            <span
              className={`trace-coverage trace-coverage--${coverage}`}
            >
              {coverageLabel(coverage)}
            </span>

            <span
              className={`badge badge--${requirement.criticality}`}
            >
              {criticalityLabel(
                requirement.criticality,
              )}
            </span>

            {requirement.changed && (
              <span className="badge badge--high">
                Changed
              </span>
            )}
          </div>

          <h2>{requirement.title}</h2>
          <p>{requirement.description}</p>
        </div>

        <div className="trace-requirement-card__counts">
          <div>
            <strong>
              {covered.size}/
              {requirement.acceptanceCriteria.length}
            </strong>
            <span>criteria mapped</span>
          </div>
          <div>
            <strong>{tests.length}</strong>
            <span>
              linked test
              {tests.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="trace-empty-link">
          <strong>No linked test cases</strong>
          <span>
            This requirement currently has no
            traceability relationship.
          </span>
        </div>
      ) : (
        <div className="trace-test-list">
          {tests.map((testCase) => {
            const refs =
              testCase.acceptanceCriteriaRefs
                .filter(
                  (ref) =>
                    ref.requirementId ===
                    requirement.id,
                )
                .map(
                  (ref) =>
                    ref.criterionIndex,
                )
                .filter(
                  (index) =>
                    index >= 0 &&
                    index <
                      requirement
                        .acceptanceCriteria
                        .length,
                )
                .sort((a, b) => a - b);

            const link = matrix.links.find(
              (item) =>
                item.requirementId ===
                  requirement.id &&
                item.testCaseId ===
                  testCase.id,
            );

            return (
              <div
                className="trace-test-row"
                key={testCase.id}
              >
                <div className="trace-test-row__identity">
                  <code>{testCase.id}</code>
                  <div>
                    <strong>
                      {testCase.title}
                    </strong>
                    <span>
                      {testCase.type}
                      {' · '}
                      {statusLabel(
                        testCase.status,
                      )}
                    </span>
                  </div>
                </div>

                <div className="trace-test-row__criteria">
                  {refs.length === 0 ? (
                    <span className="trace-test-row__unmapped">
                      No AC refs
                    </span>
                  ) : (
                    refs.map((index) => (
                      <span
                        key={index}
                        title={
                          requirement
                            .acceptanceCriteria[
                            index
                          ]
                        }
                      >
                        AC {index + 1}
                      </span>
                    ))
                  )}
                </div>

                <span
                  className={`trace-link-kind trace-link-kind--${link?.coverageType ?? 'mapped'}`}
                >
                  {link?.coverageType ??
                    'mapped'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="trace-requirement-card__footer">
        <div className="trace-ac-strip">
          {requirement.acceptanceCriteria.map(
            (_criterion, index) => (
              <span
                key={index}
                className={
                  covered.has(index)
                    ? 'is-covered'
                    : 'is-uncovered'
                }
                title={`AC ${index + 1}: ${
                  requirement
                    .acceptanceCriteria[index]
                }`}
              >
                AC {index + 1}
              </span>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onSelect(requirement.id)
          }
        >
          {selected
            ? 'Hide detail'
            : 'Open detail'}
        </button>
      </div>
    </article>
  );
}

function MatrixView({
  requirements,
  matrix,
}: {
  requirements: Requirement[];
  matrix: TraceabilityMatrix;
}): React.ReactElement {
  const relevantTestIds = new Set<string>();

  for (const requirement of requirements) {
    for (const id of linkedTestIds(
      requirement,
      matrix,
    )) {
      relevantTestIds.add(id);
    }
  }

  const tests = matrix.testCases
    .filter((testCase) =>
      relevantTestIds.has(testCase.id),
    )
    .sort((a, b) =>
      a.id.localeCompare(b.id),
    );

  if (
    requirements.length === 0 ||
    tests.length === 0
  ) {
    return (
      <div className="trace-empty-state">
        No requirement-to-test relationships match
        the current filters.
      </div>
    );
  }

  return (
    <div className="trace-matrix-wrap">
      <div className="trace-matrix__legend">
        <span>
          <i className="is-full" /> Full link
        </span>
        <span>
          <i className="is-partial" /> Partial link
        </span>
        <span>
          <i className="is-none" /> No link
        </span>
      </div>

      <div className="trace-matrix__scroll">
        <table
          className="trace-matrix"
          aria-label="Requirement to test relationship matrix"
        >
          <thead>
            <tr>
              <th className="trace-matrix__sticky">
                Requirement
              </th>
              {tests.map((testCase) => (
                <th
                  key={testCase.id}
                  title={testCase.title}
                >
                  <span>{testCase.id}</span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {requirements.map(
              (requirement) => (
                <tr key={requirement.id}>
                  <th
                    scope="row"
                    className="trace-matrix__sticky"
                  >
                    <code>
                      {requirement.id}
                    </code>
                    <span>
                      {requirement.title}
                    </span>
                  </th>

                  {tests.map((testCase) => {
                    const link =
                      matrix.links.find(
                        (item) =>
                          item.requirementId ===
                            requirement.id &&
                          item.testCaseId ===
                            testCase.id,
                      );

                    const mappedByTest =
                      testCase.requirementIds.includes(
                        requirement.id,
                      );

                    const refs =
                      testCase
                        .acceptanceCriteriaRefs
                        .filter(
                          (ref) =>
                            ref.requirementId ===
                            requirement.id,
                        )
                        .map(
                          (ref) =>
                            ref.criterionIndex,
                        )
                        .filter(
                          (index) =>
                            index >= 0 &&
                            index <
                              requirement
                                .acceptanceCriteria
                                .length,
                        )
                        .sort(
                          (a, b) => a - b,
                        );

                    const relation =
                      link?.coverageType ??
                      (mappedByTest
                        ? 'mapped'
                        : 'none');

                    return (
                      <td
                        key={testCase.id}
                        className={`trace-matrix__cell trace-matrix__cell--${relation}`}
                        title={
                          relation === 'none'
                            ? `${requirement.id} is not linked to ${testCase.id}`
                            : `${requirement.id} ↔ ${testCase.id}${refs.length ? ` · ${refs.map((index) => `AC ${index + 1}`).join(', ')}` : ''}`
                        }
                      >
                        {relation ===
                        'none' ? (
                          <span aria-hidden="true">
                            ·
                          </span>
                        ) : (
                          <>
                            <strong>
                              {relation ===
                              'full'
                                ? '✓'
                                : '◐'}
                            </strong>
                            {refs.length >
                              0 && (
                              <small>
                                {refs
                                  .map(
                                    (index) =>
                                      index + 1,
                                  )
                                  .join(',')}
                              </small>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <p className="trace-matrix__note">
        {requirements.length} requirement
        {requirements.length === 1
          ? ''
          : 's'}{' '}
        × {tests.length} linked test
        {tests.length === 1 ? '' : 's'}.
        Numbers inside cells are mapped acceptance
        criteria.
      </p>
    </div>
  );
}

function OrphanTests({
  matrix,
}: {
  matrix: TraceabilityMatrix;
}): React.ReactElement | null {
  const validRequirementIds = new Set(
    matrix.requirements.map(
      (requirement) => requirement.id,
    ),
  );

  const linkedIds = new Set(
    matrix.links.map(
      (link) => link.testCaseId,
    ),
  );

  const orphanTests = matrix.testCases.filter(
    (testCase) =>
      !linkedIds.has(testCase.id) &&
      !testCase.requirementIds.some((id) =>
        validRequirementIds.has(id),
      ),
  );

  if (orphanTests.length === 0) {
    return null;
  }

  return (
    <details className="trace-orphans">
      <summary>
        Unmapped tests ({orphanTests.length})
      </summary>

      <div>
        {orphanTests.map((testCase) => (
          <div key={testCase.id}>
            <code>{testCase.id}</code>
            <span>{testCase.title}</span>
            <em>{testCase.type}</em>
          </div>
        ))}
      </div>
    </details>
  );
}

interface Props {
  matrix: TraceabilityMatrix;
  selectedRequirementId: string | null;
  onSelectRequirement: (id: string) => void;
}

export default function TraceabilityMatrixExplorer({
  matrix,
  selectedRequirementId,
  onSelectRequirement,
}: Props): React.ReactElement {
  const [filters, setFilters] =
    useState<MatrixFilters>(
      DEFAULT_FILTERS,
    );
  const [viewMode, setViewMode] =
    useState<ViewMode>('explorer');

  const filteredRequirements = useMemo(
    () =>
      matrix.requirements.filter(
        (requirement) => {
          const tests = linkedTests(
            requirement,
            matrix,
          );

          const search =
            filters.search
              .trim()
              .toLowerCase();

          if (search) {
            const requirementMatch =
              requirement.id
                .toLowerCase()
                .includes(search) ||
              requirement.title
                .toLowerCase()
                .includes(search) ||
              requirement.description
                .toLowerCase()
                .includes(search);

            const testMatch = tests.some(
              (testCase) =>
                testCase.id
                  .toLowerCase()
                  .includes(search) ||
                testCase.title
                  .toLowerCase()
                  .includes(search),
            );

            if (
              !requirementMatch &&
              !testMatch
            ) {
              return false;
            }
          }

          if (
            filters.criticality !==
              'all' &&
            requirement.criticality !==
              filters.criticality
          ) {
            return false;
          }

          if (
            filters.coverage !== 'all' &&
            computeCoverageStatus(
              requirement,
              matrix,
            ) !== filters.coverage
          ) {
            return false;
          }

          if (
            filters.changed ===
              'changed' &&
            !requirement.changed
          ) {
            return false;
          }

          if (
            filters.changed ===
              'unchanged' &&
            requirement.changed
          ) {
            return false;
          }

          if (
            filters.testType !== 'all' &&
            !tests.some(
              (testCase) =>
                testCase.type ===
                filters.testType,
            )
          ) {
            return false;
          }

          if (
            filters.testStatus !==
              'all' &&
            !tests.some(
              (testCase) =>
                testCase.status ===
                filters.testStatus,
            )
          ) {
            return false;
          }

          return true;
        },
      ),
    [filters, matrix],
  );

  return (
    <section
      className="trace-explorer"
      aria-label="Traceability relationship explorer"
    >
      <div className="trace-explorer__toolbar">
        <div>
          <p>Relationship Explorer</p>
          <span>
            Follow requirements into their linked
            tests and acceptance-criteria mappings.
          </span>
        </div>

        <div
          className="trace-view-toggle"
          role="group"
          aria-label="Traceability view"
        >
          <button
            type="button"
            className={
              viewMode === 'explorer'
                ? 'is-active'
                : ''
            }
            onClick={() =>
              setViewMode('explorer')
            }
          >
            Explorer
          </button>

          <button
            type="button"
            className={
              viewMode === 'matrix'
                ? 'is-active'
                : ''
            }
            onClick={() =>
              setViewMode('matrix')
            }
          >
            Matrix
          </button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
      />

      <div className="trace-result-count">
        Showing{' '}
        <strong>
          {filteredRequirements.length}
        </strong>{' '}
        of {matrix.requirements.length}{' '}
        requirements
      </div>

      {filteredRequirements.length === 0 ? (
        <div className="trace-empty-state">
          {matrix.requirements.length === 0
            ? 'No requirements are available.'
            : 'No requirements match the current filters.'}
        </div>
      ) : viewMode === 'matrix' ? (
        <MatrixView
          requirements={filteredRequirements}
          matrix={matrix}
        />
      ) : (
        <div className="trace-requirement-list">
          {filteredRequirements.map(
            (requirement) => (
              <RequirementRelationshipCard
                key={requirement.id}
                requirement={requirement}
                matrix={matrix}
                selected={
                  selectedRequirementId ===
                  requirement.id
                }
                onSelect={
                  onSelectRequirement
                }
              />
            ),
          )}
        </div>
      )}

      <OrphanTests matrix={matrix} />
    </section>
  );
}
