import React, {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
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

interface DeleteResponse {
  deleted: boolean;
  project: ProjectSummary;
}

export default function ProjectsPage(): React.ReactElement {
  const navigate = useNavigate();
  const {
    data: projects,
    loading,
    error,
  } = useApi<ProjectSummary[]>('/api/projects');

  const {
    selectedProjectId,
    selectProject,
    closeProject,
  } = useProject();

  const [projectList, setProjectList] =
    useState<ProjectSummary[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [shipKey, setShipKey] = useState('');
  const [description, setDescription] = useState('');
  const [template, setTemplate] =
    useState<'blank' | 'shopsphere'>('blank');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] =
    useState<string | null>(null);

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<ProjectSummary | null>(null);
  const [deleteKey, setDeleteKey] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] =
    useState<string | null>(null);
  const [notice, setNotice] =
    useState<string | null>(null);

  useEffect(() => {
    if (projects) {
      setProjectList(projects);
    }
  }, [projects]);

  const demoProject = useMemo(
    () =>
      projectList.find((project) => project.isDemo) ??
      null,
    [projectList],
  );

  const customProjects = useMemo(
    () =>
      projectList
        .filter((project) => !project.isDemo)
        .sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        ),
    [projectList],
  );

  const deleteConfirmed =
    deleteTarget !== null &&
    deleteKey.trim().toUpperCase() ===
      deleteTarget.shipKey;

  function openProject(projectId: string): void {
    selectProject(projectId);
    setOpenMenuId(null);
    navigate('/project/setup');
  }

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

  function openDeleteDialog(
    project: ProjectSummary,
  ): void {
    setOpenMenuId(null);
    setDeleteTarget(project);
    setDeleteKey('');
    setDeleteError(null);
  }

  function closeDeleteDialog(): void {
    if (deleting) return;

    setDeleteTarget(null);
    setDeleteKey('');
    setDeleteError(null);
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (
      !name.trim() ||
      !shipKey.trim() ||
      creating
    ) {
      return;
    }

    setCreating(true);
    setCreateError(null);
    setNotice(null);

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

  async function handleDelete(): Promise<void> {
    if (
      !deleteTarget ||
      !deleteConfirmed ||
      deleting
    ) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);
    setNotice(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(
          deleteTarget.id,
        )}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            confirmShipKey: deleteKey.trim(),
          }),
        },
      );

      const payload = (await response.json()) as
        | DeleteResponse
        | { error?: string };

      if (
        !response.ok ||
        !('deleted' in payload) ||
        !payload.deleted
      ) {
        throw new Error(
          'error' in payload && payload.error
            ? payload.error
            : 'Could not delete workspace.',
        );
      }

      setProjectList((current) =>
        current.filter(
          (project) =>
            project.id !== deleteTarget.id,
        ),
      );

      window.sessionStorage.removeItem(
        `spec2ship.ai.chat.${deleteTarget.id}`,
      );

      if (selectedProjectId === deleteTarget.id) {
        closeProject();
      }

      setNotice(
        `${deleteTarget.name} was deleted.`,
      );
      setDeleteTarget(null);
      setDeleteKey('');
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'Could not delete workspace.',
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="page-header projects-page__header">
        <div>
          <p className="projects-page__eyebrow">
            Project Workspaces
          </p>
          <h1 className="page-header__title">
            Projects
          </h1>
          <p className="page-header__subtitle">
            Open a QA workspace or create a new one.
            Each workspace keeps its own requirements,
            tests, automation, risk, and release evidence.
          </p>
        </div>

        <button
          type="button"
          className={
            'projects-page__new-button' +
            (createOpen
              ? ' projects-page__new-button--open'
              : '')
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
          <span aria-hidden="true">
            {createOpen ? '×' : '+'}
          </span>
          {createOpen
            ? 'Close'
            : 'New Workspace'}
        </button>
      </div>

      {notice && (
        <div
          className="projects-notice"
          role="status"
        >
          ✓ {notice}
        </div>
      )}

      {createOpen && (
        <section
          className="projects-create-drawer"
          id="new-workspace-panel"
        >
          <div className="projects-create-drawer__header">
            <div>
              <p className="projects-panel__eyebrow">
                New Workspace
              </p>
              <h2>Create Project</h2>
              <p>
                Choose a Ship Key once. Spec2Ship
                automatically builds requirement and
                test IDs from it.
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

          <form
            className="project-create-form"
            onSubmit={handleCreate}
          >
            <div className="project-create-form__grid">
              <label>
                <span>Project name</span>
                <input
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
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
                  2–8 letters or numbers, starting
                  with a letter.
                </small>

                {shipKey.length >= 2 && (
                  <div className="project-create-form__id-preview">
                    <span>
                      Requirement →{' '}
                      <strong>{shipKey}-1</strong>
                    </span>
                    <span>
                      Test →{' '}
                      <strong>{shipKey}-T1</strong>
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
                    onChange={() =>
                      setTemplate('blank')
                    }
                  />

                  <span>
                    <strong>Blank Project</strong>
                    Add your own requirements and
                    test evidence.
                  </span>
                </label>

                <label className="project-template-option">
                  <input
                    type="radio"
                    name="template"
                    value="shopsphere"
                    checked={
                      template === 'shopsphere'
                    }
                    onChange={() =>
                      setTemplate('shopsphere')
                    }
                  />

                  <span>
                    <strong>Start from Demo</strong>
                    Copy the sample evidence and remap
                    it to your Ship Key.
                  </span>
                </label>
              </div>
            </fieldset>

            {createError && (
              <div
                className="projects-create-error"
                role="alert"
              >
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
                  !/^[A-Z][A-Z0-9]{1,7}$/.test(
                    shipKey,
                  )
                }
              >
                {creating
                  ? 'Creating…'
                  : 'Create & Open Workspace'}
              </button>
            </div>
          </form>
        </section>
      )}

      <div className="projects-layout projects-layout--library">
        <section className="projects-panel">
          <div className="projects-panel__header">
            <div>
              <p className="projects-panel__eyebrow">
                Your Workspaces
              </p>
              <h2>Projects</h2>
            </div>

            <span className="projects-panel__count">
              {customProjects.length}
            </span>
          </div>

          {loading && (
            <p
              className="state-message"
              role="status"
            >
              Loading projects…
            </p>
          )}

          {error && !loading && (
            <div
              className="state-message state-message--error"
              role="alert"
            >
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            customProjects.length === 0 && (
              <div className="projects-empty">
                <strong>
                  No workspaces yet
                </strong>
                <p>
                  Create your first Spec2Ship workspace
                  to start connecting requirements,
                  tests, automation, and release evidence.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setCreateOpen(true)
                  }
                >
                  + New Workspace
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            customProjects.length > 0 && (
              <div className="projects-grid">
                {customProjects.map((project) => (
                  <article
                    className={
                      'project-card' +
                      (project.id ===
                      selectedProjectId
                        ? ' project-card--selected'
                        : '')
                    }
                    key={project.id}
                  >
                    <div className="project-card__topline">
                      <div className="project-card__identity">
                        <code>
                          {project.shipKey}
                        </code>

                        {project.id ===
                          selectedProjectId && (
                          <span className="project-card__current">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="project-card__menu-wrap">
                        <button
                          type="button"
                          className="project-card__menu-button"
                          aria-label={
                            `Workspace actions for ${project.name}`
                          }
                          aria-expanded={
                            openMenuId === project.id
                          }
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === project.id
                                ? null
                                : project.id,
                            )
                          }
                        >
                          ⋯
                        </button>

                        {openMenuId ===
                          project.id && (
                          <div className="project-card__menu">
                            <button
                              type="button"
                              className="project-card__delete-action"
                              onClick={() =>
                                openDeleteDialog(
                                  project,
                                )
                              }
                            >
                              Delete Workspace
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3>{project.name}</h3>

                    <p className="project-card__description">
                      {project.description ||
                        'No description yet.'}
                    </p>

                    <div className="project-card__stats">
                      <span>
                        <strong>
                          {project.requirementCount}
                        </strong>
                        Requirements
                      </span>
                      <span>
                        <strong>
                          {project.testCount}
                        </strong>
                        Test Cases
                      </span>
                    </div>

                    <button
                      type="button"
                      className="project-card__open"
                      onClick={() =>
                        openProject(project.id)
                      }
                    >
                      Open Workspace
                    </button>
                  </article>
                ))}
              </div>
            )}
        </section>

        <aside className="projects-demo-aside">
          <details>
            <summary>
              <span className="projects-demo-aside__icon">
                ?
              </span>
              <span>
                <strong>
                  Learn Spec2Ship
                </strong>
                <small>
                  Need an example?
                </small>
              </span>
            </summary>

            <div className="projects-demo-aside__content">
              <p>
                Explore a completed, read-only QA
                workspace to see how requirements,
                tests, traceability, risk, and release
                readiness work together.
              </p>

              <button
                type="button"
                onClick={() =>
                  openProject(
                    demoProject?.id ??
                      'shopsphere-demo',
                  )
                }
              >
                Explore Demo
              </button>
            </div>
          </details>
        </aside>
      </div>

      {deleteTarget && (
        <div
          className="project-delete-modal"
          role="presentation"
        >
          <section
            className="project-delete-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-workspace-title"
          >
            <div className="project-delete-modal__danger">
              !
            </div>

            <p className="projects-panel__eyebrow">
              Permanent Action
            </p>

            <h2 id="delete-workspace-title">
              Delete workspace?
            </h2>

            <div className="project-delete-modal__project">
              <strong>
                {deleteTarget.name}
              </strong>
              <code>
                {deleteTarget.shipKey}
              </code>
            </div>

            <p className="project-delete-modal__warning">
              This permanently deletes this workspace
              and its Spec2Ship requirements, test
              cases, traceability, automation evidence,
              and release-readiness data. This action
              cannot be undone.
            </p>

            <div className="project-delete-modal__counts">
              <span>
                <strong>
                  {deleteTarget.requirementCount}
                </strong>
                Requirements
              </span>
              <span>
                <strong>
                  {deleteTarget.testCount}
                </strong>
                Test Cases
              </span>
            </div>

            <label className="project-delete-modal__confirm">
              <span>
                Type{' '}
                <strong>
                  {deleteTarget.shipKey}
                </strong>{' '}
                to confirm
              </span>

              <input
                type="text"
                value={deleteKey}
                onChange={(event) =>
                  setDeleteKey(
                    event.target.value
                      .toUpperCase()
                      .slice(0, 8),
                  )
                }
                placeholder={
                  deleteTarget.shipKey
                }
                autoFocus
              />
            </label>

            {deleteError && (
              <div
                className="projects-create-error"
                role="alert"
              >
                {deleteError}
              </div>
            )}

            <div className="project-delete-modal__actions">
              <button
                type="button"
                className="project-delete-modal__cancel"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="project-delete-modal__delete"
                onClick={() =>
                  void handleDelete()
                }
                disabled={
                  !deleteConfirmed ||
                  deleting
                }
              >
                {deleting
                  ? 'Deleting…'
                  : 'Delete Workspace'}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
