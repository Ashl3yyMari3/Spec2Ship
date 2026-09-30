import {
  useEffect,
  useState,
} from 'react';
import { useProject } from '../context/ProjectContext';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic fetch hook for relative /api URLs.
 * Pass null to pause fetching until the caller has
 * enough context, such as an open workspace.
 */
export function useApi<T>(
  url: string | null,
): ApiState<T> {
  const {
    projectApiUrl,
    selectedProjectId,
  } = useProject();

  const scopedUrl = url
    ? projectApiUrl(url)
    : null;

  const [state, setState] =
    useState<ApiState<T>>({
      data: null,
      loading: Boolean(url),
      error: null,
    });

  useEffect(() => {
    if (!scopedUrl) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
      return;
    }

    let cancelled = false;

    setState({
      data: null,
      loading: true,
      error: null,
    });

    fetch(scopedUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Request failed: ${res.status} ${res.statusText}`,
          );
        }

        return res.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) {
          setState({
            data,
            loading: false,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred.';

          setState({
            data: null,
            loading: false,
            error: message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    url,
    scopedUrl,
    selectedProjectId,
  ]);

  return state;
}
