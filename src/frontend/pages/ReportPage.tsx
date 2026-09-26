import React from 'react';

export default function ReportPage(): React.ReactElement {
  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Release Readiness Report</h1>
        <p className="page-header__subtitle">
          Consolidated release gate assessment across all requirements
        </p>
      </div>
      <div className="placeholder">
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(139, 92, 246, 0.2)',
          }}
          aria-hidden="true"
        >
          {/* Rocket icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 11L5 22l4-1.5 3-3.5 3 3.5 4 1.5-4-11"
              stroke="#A78BFA"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 2C12 2 7 7 7 13h10C17 7 12 2 12 2z"
              stroke="#A78BFA"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2" stroke="#A78BFA" strokeWidth="1.3"/>
          </svg>
        </div>
        <p className="placeholder__title" style={{ color: 'var(--violet-light)' }}>
          Coming Soon
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 320, margin: '0 auto' }}>
          Release Readiness Report will be implemented in a future task. It will provide a
          consolidated view of risk, coverage, and quality gates.
        </p>
      </div>
    </>
  );
}
