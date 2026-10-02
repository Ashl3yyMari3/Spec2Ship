import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Show } from '@clerk/react';

import AppLayout from './components/Layout/AppLayout';
import RequireWorkspace from './components/Layout/RequireWorkspace';

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
import SignInPage from './pages/SignInPage';
import LandingPage from './pages/LandingPage';

import { ProjectProvider } from './context/ProjectContext';
import { CopilotProvider } from './context/CopilotContext';

export default function App(): React.ReactElement {
  return (
    <ProjectProvider>
      <CopilotProvider>
        <BrowserRouter>
          <Show when="signed-out">
            <Routes>
              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </Show>

          <Show when="signed-in">
            <Routes>
              <Route
                path="/sign-in"
                element={<Navigate to="/" replace />}
              />

              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />

                <Route
                  path="/requirements"
                  element={
                    <RequireWorkspace>
                      <RequirementsPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/tests"
                  element={
                    <RequireWorkspace>
                      <TestsPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/traceability"
                  element={
                    <RequireWorkspace>
                      <TraceabilityPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/coverage-gaps"
                  element={
                    <RequireWorkspace>
                      <CoverageGapsPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/impact"
                  element={
                    <RequireWorkspace>
                      <ImpactPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/risk"
                  element={
                    <RequireWorkspace>
                      <RiskPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/report"
                  element={
                    <RequireWorkspace>
                      <ReportPage />
                    </RequireWorkspace>
                  }
                />

                <Route path="/ai" element={<CopilotPage />} />
                <Route path="/projects" element={<ProjectsPage />} />

                <Route
                  path="/project/setup"
                  element={
                    <RequireWorkspace>
                      <ProjectSetupPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/automation"
                  element={
                    <RequireWorkspace>
                      <AutomationCenterPage />
                    </RequireWorkspace>
                  }
                />

                <Route
                  path="/search"
                  element={<SearchResultsPage />}
                />
              </Route>
            </Routes>
          </Show>
        </BrowserRouter>
      </CopilotProvider>
    </ProjectProvider>
  );
}
