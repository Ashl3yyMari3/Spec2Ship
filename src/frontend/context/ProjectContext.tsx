import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ProjectContextValue {
  selectedProjectId: string;
  selectProject: (projectId: string) => void;
  projectApiUrl: (url: string) => string;
}

const DEFAULT_PROJECT_ID = 'shopsphere-demo';
const STORAGE_KEY = 'spec2ship.selectedProjectId';

const ProjectContext = createContext<ProjectContextValue | null>(null);

function readInitialProjectId(): string {
  if (typeof window === 'undefined') return DEFAULT_PROJECT_ID;

  return (
    window.localStorage.getItem(STORAGE_KEY) ??
    DEFAULT_PROJECT_ID
  );
}

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [selectedProjectId, setSelectedProjectId] = useState(
    readInitialProjectId,
  );

  function selectProject(projectId: string): void {
    setSelectedProjectId(projectId);
    window.localStorage.setItem(STORAGE_KEY, projectId);
  }

  const value = useMemo<ProjectContextValue>(
    () => ({
      selectedProjectId,
      selectProject,
      projectApiUrl: (url: string) => {
        if (!url.startsWith('/api/')) return url;
        if (url.startsWith('/api/projects')) return url;

        const separator = url.includes('?') ? '&' : '?';

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
