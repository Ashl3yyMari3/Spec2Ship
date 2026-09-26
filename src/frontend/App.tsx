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

export default function App(): React.ReactElement {
  return (
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
