import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingCopilot from '../AI/FloatingCopilot';

export default function AppLayout(): React.ReactElement {
  return (
    <div className="layout">
      {/* Cosmic star-field dots via inline pseudo CSS fallback */}
      <Header />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__main" id="main-content">
          <Outlet />
        </main>
      </div>
      <FloatingCopilot />
    </div>
  );
}
