import React from 'react';
import {
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';

export default function RequireWorkspace({
  children,
}: {
  children: React.ReactElement;
}): React.ReactElement {
  const { hasOpenProject } = useProject();
  const location = useLocation();

  if (!hasOpenProject) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          workspaceRequiredFrom:
            location.pathname,
        }}
      />
    );
  }

  return children;
}
