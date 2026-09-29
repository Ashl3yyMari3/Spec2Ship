import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type {
  ReleaseReadinessReport,
  RiskScore,
  TestCase,
} from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import { useProject } from '../context/ProjectContext';
import '../styles/home.css';

interface ProjectSummary {
  id: string;
  name: string;
  shipKey: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  requirementCount: number;
  testCount: number;
}

function verdictClass(verdict?: string): string {
  if (verdict === 'Ready') return 'home-verdict--ready';
  if (verdict === 'Not Ready') return 'home-verdict--not-ready';
  return 'home-verdict--review';
}

export default function HomePage(): React.ReactElement {
  const navigate = useNavigate();
  const { selectedProjectId, selectProject } = useProject();

  const {
    data: projects,
    loading: projectsLoading,
    error: projectsError,
  } = useApi<ProjectSummary[]>('/api/projects');

  const {
    data: release,
    loading: releaseLoading,
  } = useApi<ReleaseReadinessReport>('/api/release-readiness');

  const { data: riskScores } =
    useApi<RiskScore[]>('/api/risk');

  const { data: tests } =
    useApi<TestCase[]>('/api/tests');

  const currentProject = useMemo(
    () =>
      projects?.find(
        (project) => project.id === selectedProjectId,
      ) ?? null,
    [projects, selectedProjectId],
  );

  const recentProjects = useMemo(
    () =>
      (projects ?? [])
        .filter((project) => !project.isDemo)
        .sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        )
        .slice(0, 4),
    [projects],
  );

  const highRiskCount = useMemo(
    () =>
      (riskScores ?? []).filter(
        (score) =>
          score.tier === 'High' ||
          score.tier === 'Critical',
      ).length,
    [riskScores],
  );

  const automatedCount = useMemo(
    () =>
      (tests ?? []).filter(
        (testCase) => testCase.automated,
      ).length,
    [tests],
  );

  function openProject(projectId: string): void {
    selectProject(projectId);
    navigate('/project/setup');
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__copy">
          <p className="home-eyebrow">
            Release Intelligence Workspace
          </p>
          <h1>
            Welcome to <span>Spec2Ship</span>
          </h1>
          <p>
            Turn requirements, tests, automation, risk, and
            release evidence into one traceable ship decision.
          </p>

          <div className="home-hero__actions">
            <Link
              to="/projects"
              className="home-button home-button--primary"
            >
              <span aria-hidden="true">+</span>
              New Workspace
            </Link>

            <Link
              to="/projects"
              className="home-button home-button--secondary"
            >
              Open Workspace
            </Link>
          </div>
        </div>

        <div
          className="home-hero__signal"
          aria-hidden="true"
        >
          <div className="home-orbit home-orbit--outer" />
          <div className="home-orbit home-orbit--inner" />
          <div className="home-orbit__core">S2S</div>
          <span className="home-orbit__node home-orbit__node--one" />
          <span className="home-orbit__node home-orbit__node--two" />
          <span className="home-orbit__node home-orbit__node--three" />
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__heading">
          <div>
            <p className="home-eyebrow">
              Current Project
            </p>
            <h2>Release Snapshot</h2>
          </div>

          {currentProject && (
            <Link
              to="/project/setup"
              className="home-text-link"
            >
              Continue Project →
            </Link>
          )}
        </div>

        <div className="home-snapshot">
          <article className="home-current-project">
            {projectsLoading ? (
              <p className="home-muted">Loading project…</p>
            ) : currentProject ? (
              <>
                <div className="home-current-project__top">
                  <div>
                    <code>{currentProject.shipKey}</code>
                    <h3>{currentProject.name}</h3>
                  </div>
                  {currentProject.isDemo && (
                    <span className="home-demo-badge">
                      Demo
                    </span>
                  )}
                </div>

                <p>
                  {currentProject.description ||
                    'No project description yet.'}
                </p>

                <div className="home-current-project__meta">
                  <span>
                    <strong>
                      {currentProject.requirementCount}
                    </strong>
                    Requirements
                  </span>
                  <span>
                    <strong>{currentProject.testCount}</strong>
                    Saved Tests
                  </span>
                  <span>
                    <strong>{automatedCount}</strong>
                    Automated
                  </span>
                </div>
              </>
            ) : (
              <div className="home-empty">
                <strong>No project selected</strong>
                <p>
                  Open a workspace to see its release snapshot.
                </p>
                <Link to="/projects">Choose Project</Link>
              </div>
            )}
          </article>

          <article className="home-release-card">
            <div className="home-release-card__header">
              <span>Release Verdict</span>
              {!releaseLoading && release && (
                <strong
                  className={
                    'home-verdict ' +
                    verdictClass(
                      release.overallVerdict,
                    )
                  }
                >
                  {release.overallVerdict}
                </strong>
              )}
            </div>

            {releaseLoading ? (
              <p className="home-muted">
                Calculating release evidence…
              </p>
            ) : release ? (
              <>
                <div className="home-release-metrics">
                  <div>
                    <strong>
                      {release.coveragePercentage}%
                    </strong>
                    <span>Coverage</span>
                  </div>
                  <div>
                    <strong>
                      {release.summary.passingTests}
                    </strong>
                    <span>Passing</span>
                  </div>
                  <div>
                    <strong>
                      {release.summary.failingTests}
                    </strong>
                    <span>Failing</span>
                  </div>
                  <div>
                    <strong>{highRiskCount}</strong>
                    <span>High/Critical Risk</span>
                  </div>
                </div>

                <p className="home-release-card__rationale">
                  {release.verdictRationale}
                </p>

                <Link
                  to="/report"
                  className="home-release-card__open"
                >
                  Review Release Evidence
                </Link>
              </>
            ) : (
              <p className="home-muted">
                Release evidence is not available yet.
              </p>
            )}
          </article>
        </div>
      </section>

      <div className="home-lower-grid">
        <section className="home-section home-section--recent">
          <div className="home-section__heading">
            <div>
              <p className="home-eyebrow">
                Workspaces
              </p>
              <h2>Recent Projects</h2>
            </div>

            <Link
              to="/projects"
              className="home-text-link"
            >
              View All →
            </Link>
          </div>

          {projectsError && (
            <div
              className="home-error"
              role="alert"
            >
              {projectsError}
            </div>
          )}

          {!projectsLoading &&
            !projectsError &&
            recentProjects.length === 0 && (
              <div className="home-empty home-empty--panel">
                <strong>No custom projects yet</strong>
                <p>
                  Create your first workspace and give it
                  a Ship Key.
                </p>
                <Link to="/projects">
                  + New Workspace
                </Link>
              </div>
            )}

          <div className="home-project-list">
            {recentProjects.map((project) => (
              <button
                type="button"
                className={
                  'home-project-row' +
                  (project.id === selectedProjectId
                    ? ' home-project-row--current'
                    : '')
                }
                key={project.id}
                onClick={() =>
                  openProject(project.id)
                }
              >
                <span className="home-project-row__key">
                  {project.shipKey}
                </span>

                <span className="home-project-row__copy">
                  <strong>{project.name}</strong>
                  <small>
                    {project.requirementCount}{' '}
                    requirements · {project.testCount}{' '}
                    tests
                  </small>
                </span>

                <span className="home-project-row__arrow">
                  →
                </span>
              </button>
            ))}
          </div>

          {projects && (
            <button
              type="button"
              className="home-project-row home-project-row--demo"
              onClick={() =>
                openProject('shopsphere-demo')
              }
            >
              <span className="home-project-row__key">
                SHOP
              </span>

              <span className="home-project-row__copy">
                <strong>ShopSphere Demo</strong>
                <small>
                  Built-in read-only sample workspace
                </small>
              </span>

              <span className="home-project-row__arrow">
                →
              </span>
            </button>
          )}
        </section>

        <section className="home-section home-section--quick">
          <div className="home-section__heading">
            <div>
              <p className="home-eyebrow">
                Shortcuts
              </p>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="home-quick-actions">
            <Link to="/project/setup">
              <span className="home-quick-actions__icon">
                ◈
              </span>
              <span>
                <strong>Project Setup</strong>
                <small>
                  Add requirements and test evidence
                </small>
              </span>
            </Link>

            <Link to="/automation">
              <span className="home-quick-actions__icon">
                ⚡
              </span>
              <span>
                <strong>Import Automation</strong>
                <small>
                  Bring in Playwright run results
                </small>
              </span>
            </Link>

            <Link to="/risk">
              <span className="home-quick-actions__icon">
                △
              </span>
              <span>
                <strong>Risk Dashboard</strong>
                <small>
                  Review weighted requirement risk
                </small>
              </span>
            </Link>

            <Link to="/ai">
              <span className="home-quick-actions__icon">
                ✦
              </span>
              <span>
                <strong>Open Spec2Ship AI</strong>
                <small>
                  Ask questions about QA evidence
                </small>
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
