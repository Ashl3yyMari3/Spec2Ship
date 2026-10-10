
import React, { useState } from 'react';
import type { TestCase } from '@backend/types/models';
import { useProject } from '../../context/ProjectContext';
import CriterionTestLinker from '../components/Requirements/CriterionTestLinker';

interface Props {
  requirementId: string;
  criterionIndex: number;
  linkedTests: TestCase[];
  existingTestIds: string[];
}

export default function CriterionTestLinker({
  requirementId,
  criterionIndex,
  linkedTests,
  existingTestIds,
}: Props): React.ReactElement {
  const { selectedProjectId } = useProject();

  const [selectedTestId, setSelectedTestId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableTests = linkedTests.filter(
    (test) => !existingTestIds.includes(test.id),
  );

  async function handleLinkTest(): Promise<void> {
    if (!selectedProjectId || !selectedTestId || saving) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(selectedProjectId)}` +
          `/requirements/${encodeURIComponent(requirementId)}` +
          '/criterion-links',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testCaseId: selectedTestId,
            criterionIndex,
          }),
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => null);

        throw new Error(
          result?.error ?? 'Unable to link this test.',
        );
      }

      // Refresh the existing coverage and test data.
      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong.',
      );
      setSaving(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <label
        htmlFor={`criterion-test-${criterionIndex}`}
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Link an existing QA test
      </label>

      {availableTests.length === 0 ? (
        <p style={{ fontSize: 12, opacity: 0.75 }}>
          No additional linked tests available.
        </p>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <select
            id={`criterion-test-${criterionIndex}`}
            value={selectedTestId}
            onChange={(event) =>
              setSelectedTestId(event.target.value)
            }
            style={{
              flex: '1 1 220px',
              padding: 10,
              borderRadius: 8,
              background: '#17142b',
              color: '#ffffff',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            <option value="">Select a QA test...</option>

            {availableTests.map((test) => (
              <option key={test.id} value={test.id}>
                {test.id} - {test.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn--primary"
            onClick={handleLinkTest}
            disabled={!selectedTestId || saving}
          >
            {saving ? 'Linking...' : 'Link Test'}
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          style={{
            color: '#f87171',
            fontSize: 12,
            marginTop: 10,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
