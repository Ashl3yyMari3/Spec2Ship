import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import RequirementsPage from './pages/RequirementsPage';
import TestsPage from './pages/TestsPage';
import TraceabilityPage from './pages/TraceabilityPage';
import CoverageGapsPage from './pages/CoverageGapsPage';
import ImpactPage from './pages/ImpactPage';
import RiskPage from './pages/RiskPage';
import ReportPage from './pages/ReportPage';
import CopilotPage from './pages/CopilotPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectSetupPage from './pages/ProjectSetupPage';
import { ProjectProvider } from './context/ProjectContext';

export default function App(): React.ReactElement {
  return (
    <ProjectProvider>
      <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Redirect root to Risk Dashboard */}
          <Route index element={<Navigate to="/risk" replace />} />

          {/* Implemented pages */}
          <Route path="/requirements" element={<RequirementsPage />} />
          <Route path="/tests" element={<TestsPage />} />

          {/* Placeholder pages — to be implemented in later tasks */}
          <Route path="/traceability" element={<TraceabilityPage />} />
          <Route path="/coverage-gaps" element={<CoverageGapsPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/ai" element={<CopilotPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/project/setup" element={<ProjectSetupPage />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </ProjectProvider>
  );
}
