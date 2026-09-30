import type {
  ProjectWorkspace,
} from './projectStoreService.js';

export type GlobalSearchResultType =
  | 'project'
  | 'requirement'
  | 'test'
  | 'automation';

export interface GlobalSearchResult {
  type: GlobalSearchResultType;
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

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function scoreText(
  query: string,
  values: string[],
  exactValues: string[] = [],
): number {
  const q = normalize(query);
  if (!q) return 0;

  const exact = exactValues.map(normalize);

  if (exact.includes(q)) {
    return 1000;
  }

  let score = 0;

  for (const value of values) {
    const text = normalize(value);

    if (!text) continue;

    if (text === q) {
      score = Math.max(score, 900);
    } else if (text.startsWith(q)) {
      score = Math.max(score, 650);
    } else if (text.includes(q)) {
      score = Math.max(score, 350);
    }
  }

  return score;
}

export function searchProjects(
  projects: ProjectWorkspace[],
  query: string,
  limit = 30,
): GlobalSearchResult[] {
  const trimmed = query.trim();

  if (!trimmed) return [];

  const results: GlobalSearchResult[] = [];

  for (const project of projects) {
    const projectScore = scoreText(
      trimmed,
      [
        project.name,
        project.shipKey,
        project.description,
      ],
      [project.shipKey],
    );

    if (projectScore > 0) {
      results.push({
        type: 'project',
        projectId: project.id,
        projectName: project.name,
        shipKey: project.shipKey,
        entityId: project.shipKey,
        title: project.name,
        description:
          project.description || 'Project workspace',
        href: '/project/setup',
        metadata: [
          `${project.requirements.length} requirements`,
          `${project.seededTests.length} tests`,
        ],
        score: projectScore + 40,
      });
    }

    for (const requirement of project.requirements) {
      const requirementScore = scoreText(
        trimmed,
        [
          requirement.id,
          requirement.title,
          requirement.description,
          requirement.domain,
          requirement.criticality,
          ...requirement.tags,
          ...requirement.acceptanceCriteria,
        ],
        [requirement.id],
      );

      if (requirementScore > 0) {
        results.push({
          type: 'requirement',
          projectId: project.id,
          projectName: project.name,
          shipKey: project.shipKey,
          entityId: requirement.id,
          title: requirement.title,
          description: requirement.description,
          href: `/requirements?focus=${encodeURIComponent(
            requirement.id,
          )}`,
          metadata: [
            requirement.domain,
            requirement.criticality,
          ],
          score: requirementScore + 30,
        });
      }
    }

    for (const testCase of project.seededTests) {
      const automationValues = testCase.automation
        ? [
            testCase.automation.framework,
            testCase.automation.sourceFile ?? '',
            testCase.automation.projectName ?? '',
          ]
        : [];

      const testScore = scoreText(
        trimmed,
        [
          testCase.id,
          testCase.title,
          testCase.description,
          testCase.type,
          testCase.status,
          testCase.notes,
          ...testCase.requirementIds,
          ...automationValues,
        ],
        [testCase.id],
      );

      if (testScore > 0) {
        results.push({
          type: testCase.automation
            ? 'automation'
            : 'test',
          projectId: project.id,
          projectName: project.name,
          shipKey: project.shipKey,
          entityId: testCase.id,
          title: testCase.title,
          description: testCase.description,
          href: `/tests?focus=${encodeURIComponent(
            testCase.id,
          )}`,
          metadata: [
            testCase.type,
            testCase.status,
            testCase.automated
              ? testCase.automation?.framework ??
                'automated'
              : 'manual',
          ],
          score:
            testScore +
            (testCase.automation ? 25 : 20),
        });
      }
    }
  }

  return results
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.entityId.localeCompare(b.entityId);
    })
    .slice(0, limit);
}
