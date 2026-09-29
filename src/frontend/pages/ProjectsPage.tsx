import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useProject } from '../context/ProjectContext';
import '../styles/projects.css';

interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDemo: boolean;
  requirementCount: number;
  testCount: number;
}

interface CreatedProject {
  id: string;
  name: string;
}

export default function ProjectsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data: projects, loading, error } =
    useApi<ProjectSummary[]>('/api/projects');
  const { selectedProjectId, selectProject } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] =
    useState<'blank' | 'shopsphere'>('blank');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function openProject(projectId: string): void {
    selectProject(projectId);
    navigate('/project/setup');
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!name.trim() || creating) return;

    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          template,
        }),
      });

      const payload = (await response.json()) as
        | CreatedProject
        | { error?: string };

      if (!response.ok || !('id' in payload)) {
        throw new Error(
          'error' in payload && payload.error
            ? payload.error
            : 'Could not create project.',
        );
      }

      selectProject(payload.id);
      navigate('/risk');
    } catch (err) {
      setCreateError(
        err instanceof Error
          ? err.message
          : 'Could not create project.',
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <p className="projects-page__eyebrow">Project Workspaces</p>
        <h1 className="page-header__title">Projects</h1>
        <p className="page-header__subtitle">
          Create or open a QA workspace. Every project keeps its own
          requirements, tests, traceability, risk, and release-readiness
          results.
        </p>
      </div>

      <div className="projects-layout">
        <section className="projects-panel">
          <div className="projects-panel__header">
            <div>
              <p className="projects-panel__eyebrow">Open Project</p>
              <h2>Your Workspaces</h2>
            </div>
            <span className="projects-panel__count">
              {projects?.length ?? 0}
            </span>
          </div>

          {loading && (
            <p className="state-message" role="status">
              Loading projects…
            </p>
          )}

          {error && !loading && (
            <div className="state-message state-message--error" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && projects && (
            <div className="projects-grid">
              {projects.map((project) => (
                <article
                  className={
                    'project-card' +
                    (project.id === selectedProjectId
                      ? ' project-card--selected'
                      : '')
                  }
                  key={project.id}
                >
                  <div className="project-card__topline">
                    <span
                      className={
                        project.isDemo
                          ? 'project-card__badge'
                          : 'project-card__badge project-card__badge--custom'
                      }
                    >
                      {project.isDemo ? 'Demo' : 'Project'}
                    </span>

                    {project.id === selectedProjectId && (
                      <span className="project-card__current">
                        Current
                      </span>
                    )}
                  </div>

                  <h3>{project.name}</h3>
                  <p className="project-card__description">
                    {project.description || 'No description yet.'}
                  </p>

                  <div className="project-card__stats">
                    <span>
                      <strong>{project.requirementCount}</strong>
                      Requirements
                    </span>
                    <span>
                      <strong>{project.testCount}</strong>
                      Seeded Tests
                    </span>
                  </div>

                  <button
                    type="button"
                    className="project-card__open"
                    onClick={() => openProject(project.id)}
                  >
                    Open Project
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="projects-panel projects-panel--create">
          <p className="projects-panel__eyebrow">New Workspace</p>
          <h2>Create Project</h2>
          <p className="projects-panel__intro">
            Start blank for your own application, or clone ShopSphere
            to experiment without changing the built-in demo.
          </p>

          <form className="project-create-form" onSubmit={handleCreate}>
            <label>
              <span>Project name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. SavoryStack API"
                maxLength={100}
                required
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="What are you testing?"
                rows={4}
                maxLength={500}
              />
            </label>

            <fieldset>
              <legend>Starting point</legend>

              <label className="project-template-option">
                <input
                  type="radio"
                  name="template"
                  value="blank"
                  checked={template === 'blank'}
                  onChange={() => setTemplate('blank')}
                />
                <span>
                  <strong>Blank Project</strong>
                  Add your own requirements and tests next.
                </span>
              </label>

              <label className="project-template-option">
                <input
                  type="radio"
                  name="template"
                  value="shopsphere"
                  checked={template === 'shopsphere'}
                  onChange={() => setTemplate('shopsphere')}
                />
                <span>
                  <strong>Clone ShopSphere</strong>
                  Copy the demo requirements, tests, and traceability.
                </span>
              </label>
            </fieldset>

            {createError && (
              <div className="projects-create-error" role="alert">
                {createError}
              </div>
            )}

            <button
              type="submit"
              className="project-create-submit"
              disabled={creating || !name.trim()}
            >
              {creating ? 'Creating…' : 'Create & Open Project'}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
