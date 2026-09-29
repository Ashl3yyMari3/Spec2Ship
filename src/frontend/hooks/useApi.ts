import { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic fetch hook for relative /api URLs.
 * Uses the Vite dev proxy (target: http://localhost:3001).
 */
export function useApi<T>(url: string): ApiState<T> {
  const { projectApiUrl, selectedProjectId } = useProject();
  const scopedUrl = projectApiUrl(url);

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    setState({ data: null, loading: true, error: null });

    fetch(scopedUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status} ${res.statusText}`);
        }
        return res.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'An unexpected error occurred.';
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, scopedUrl, selectedProjectId]);

  return state;
}
