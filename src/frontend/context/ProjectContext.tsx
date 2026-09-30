import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ProjectContextValue {
  selectedProjectId: string | null;
  hasOpenProject: boolean;
  selectProject: (projectId: string) => void;
  closeProject: () => void;
  projectApiUrl: (url: string) => string;
}

const STORAGE_KEY = 'spec2ship.selectedProjectId';

const ProjectContext =
  createContext<ProjectContextValue | null>(null);

function readInitialProjectId(): string | null {
  if (typeof window === 'undefined') return null;

  const stored =
    window.localStorage.getItem(STORAGE_KEY);

  return stored?.trim() || null;
}

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [
    selectedProjectId,
    setSelectedProjectId,
  ] = useState<string | null>(
    readInitialProjectId,
  );

  function selectProject(projectId: string): void {
    const next = projectId.trim();

    if (!next) return;

    setSelectedProjectId(next);
    window.localStorage.setItem(
      STORAGE_KEY,
      next,
    );
  }

  function closeProject(): void {
    setSelectedProjectId(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo<ProjectContextValue>(
    () => ({
      selectedProjectId,
      hasOpenProject: selectedProjectId !== null,
      selectProject,
      closeProject,
      projectApiUrl: (url: string) => {
        if (!url.startsWith('/api/')) return url;

        if (url.startsWith('/api/projects')) {
          return url;
        }

        if (url.startsWith('/api/search')) {
          return url;
        }

        if (!selectedProjectId) {
          return url;
        }

        const separator = url.includes('?')
          ? '&'
          : '?';

        return `${url}${separator}projectId=${encodeURIComponent(
          selectedProjectId,
        )}`;
      },
    }),
    [selectedProjectId],
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject(): ProjectContextValue {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      'useProject must be used inside ProjectProvider.',
    );
  }

  return context;
}
