import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import '../styles/global-search.css';

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

const GROUP_ORDER: GlobalSearchResult['type'][] = [
  'project',
  'requirement',
  'test',
  'automation',
];

function groupTitle(
  type: GlobalSearchResult['type'],
): string {
  switch (type) {
    case 'project':
      return 'Projects';
    case 'requirement':
      return 'Requirements';
    case 'automation':
      return 'Automation';
    default:
      return 'Test Cases';
  }
}

export default function SearchResultsPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectProject } = useProject();

  const query = searchParams.get('q')?.trim() ?? '';

  const [results, setResults] =
    useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    async function run(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=50`,
          { signal: controller.signal },
        );

        const payload = (await response.json()) as
          | SearchResponse
          | { error?: string };

        if (!response.ok || !('results' in payload)) {
          throw new Error(
            'error' in payload && payload.error
              ? payload.error
              : 'Global search failed.',
          );
        }

        setResults(payload.results);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === 'AbortError'
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Global search failed.',
        );
      } finally {
        setLoading(false);
      }
    }

    void run();

    return () => controller.abort();
  }, [query]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((type) => ({
        type,
        results: results.filter(
          (result) => result.type === type,
        ),
      })).filter((group) => group.results.length > 0),
    [results],
  );

  function openResult(
    result: GlobalSearchResult,
  ): void {
    selectProject(result.projectId);
    navigate(result.href);
  }

  return (
    <>
      <div className="page-header">
        <p className="global-search-page__eyebrow">
          Global Search
        </p>
        <h1 className="page-header__title">
          Search Results
        </h1>
        <p className="page-header__subtitle">
          {query
            ? `Results across all workspaces for “${query}”`
            : 'Search projects, requirements, tests, IDs, and automation evidence.'}
        </p>
      </div>

      {!query && (
        <div className="global-search-page__empty">
          Use the search bar above to find anything in Spec2Ship.
        </div>
      )}

      {loading && (
        <p className="state-message" role="status">
          Searching Spec2Ship…
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
        query &&
        results.length === 0 && (
          <div className="global-search-page__empty">
            No results found for “{query}”.
          </div>
        )}

      {!loading &&
        !error &&
        grouped.map((group) => (
          <section
            className="global-search-page__group"
            key={group.type}
          >
            <div className="global-search-page__group-heading">
              <h2>{groupTitle(group.type)}</h2>
              <span>{group.results.length}</span>
            </div>

            <div className="global-search-page__results">
              {group.results.map((result) => (
                <button
                  type="button"
                  className="global-search-page__result"
                  key={`${result.projectId}-${result.type}-${result.entityId}`}
                  onClick={() => openResult(result)}
                >
                  <span className="global-search-page__id">
                    {result.entityId}
                  </span>

                  <span className="global-search-page__copy">
                    <strong>{result.title}</strong>
                    <small>
                      {result.description}
                    </small>

                    <span>
                      {result.projectName} · {result.shipKey}
                      {result.metadata?.length
                        ? ` · ${result.metadata.join(' · ')}`
                        : ''}
                    </span>
                  </span>

                  <span
                    className="global-search-page__arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
    </>
  );
}
