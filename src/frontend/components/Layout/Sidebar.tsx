import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactElement;
}

// --- Inline SVG icons for each nav item ---

const IconHome = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8.2L9 3l6 5.2V15H10.8v-4.2H7.2V15H3V8.2z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
  </svg>
);


const IconProjects = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.5" y="4" width="13" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M5 4V2.8h4l1.2 1.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.5 8h7M5.5 11h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconSetup = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5.5h10M4 9h10M4 12.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="7" cy="5.5" r="1.4" fill="currentColor"/>
    <circle cx="11.5" cy="9" r="1.4" fill="currentColor"/>
    <circle cx="8.5" cy="12.5" r="1.4" fill="currentColor"/>
  </svg>
);


const IconRequirements = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconAutomation = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.5 2.5L5.5 10h3L7.5 15.5l5-7.5h-3l1-5.5z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/>
  </svg>
);

const IconTestCases = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3h6v4l2 3-2 3v2H6v-2L4 10l2-3V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M7 7h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="9" cy="12" r="1" fill="currentColor"/>
  </svg>
);

const IconTraceability = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="9" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="14" cy="5" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M6 8.5L12 5.8M6 9.5L12 12.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconCoverageGaps = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="9" cy="9" r="1" fill="currentColor"/>
    <path d="M9 2.5V4M9 14v1.5M2.5 9H4M14 9h1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconImpact = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="4" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="4" cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="14" cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M9 6v3M9 9L4.5 12.3M9 9l4.5 3.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconRisk = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2.5L16 15H2L9 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M9 7.5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="9" cy="12.5" r="0.7" fill="currentColor"/>
  </svg>
);

const IconReport = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2L14 5v9l-5 2-5-2V5L9 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M9 2v13M9 9l4.5-3M9 9L4.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const IconAI = (
  <svg className="sidebar__icon" viewBox="0 0 18 18" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2.5l1.2 3.3L13.5 7l-3.3 1.2L9 11.5 7.8 8.2 4.5 7l3.3-1.2L9 2.5z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
    <path d="M13.8 10.3l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" fill="currentColor"/>
    <circle cx="4" cy="13.5" r="1.2" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',             to: '/',              icon: IconHome },
  { label: 'Projects',         to: '/projects',      icon: IconProjects },
  { label: 'Project Setup',    to: '/project/setup', icon: IconSetup },
  { label: 'Requirements',     to: '/requirements',  icon: IconRequirements },
  { label: 'Test Cases',       to: '/tests',         icon: IconTestCases },
  { label: 'Automation Center',to: '/automation',    icon: IconAutomation },
  { label: 'Traceability',     to: '/traceability',  icon: IconTraceability },
  { label: 'Coverage Gaps',    to: '/coverage-gaps', icon: IconCoverageGaps },
  { label: 'Change Impact',    to: '/impact',        icon: IconImpact },
  { label: 'Risk Dashboard',   to: '/risk',          icon: IconRisk },
  { label: 'Release Readiness',to: '/report',        icon: IconReport },
  { label: 'Spec2Ship AI',      to: '/ai',            icon: IconAI },
];

export default function Sidebar(): React.ReactElement {
  return (
    <aside className="layout__sidebar" aria-label="Main navigation">
      <nav className="sidebar__nav">
        <p className="sidebar__label">Navigation</p>
        <ul role="list" style={{ listStyle: 'none' }}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  'sidebar__link' + (isActive ? ' sidebar__link--active' : '')
                }
                aria-current={undefined}
                end={item.to === '/'}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
