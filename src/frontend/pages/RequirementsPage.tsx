import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Requirement } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import RequirementsList from '../components/Requirements/RequirementsList';

export default function RequirementsPage(): React.ReactElement {
  const { data, loading, error } =
    useApi<Requirement[]>('/api/requirements');

  const [searchParams] = useSearchParams();

  const query =
    searchParams.get('search')?.trim().toLowerCase() ?? '';

  const filteredRequirements =
    data?.filter((requirement) => {
      if (!query) {
        return true;
      }

      const searchableText = [
        requirement.id,
        requirement.title,
        requirement.description,
        requirement.domain,
        requirement.criticality,
        ...requirement.tags,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    }) ?? [];

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">
          Requirements
        </h1>

        <p className="page-header__subtitle">
          {query
            ? `Search results for "${searchParams.get('search')}"`
            : 'All parsed requirements with acceptance criteria'}
        </p>
      </div>

      {loading && (
        <p
          className="state-message"
          role="status"
          aria-live="polite"
        >
          Loading requirements…
        </p>
      )}

      {error && !loading && (
        <div
          className="state-message state-message--error"
          role="alert"
        >
          <p className="state-message__title">
            Failed to load requirements
          </p>

          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        data !== null &&
        filteredRequirements.length > 0 && (
          <RequirementsList
            requirements={filteredRequirements}
          />
        )}

      {!loading &&
        !error &&
        data !== null &&
        filteredRequirements.length === 0 && (
          <div className="state-message">
            No requirements matched your search.
          </div>
        )}
    </>
  );
}