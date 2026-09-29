import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  Criticality,
  Requirement,
  TestCase,
  TestStatus,
  TestType,
  TraceabilityLink,
} from '@backend/types/models';
import { useProject } from '../context/ProjectContext';
import AIProjectTestGenerator from '../components/Projects/AIProjectTestGenerator';
import '../styles/project-setup.css';

interface ProjectWorkspace {
  id: string;
  name: string;
  shipKey: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  requirements: Requirement[];
  seededTests: TestCase[];
  traceabilityLinks: TraceabilityLink[];
}

const TEST_TYPES: TestType[] = [
  'functional',
  'negative',
  'boundary',
  'security',
  'edge',
];

const TEST_STATUSES: TestStatus[] = [
  'pass',
  'fail',
  'not_run',
  'blocked',
];

const CRITICALITIES: Criticality[] = [
  'low',
  'medium',
  'high',
  'critical',
];

export default function ProjectSetupPage(): React.ReactElement {
  const { selectedProjectId } = useProject();

  const [project, setProject] = useState<ProjectWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [reqTitle, setReqTitle] = useState('');
  const [reqDescription, setReqDescription] = useState('');
  const [reqAcceptance, setReqAcceptance] = useState('');
  const [reqDomain, setReqDomain] = useState('general');
  const [reqCriticality, setReqCriticality] =
    useState<Criticality>('medium');
  const [reqChanged, setReqChanged] = useState(false);
  const [savingRequirement, setSavingRequirement] = useState(false);
  const [requirementError, setRequirementError] =
    useState<string | null>(null);

  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testType, setTestType] =
    useState<TestType>('functional');
  const [testStatus, setTestStatus] =
    useState<TestStatus>('not_run');
  const [testRequirementId, setTestRequirementId] = useState('');
  const [testAutomated, setTestAutomated] = useState(false);
  const [testCoverageType, setTestCoverageType] =
    useState<'full' | 'partial'>('partial');
  const [testNotes, setTestNotes] = useState('');
  const [aiRequirementId, setAiRequirementId] = useState('');
  const [savingTest, setSavingTest] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  async function loadProject(): Promise<void> {
    setLoading(true);
    setPageError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(selectedProjectId)}`,
      );

      if (!response.ok) {
        throw new Error(
          `Could not load project (${response.status}).`,
        );
      }

      const payload = (await response.json()) as ProjectWorkspace;
      setProject(payload);

      setTestRequirementId((current) =>
        current ||
        payload.requirements[0]?.id ||
        '',
      );

      setAiRequirementId((current) =>
        payload.requirements.some(
          (requirement) => requirement.id === current,
        )
          ? current
          : payload.requirements[0]?.id ?? '',
      );
    } catch (err) {
      setPageError(
        err instanceof Error
          ? err.message
          : 'Could not load this project.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProject();
  }, [selectedProjectId]);

  const traceabilityCount = useMemo(
    () => project?.traceabilityLinks.length ?? 0,
    [project],
  );

  const aiRequirement = useMemo(
    () =>
      project?.requirements.find(
        (requirement) => requirement.id === aiRequirementId,
      ) ??
      project?.requirements[0] ??
      null,
    [project, aiRequirementId],
  );

  async function handleAddRequirement(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!project || project.isDemo || savingRequirement) return;

    const acceptanceCriteria = reqAcceptance
      .split('\n')
      .map((criterion) => criterion.trim())
      .filter(Boolean);

    setSavingRequirement(true);
    setRequirementError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.id)}/requirements`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: reqTitle.trim(),
            description: reqDescription.trim(),
            acceptanceCriteria,
            domain: reqDomain.trim() || 'general',
            criticality: reqCriticality,
            changed: reqChanged,
          }),
        },
      );

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? 'Could not add requirement.',
        );
      }

      setReqTitle('');
      setReqDescription('');
      setReqAcceptance('');
      setReqDomain('general');
      setReqCriticality('medium');
      setReqChanged(false);
      await loadProject();
    } catch (err) {
      setRequirementError(
        err instanceof Error
          ? err.message
          : 'Could not add requirement.',
      );
    } finally {
      setSavingRequirement(false);
    }
  }

  async function handleAddTest(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (
      !project ||
      project.isDemo ||
      savingTest ||
      !testRequirementId
    ) {
      return;
    }

    setSavingTest(true);
    setTestError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(project.id)}/tests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: testTitle.trim(),
            description: testDescription.trim(),
            type: testType,
            requirementIds: [testRequirementId],
            status: testStatus,
            automated: testAutomated,
            coverageType: testCoverageType,
            notes: testNotes.trim(),
          }),
        },
      );

      const payload = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? 'Could not add test case.',
        );
      }

      setTestTitle('');
      setTestDescription('');
      setTestType('functional');
      setTestStatus('not_run');
      setTestAutomated(false);
      setTestCoverageType('partial');
      setTestNotes('');
      await loadProject();
    } catch (err) {
      setTestError(
        err instanceof Error
          ? err.message
          : 'Could not add test case.',
      );
    } finally {
      setSavingTest(false);
    }
  }

  if (loading) {
    return (
      <p className="state-message" role="status">
        Loading project workspace…
      </p>
    );
  }

  if (pageError || !project) {
    return (
      <div className="state-message state-message--error" role="alert">
        {pageError ?? 'Project not found.'}
      </div>
    );
  }

  return (
    <>
      <div className="page-header project-setup__header">
        <div>
          <p className="project-setup__eyebrow">
            {project.isDemo ? 'Built-in Demo' : 'Project Workspace'}
          </p>
          <div className="project-setup__title-row">
            <h1 className="page-header__title">{project.name}</h1>
            <code className="project-setup__ship-key">
              Ship Key · {project.shipKey}
            </code>
          </div>
          <p className="page-header__subtitle">
            {project.description ||
              'Add requirements and tests, then let Spec2Ship calculate the QA evidence.'}
          </p>
        </div>

        <div className="project-setup__actions">
          <Link to="/requirements">Requirements</Link>
          <Link to="/risk">Risk Dashboard</Link>
          <Link to="/report">Release Readiness</Link>
          <Link to="/ai">Spec2Ship AI</Link>
          <Link to="/automation">Automation Center</Link>
        </div>
      </div>

      <section className="project-setup__stats" aria-label="Project counts">
        <div>
          <strong>{project.requirements.length}</strong>
          <span>Requirements</span>
        </div>
        <div>
          <strong>{project.seededTests.length}</strong>
          <span>Saved Tests</span>
        </div>
        <div>
          <strong>{traceabilityCount}</strong>
          <span>Traceability Links</span>
        </div>
      </section>

      {project.isDemo ? (
        <section className="project-setup__demo-note">
          <div>
            <strong>ShopSphere is read-only.</strong>
            <p>
              This is the built-in sample project that originally supplied
              Spec2Ship’s authentication requirements, test cases, and
              traceability data.
            </p>
          </div>
          <Link to="/projects">Create your own project</Link>
        </section>
      ) : (
        <div className="project-setup__forms">
          <section className="project-setup__panel">
            <p className="project-setup__eyebrow">Step 1</p>
            <h2>Add Requirement</h2>
            <p className="project-setup__intro">
              Add the behavior the product must support. Put one acceptance
              criterion on each line.
            </p>

            <form onSubmit={handleAddRequirement}>
              <div className="project-setup__row">
                <div className="project-setup__auto-id">
                  <span>Requirement ID</span>
                  <strong>{project.shipKey}-#</strong>
                  <small>
                    Spec2Ship assigns the next number automatically when you save.
                  </small>
                </div>

                <label>
                  <span>Criticality</span>
                  <select
                    value={reqCriticality}
                    onChange={(event) =>
                      setReqCriticality(
                        event.target.value as Criticality,
                      )
                    }
                  >
                    {CRITICALITIES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label>
                <span>Title</span>
                <input
                  value={reqTitle}
                  onChange={(event) => setReqTitle(event.target.value)}
                  placeholder="User Registration"
                  required
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  value={reqDescription}
                  onChange={(event) =>
                    setReqDescription(event.target.value)
                  }
                  placeholder="What must the product do?"
                  rows={3}
                  required
                />
              </label>

              <label>
                <span>Acceptance Criteria</span>
                <textarea
                  value={reqAcceptance}
                  onChange={(event) =>
                    setReqAcceptance(event.target.value)
                  }
                  placeholder={'Email is required\nEmail must be valid\nPassword must contain at least 8 characters'}
                  rows={6}
                  required
                />
              </label>

              <div className="project-setup__row">
                <label>
                  <span>Domain</span>
                  <input
                    value={reqDomain}
                    onChange={(event) =>
                      setReqDomain(event.target.value)
                    }
                    placeholder="authentication"
                  />
                </label>

                <label className="project-setup__check">
                  <input
                    type="checkbox"
                    checked={reqChanged}
                    onChange={(event) =>
                      setReqChanged(event.target.checked)
                    }
                  />
                  <span>Recently changed requirement</span>
                </label>
              </div>

              {requirementError && (
                <div className="project-setup__error" role="alert">
                  {requirementError}
                </div>
              )}

              <button
                type="submit"
                className="project-setup__submit"
                disabled={savingRequirement}
              >
                {savingRequirement
                  ? 'Saving Requirement…'
                  : 'Add Requirement'}
              </button>
            </form>
          </section>

          <section className="project-setup__panel">
            <p className="project-setup__eyebrow">Step 2</p>
            <h2>Add Test Case</h2>
            <p className="project-setup__intro">
              Save real test evidence and link it to a requirement. That link
              feeds traceability, coverage, risk, and release readiness.
            </p>

            {project.requirements.length === 0 ? (
              <div className="project-setup__empty">
                Add at least one requirement before creating test cases.
              </div>
            ) : (
              <form onSubmit={handleAddTest}>
                <div className="project-setup__row">
                  <div className="project-setup__auto-id">
                    <span>Test Case ID</span>
                    <strong>{project.shipKey}-T#</strong>
                    <small>
                      Manual, AI, and automation tests all use this same sequence.
                    </small>
                  </div>

                  <label>
                    <span>Linked Requirement</span>
                    <select
                      value={testRequirementId}
                      onChange={(event) =>
                        setTestRequirementId(event.target.value)
                      }
                      required
                    >
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

                <label>
                  <span>Title</span>
                  <input
                    value={testTitle}
                    onChange={(event) => setTestTitle(event.target.value)}
                    placeholder="Successful registration"
                    required
                  />
                </label>

                <label>
                  <span>Description</span>
                  <textarea
                    value={testDescription}
                    onChange={(event) =>
                      setTestDescription(event.target.value)
                    }
                    placeholder="Describe what this test validates."
                    rows={3}
                    required
                  />
                </label>

                <div className="project-setup__three">
                  <label>
                    <span>Type</span>
                    <select
                      value={testType}
                      onChange={(event) =>
                        setTestType(event.target.value as TestType)
                      }
                    >
                      {TEST_TYPES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Status</span>
                    <select
                      value={testStatus}
                      onChange={(event) =>
                        setTestStatus(
                          event.target.value as TestStatus,
                        )
                      }
                    >
                      {TEST_STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Coverage</span>
                    <select
                      value={testCoverageType}
                      onChange={(event) =>
                        setTestCoverageType(
                          event.target.value as 'full' | 'partial',
                        )
                      }
                    >
                      <option value="partial">partial</option>
                      <option value="full">full</option>
                    </select>
                  </label>
                </div>

                <label>
                  <span>Notes</span>
                  <textarea
                    value={testNotes}
                    onChange={(event) =>
                      setTestNotes(event.target.value)
                    }
                    placeholder="Optional execution notes."
                    rows={2}
                  />
                </label>

                <label className="project-setup__check">
                  <input
                    type="checkbox"
                    checked={testAutomated}
                    onChange={(event) =>
                      setTestAutomated(event.target.checked)
                    }
                  />
                  <span>Automated test</span>
                </label>

                {testError && (
                  <div className="project-setup__error" role="alert">
                    {testError}
                  </div>
                )}

                <button
                  type="submit"
                  className="project-setup__submit"
                  disabled={savingTest}
                >
                  {savingTest ? 'Saving Test…' : 'Add Test Case'}
                </button>
              </form>
            )}

            {project.requirements.length > 0 && aiRequirement && (
              <div className="project-setup__ai-addon">
                <div className="project-setup__ai-divider">
                  <span>or</span>
                </div>

                <div className="project-setup__ai-heading">
                  <div>
                    <p className="project-setup__eyebrow">AI Assist</p>
                    <h3>Generate Test Cases with AI</h3>
                    <p>
                      Don’t want to enter every test manually? Choose a
                      requirement and let Spec2Ship draft test scenarios for
                      you to review before saving.
                    </p>
                  </div>

                  <label>
                    <span>Requirement</span>
                    <select
                      value={aiRequirement.id}
                      onChange={(event) =>
                        setAiRequirementId(event.target.value)
                      }
                    >
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

                <AIProjectTestGenerator
                  projectId={project.id}
                  requirement={aiRequirement}
                  onSaved={loadProject}
                />

                <div className="project-setup__automation-link">
                  <span>Already have automated tests?</span>
                  <Link to="/automation">
                    ⚡ Import Playwright Results
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      <section className="project-setup__inventory">
        <div>
          <p className="project-setup__eyebrow">Current Evidence</p>
          <h2>Project Inventory</h2>
        </div>

        <div className="project-setup__inventory-grid">
          <div>
            <h3>Requirements</h3>
            {project.requirements.length === 0 ? (
              <p>No requirements yet.</p>
            ) : (
              <ul>
                {project.requirements.map((requirement) => (
                  <li key={requirement.id}>
                    <strong>{requirement.id}</strong>
                    <span>{requirement.title}</span>
                    <em>{requirement.criticality}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3>Saved Test Cases</h3>
            {project.seededTests.length === 0 ? (
              <p>No saved tests yet.</p>
            ) : (
              <ul>
                {project.seededTests.map((testCase) => (
                  <li key={testCase.id}>
                    <strong>{testCase.id}</strong>
                    <span>{testCase.title}</span>
                    <em>{testCase.status}</em>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
