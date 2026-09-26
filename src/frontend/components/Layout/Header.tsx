import React from 'react';
import { Link } from 'react-router-dom';

// Inline orbital SVG logo — planet with orbiting ring
const OrbitalLogo = (
  <svg
    className="header__logo-icon"
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="logoGrad" cx="38%" cy="32%" r="58%">
        <stop offset="0%" stopColor="#C4B5FD"/>
        <stop offset="45%" stopColor="#7C3AED"/>
        <stop offset="100%" stopColor="#3B0764"/>
      </radialGradient>
      <radialGradient id="logoRim" cx="50%" cy="50%" r="50%">
        <stop offset="68%" stopColor="transparent"/>
        <stop offset="86%" stopColor="#A78BFA" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="transparent"/>
      </radialGradient>
    </defs>
    {/* Planet */}
    <circle cx="16" cy="16" r="8" fill="url(#logoGrad)"/>
    <circle cx="16" cy="16" r="8" fill="url(#logoRim)"/>
    {/* Orbital ring */}
    <ellipse
      cx="16" cy="16" rx="14" ry="5"
      fill="none"
      stroke="url(#logoGrad)"
      strokeWidth="1.5"
      transform="rotate(-20 16 16)"
      opacity="0.8"
    />
    {/* Orbital dot (satellite) */}
    <circle
      cx="27"
      cy="13.5"
      r="1.5"
      fill="#A78BFA"
      opacity="0.9"
    />
  </svg>
);

export default function Header(): React.ReactElement {
  return (
    <header className="layout__header" role="banner">
      <Link to="/requirements" className="header__brand" aria-label="Spec2Ship — go to requirements">
        {OrbitalLogo}
        <span className="header__brand-text">Spec2Ship</span>
      </Link>
      <span className="header__tagline" aria-hidden="true">
        Requirements → Tests → Release Confidence
      </span>
    </header>
  );
}
