import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useProject } from '../context/ProjectContext';
import '../styles/projects.css';

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

interface CreatedProject {
  id: string;
  name: string;
  shipKey: string;
}

export default function ProjectsPage(): React.ReactElement {
  const navigate = useNavigate();
  const { data: projects, loading, error } =
    useApi<ProjectSummary[]>('/api/projects');
  const { selectedProjectId, selectProject } = useProject();

  const [name, setName] = useState('');
  const [shipKey, setShipKey] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] =
    useState<'blank' | 'shopsphere'>('blank');
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function resetCreateForm(): void {
    setName('');
    setShipKey('');
    setDescription('');
    setTemplate('blank');
    setCreateError(null);
  }

  function closeCreatePanel(): void {
    if (creating) return;
    resetCreateForm();
    setCreateOpen(false);
  }

  function openProject(projectId: string): void {
    selectProject(projectId);
    navigate('/project/setup');
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!name.trim() || !shipKey.trim() || creating) return;

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
          shipKey: shipKey.trim().toUpperCase(),
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
      navigate('/project/setup');
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
      <div className="page-header projects-page__header">
        <div>
          <p className="projects-page__eyebrow">Project Workspaces</p>
          <h1 className="page-header__title">Projects</h1>
          <p className="page-header__subtitle">
            Open a workspace to continue testing, or create a new one when
            you are ready to bring another project into Spec2Ship.
          </p>
        </div>

        <button
          type="button"
          className={
            'projects-page__new-button' +
            (createOpen ? ' projects-page__new-button--open' : '')
          }
          onClick={() => {
            if (createOpen) {
              closeCreatePanel();
            } else {
              setCreateOpen(true);
              setCreateError(null);
            }
          }}
          aria-expanded={createOpen}
          aria-controls="new-workspace-panel"
        >
          <span aria-hidden="true">{createOpen ? '×' : '+'}</span>
          {createOpen ? 'Close' : 'New Workspace'}
        </button>
      </div>

      {createOpen && (
        <section
          className="projects-create-drawer"
          id="new-workspace-panel"
        >
          <div className="projects-create-drawer__header">
            <div>
              <p className="projects-panel__eyebrow">New Workspace</p>
              <h2>Create Project</h2>
              <p>
                Choose a Ship Key once. Spec2Ship will use it to generate
                requirement and test IDs automatically.
              </p>
            </div>

            <button
              type="button"
              className="projects-create-drawer__cancel"
              onClick={closeCreatePanel}
              disabled={creating}
            >
              Cancel
            </button>
          </div>

          <form className="project-create-form" onSubmit={handleCreate}>
            <div className="project-create-form__grid">
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
                <span>Ship Key</span>
                <input
                  value={shipKey}
                  onChange={(event) =>
                    setShipKey(
                      event.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 8),
                    )
                  }
                  placeholder="e.g. SAV"
                  minLength={2}
                  maxLength={8}
                  pattern="[A-Z][A-Z0-9]{1,7}"
                  required
                />
                <small className="project-create-form__help">
                  2–8 letters or numbers, starting with a letter.
                </small>

                {shipKey.length >= 2 && (
                  <div className="project-create-form__id-preview">
                    <span>
                      Requirement → <strong>{shipKey}-1</strong>
                    </span>
                    <span>
                      Test → <strong>{shipKey}-T1</strong>
                    </span>
                  </div>
                )}
              </label>
            </div>

            <label>
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="What are you testing?"
                rows={3}
                maxLength={500}
              />
            </label>

            <fieldset>
              <legend>Starting point</legend>

              <div className="project-create-form__templates">
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
                    Start with demo evidence remapped to your Ship Key.
                  </span>
                </label>
              </div>
            </fieldset>

            {createError && (
              <div className="projects-create-error" role="alert">
                {createError}
              </div>
            )}

            <div className="project-create-form__actions">
              <button
                type="button"
                className="project-create-cancel"
                onClick={closeCreatePanel}
                disabled={creating}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="project-create-submit"
                disabled={
                  creating ||
                  !name.trim() ||
                  !/^[A-Z][A-Z0-9]{1,7}$/.test(shipKey)
                }
              >
                {creating ? 'Creating…' : 'Create & Open Project'}
              </button>
            </div>
          </form>
        </section>
      )}

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

                  <div className="project-card__identity">
                    <h3>{project.name}</h3>
                    <code>{project.shipKey}</code>
                  </div>
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
                      Test Cases
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

      </div>
    </>
  );
}
