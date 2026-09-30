import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AutomationCenterPage from './pages/AutomationCenterPage';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import { ProjectProvider } from './context/ProjectContext';
import { CopilotProvider } from './context/CopilotContext';

export default function App(): React.ReactElement {
  return (
    <ProjectProvider>
      <CopilotProvider>
        <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />

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
          <Route path="/automation" element={<AutomationCenterPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
        </Route>
      </Routes>
        </BrowserRouter>
      </CopilotProvider>
    </ProjectProvider>
  );
}
