import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Requirements', to: '/requirements' },
  { label: 'Test Cases', to: '/tests' },
  { label: 'Traceability', to: '/traceability' },
  { label: 'Coverage Gaps', to: '/coverage-gaps' },
  { label: 'Change Impact', to: '/impact' },
  { label: 'Risk Dashboard', to: '/risk' },
  { label: 'Release Readiness', to: '/report' },
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
                end={false}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
