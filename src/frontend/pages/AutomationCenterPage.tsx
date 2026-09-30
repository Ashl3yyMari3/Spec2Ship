import React, { ChangeEvent, useMemo, useState } from 'react';
import type {
  Requirement,
  TestStatus,
  TestType,
} from '@backend/types/models';
import { useProject } from '../context/ProjectContext';
import { useApi } from '../hooks/useApi';
import '../styles/automation-center.css';

interface ProjectWorkspace {
  id: string;
  name: string;
  isDemo: boolean;
  requirements: Requirement[];
}

interface ImportedAutomationTest {
  key: string;
  id: string;
  title: string;
  description: string;
  status: TestStatus;
  type: TestType;
  requirementId: string;
  selected: boolean;
  sourceFile?: string;
  projectName?: string;
  durationMs?: number;
}

interface PlaywrightResult {
  status?: string;
  duration?: number;
}

interface PlaywrightTest {
  projectName?: string;
  results?: PlaywrightResult[];
  status?: string;
}

interface PlaywrightSpec {
  id?: string;
  title?: string;
  file?: string;
  tests?: PlaywrightTest[];
}

interface PlaywrightSuite {
  title?: string;
  file?: string;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightReport {
  suites?: PlaywrightSuite[];
}

function statusFromPlaywright(status?: string): TestStatus {
  switch (status) {
    case 'passed':
      return 'pass';
    case 'failed':
    case 'timedOut':
    case 'interrupted':
      return 'fail';
    case 'skipped':
      return 'not_run';
    default:
      return 'not_run';
  }
}

function stableHash(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36).toUpperCase();
}

function parsePlaywrightReport(
  report: PlaywrightReport,
): ImportedAutomationTest[] {
  const imported: ImportedAutomationTest[] = [];

  function visitSuite(
    suite: PlaywrightSuite,
    parents: string[],
  ): void {
    const nextParents = suite.title
      ? [...parents, suite.title]
      : parents;

    for (const spec of suite.specs ?? []) {
      const specTitle = spec.title?.trim() || 'Untitled Playwright test';

      for (const test of spec.tests ?? [{}]) {
        const lastResult =
          test.results && test.results.length > 0
            ? test.results[test.results.length - 1]
            : undefined;

        const status = statusFromPlaywright(
          lastResult?.status ?? test.status,
        );

        const fullTitle = [...nextParents, specTitle]
          .filter(Boolean)
          .join(' › ');

        const sourceFile = spec.file ?? suite.file;
        const identity = [
          sourceFile ?? '',
          fullTitle,
          test.projectName ?? '',
        ].join('|');

        imported.push({
          key: identity,
          id: `TC-AUTO-${stableHash(identity)}`,
          title: specTitle,
          description: fullTitle,
          status,
          type: 'functional',
          requirementId: '',
          selected: true,
          sourceFile,
          projectName: test.projectName,
          durationMs: lastResult?.duration,
        });
      }
    }

    for (const child of suite.suites ?? []) {
      visitSuite(child, nextParents);
    }
  }

  for (const suite of report.suites ?? []) {
    visitSuite(suite, []);
  }

  const seen = new Set<string>();

  return imported.filter((test) => {
    if (seen.has(test.key)) return false;
    seen.add(test.key);
    return true;
  });
}

