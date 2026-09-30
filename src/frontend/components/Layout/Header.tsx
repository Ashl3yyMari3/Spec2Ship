import React, {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { useApi } from '../../hooks/useApi';

function OrbitalLogo(): React.ReactElement {
  return (
    <svg
      className="header__logo-icon"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="6" fill="#A78BFA" />
      <ellipse
        cx="20"
        cy="20"
        rx="16"
        ry="7"
        stroke="#8B5CF6"
        strokeWidth="1.5"
      />
      <ellipse
        cx="20"
        cy="20"
        rx="7"
        ry="16"
        stroke="#22D3EE"
        strokeWidth="1.5"
        transform="rotate(38 20 20)"
      />
      <circle cx="33" cy="18" r="2" fill="#39FF88" />
    </svg>
  );
}

interface HeaderProject {
  id: string;
  name: string;
  isDemo: boolean;
}

interface GlobalSearchResult {
  type: 'project' | 'requirement' | 'test' | 'automation';
  projectId: string;
  projectName: string;
  shipKey: string;
  entityId: string;
  title: string;
  description: string;
  href: string;
  metadata?: string[];
  score: number;
}

interface SearchResponse {
  query: string;
  results: GlobalSearchResult[];
}

function resultTypeLabel(
  type: GlobalSearchResult['type'],
): string {
  switch (type) {
    case 'project':
      return 'Project';
    case 'requirement':
      return 'Requirement';
    case 'automation':
      return 'Automation';
    default:
      return 'Test Case';
  }
}

export default function Header(): React.ReactElement {
  const navigate = useNavigate();
  const {
    selectedProjectId,
    selectProject,
  } = useProject();

  const { data: project } = useApi<HeaderProject>(
    `/api/projects/${selectedProjectId}`,
  );

  const [query, setQuery] = useState('');
  const [results, setResults] =
    useState<GlobalSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=8`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error('Search failed.');
        }

        const payload =
          (await response.json()) as SearchResponse;

        setResults(payload.results);
        setOpen(true);
      } catch (error) {
        if (
          !(error instanceof DOMException &&
            error.name === 'AbortError')
        ) {
          setResults([]);
        }
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  function openResult(
    result: GlobalSearchResult,
  ): void {
    selectProject(result.projectId);
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate(result.href);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) return;

    setOpen(false);
    navigate(
      `/search?q=${encodeURIComponent(trimmed)}`,
    );
  }

  return (
    <header
      className="layout__header"
      role="banner"
    >
      <Link
        to="/"
        className="header__brand"
        aria-label="Spec2Ship — go to home"
      >
        <OrbitalLogo />

        <span className="header__brand-copy">
          <span className="header__brand-text">
            Spec2Ship
          </span>

          <span className="header__brand-subtitle">
            Requirements → Tests → Release Confidence
          </span>
        </span>
      </Link>

      <form
        ref={searchRef}
        className="header-search header-search--global"
        role="search"
        onSubmit={handleSubmit}
        onFocus={() => {
          if (query.trim()) setOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => {
            if (
              !searchRef.current?.contains(
                document.activeElement,
              )
            ) {
              setOpen(false);
            }
          }, 0);
        }}
      >
        <span
          className="header-search__icon"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search projects, IDs, requirements, tests..."
          aria-label="Search Spec2Ship"
          autoComplete="off"
        />

        {query.trim() && open && (
          <div
            className="global-search-dropdown"
            role="listbox"
            aria-label="Global search results"
          >
            <div className="global-search-dropdown__topline">
              <span>Global Search</span>
              {searching && <em>Searching…</em>}
            </div>

            {!searching &&
              results.length === 0 && (
                <div className="global-search-dropdown__empty">
                  No matches for “{query.trim()}”
                </div>
              )}

            {results.map((result) => (
              <button
                type="button"
                className="global-search-result"
                key={`${result.projectId}-${result.type}-${result.entityId}`}
                onMouseDown={(event) =>
                  event.preventDefault()
                }
                onClick={() => openResult(result)}
              >
                <span
                  className={
                    'global-search-result__type ' +
                    `global-search-result__type--${result.type}`
                  }
                >
                  {resultTypeLabel(result.type)}
                </span>

                <span className="global-search-result__copy">
                  <span className="global-search-result__title">
                    <code>{result.entityId}</code>
                    <strong>{result.title}</strong>
                  </span>

                  <small>
                    {result.projectName} · {result.shipKey}
                    {result.metadata?.length
                      ? ` · ${result.metadata.join(' · ')}`
                      : ''}
                  </small>
                </span>

                <span
                  className="global-search-result__arrow"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            ))}

            <button
              type="submit"
              className="global-search-dropdown__all"
              onMouseDown={(event) =>
                event.preventDefault()
              }
            >
              View all results for “{query.trim()}”
            </button>
          </div>
        )}
      </form>

      <Link
        to="/projects"
        className="header__project-pill"
        title="Switch project"
      >
        <span className="header__project-pill-label">
          Current Project
        </span>
        <strong>{project?.name ?? 'Loading…'}</strong>
      </Link>

      <span
        className="header__mission-control"
        aria-hidden="true"
      >
        QA Mission Control
      </span>
    </header>
  );
}
