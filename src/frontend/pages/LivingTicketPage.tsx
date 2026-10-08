import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type {
  Requirement,
  TestCase,
} from '@backend/types/models';
import { useApi } from '../hooks/useApi';

export default function LivingTicketPage(): React.ReactElement {
  const { requirementId } = useParams<{ requirementId: string }>();

  const requirements = useApi<Requirement[]>('/api/requirements');
  const tests = useApi<TestCase[]>('/api/tests');

  const requirement = requirements.data?.find(
    (item) => item.id === requirementId,
  );

  const linkedTests = (tests.data ?? []).filter(
    (test) => test.requirementIds.includes(requirementId ?? ''),
  );

  if (requirements.loading || tests.loading) {
    return <p role="status">Loading Living Ticket...</p>;
  }

  if (requirements.error || tests.error) {
    return (
      <p role="alert">
        Unable to load ticket: {requirements.error || tests.error}
      </p>
    );
  }

  if (!requirement) {
    return <p role="alert">Requirement not found.</p>;
  }

  return (
    <main>
      <Link to="/requirements">← Back to Requirements</Link>

      <header className="page-header">
        <p>{requirement.id} · Living Ticket</p>
        <h1 className="page-header__title">
          {requirement.title}
        </h1>
        <p className="page-header__subtitle">
          {requirement.description}
        </p>
      </header>

      <section className="card">
        <h2>Acceptance Criteria</h2>
        <ol>
          {requirement.acceptanceCriteria.map((criterion, index) => (
            <li key={index}>{criterion}</li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>Linked QA Tests ({linkedTests.length})</h2>

        {linkedTests.length === 0 ? (
          <p>No tests linked to this requirement yet.</p>
        ) : (
          <ul>
            {linkedTests.map((test) => (
              <li key={test.id}>
                <strong>{test.id}</strong>: {test.title}
                {' · '}
                {test.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}