export default function AutomationCenterPage(): React.ReactElement {
  const { selectedProjectId } = useProject();
  const {
    data: project,
    loading,
    error,
  } = useApi<ProjectWorkspace>(
    selectedProjectId
      ? `/api/projects/${encodeURIComponent(
          selectedProjectId,
        )}`
      : null,
  );

  const [tests, setTests] = useState<ImportedAutomationTest[]>([]);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const selectedTests = useMemo(
    () =>
      tests.filter(
        (test) => test.selected && test.requirementId,
      ),
    [tests],
  );

  const runSummary = useMemo(() => {
    return tests.reduce(
      (summary, test) => {
        summary.total += 1;
        summary[test.status] += 1;
        return summary;
      },
      {
        total: 0,
        pass: 0,
        fail: 0,
        not_run: 0,
        blocked: 0,
      },
    );
  }, [tests]);

  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) return;

    setParseError(null);
    setSaveError(null);
    setSavedCount(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as PlaywrightReport;
      const discovered = parsePlaywrightReport(parsed);

      if (discovered.length === 0) {
        throw new Error(
          'No Playwright tests were found in this JSON report.',
        );
      }

      const defaultRequirement =
        project?.requirements.length === 1
          ? project.requirements[0].id
          : '';

      setTests(
        discovered.map((test) => ({
          ...test,
          requirementId: defaultRequirement,
        })),
      );
    } catch (err) {
      setTests([]);
      setParseError(
        err instanceof Error
          ? err.message
          : 'Could not read the Playwright report.',
      );
    }
  }

  function updateTest(
    key: string,
    patch: Partial<ImportedAutomationTest>,
  ): void {
    setTests((current) =>
      current.map((test) =>
        test.key === key
          ? { ...test, ...patch }
          : test,
      ),
    );
  }

  function mapAll(requirementId: string): void {
    setTests((current) =>
      current.map((test) => ({
        ...test,
        requirementId,
      })),
    );
  }

  async function importSelected(): Promise<void> {
    if (!project || project.isDemo || selectedTests.length === 0) {
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSavedCount(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.id)}/tests/batch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tests: selectedTests.map((test) => ({
              id: test.id,
              title: test.title,
              description: test.description,
              type: test.type,
              requirementId: test.requirementId,
              status: test.status,
              automated: true,
              coverageType: 'partial',
              notes:
                'Imported from a Playwright JSON test report.',
              automation: {
                framework: 'playwright',
                sourceFile: test.sourceFile,
                projectName: test.projectName,
                durationMs: test.durationMs,
                importedAt: new Date().toISOString(),
              },
            })),
          }),
        },
      );

      const payload = (await response.json()) as {
        error?: string;
        addedCount?: number;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? 'Could not import automated tests.',
        );
      }

      setSavedCount(payload.addedCount ?? selectedTests.length);
      setTests([]);
      setFileName('');
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Could not import automated tests.',
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="state-message" role="status">
        Loading Automation Center…
      </p>
    );
  }

  if (error || !project) {
    return (
      <div className="state-message state-message--error" role="alert">
        {error ?? 'Project not found.'}
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <p className="automation-center__eyebrow">
          Automated Test Evidence
        </p>
        <h1 className="page-header__title">⚡ Automation Center</h1>
        <p className="page-header__subtitle">
          Import test-run evidence from your automation tools and connect it
          to Spec2Ship requirements.
        </p>
      </div>

      {project.isDemo && (
        <div className="automation-center__notice">
          ShopSphere is read-only. Create or clone a project before importing
          automation results.
        </div>
      )}

      <section className="automation-center__connect">
        <div>
          <p className="automation-center__eyebrow">Playwright</p>
          <h2>Import a JSON test report</h2>
          <p>
            Run your Playwright suite from VS Code, export the JSON report,
            then upload it here. Spec2Ship will read the latest status,
            source file, browser/project, and duration for each discovered
            automated test.
          </p>
        </div>

        <label
          className={
            'automation-center__upload' +
            (project.isDemo ? ' automation-center__upload--disabled' : '')
          }
        >
          <span>Choose Playwright JSON</span>
          <small>{fileName || 'No report selected'}</small>
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => void handleFile(event)}
            disabled={project.isDemo}
          />
        </label>
      </section>

      <section className="automation-center__command">
        <p>Generate a Playwright JSON report from your VS Code terminal:</p>
        <code>
          npx playwright test --reporter=json &gt; playwright-report.json
        </code>
      </section>

      {parseError && (
        <div className="automation-center__error" role="alert">
          {parseError}
        </div>
      )}

      {savedCount !== null && (
        <div className="automation-center__success" role="status">
          Imported {savedCount} automated test
          {savedCount === 1 ? '' : 's'} into {project.name}.
        </div>
      )}

      {tests.length > 0 && (
        <>
          <section className="automation-center__summary">
            <div>
              <strong>{runSummary.total}</strong>
              <span>Discovered</span>
            </div>
            <div>
              <strong>{runSummary.pass}</strong>
              <span>Passing</span>
            </div>
            <div>
              <strong>{runSummary.fail}</strong>
              <span>Failing</span>
            </div>
            <div>
              <strong>{runSummary.not_run}</strong>
              <span>Not Run</span>
            </div>
          </section>

          <section className="automation-center__mapping">
            <div className="automation-center__mapping-header">
              <div>
                <p className="automation-center__eyebrow">
                  Review & Trace
                </p>
                <h2>Map automated tests to requirements</h2>
              </div>

              <label>
                <span>Map all to</span>
                <select
                  defaultValue=""
                  onChange={(event) =>
                    mapAll(event.target.value)
                  }
                >
                  <option value="">Choose requirement…</option>
                  {project.requirements.map((requirement) => (
                    <option
                      key={requirement.id}
                      value={requirement.id}
                    >
                      {requirement.id} · {requirement.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {project.requirements.length === 0 && (
              <div className="automation-center__notice">
                Add at least one requirement in Project Setup before importing
                these results.
              </div>
            )}

            <div className="automation-center__tests">
              {tests.map((test) => (
                <article
                  className="automation-center__test"
                  key={test.key}
                >
                  <label className="automation-center__select">
                    <input
                      type="checkbox"
                      checked={test.selected}
                      onChange={(event) =>
                        updateTest(test.key, {
                          selected: event.target.checked,
                        })
                      }
                    />
                    <span>Import</span>
                  </label>

                  <div className="automation-center__test-copy">
                    <div className="automation-center__test-title">
                      <strong>{test.title}</strong>
                      <span
                        className={
                          'automation-center__status ' +
                          `automation-center__status--${test.status}`
                        }
                      >
                        {test.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p>{test.description}</p>

                    <div className="automation-center__meta">
                      {test.sourceFile && (
                        <code>{test.sourceFile}</code>
                      )}
                      {test.projectName && (
                        <span>{test.projectName}</span>
                      )}
                      {typeof test.durationMs === 'number' && (
                        <span>{test.durationMs} ms</span>
                      )}
                    </div>
                  </div>

                  <div className="automation-center__controls">
                    <label>
                      <span>Requirement</span>
                      <select
                        value={test.requirementId}
                        onChange={(event) =>
                          updateTest(test.key, {
                            requirementId: event.target.value,
                          })
                        }
                      >
                        <option value="">Choose…</option>
                        {project.requirements.map((requirement) => (
                          <option
                            key={requirement.id}
                            value={requirement.id}
                          >
                            {requirement.id}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>Test Type</span>
                      <select
                        value={test.type}
                        onChange={(event) =>
                          updateTest(test.key, {
                            type: event.target.value as TestType,
                          })
                        }
                      >
                        <option value="functional">functional</option>
                        <option value="negative">negative</option>
                        <option value="boundary">boundary</option>
                        <option value="security">security</option>
                        <option value="edge">edge</option>
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>

            {saveError && (
              <div className="automation-center__error" role="alert">
                {saveError}
              </div>
            )}

            <button
              type="button"
              className="automation-center__import"
              disabled={
                saving ||
                selectedTests.length === 0 ||
                project.requirements.length === 0
              }
              onClick={() => void importSelected()}
            >
              {saving
                ? 'Importing Automation…'
                : `Import Mapped Tests (${selectedTests.length})`}
            </button>
          </section>
        </>
      )}

      <section className="automation-center__roadmap">
        <p className="automation-center__eyebrow">Next Connections</p>
        <h2>Coming next</h2>
        <div>
          <span>GitHub Repository</span>
          <span>CI/CD Run Sync</span>
          <span>JUnit XML</span>
          <span>VS Code Extension</span>
        </div>
      </section>
    </>
  );
}
