import React from 'react';
import { Link } from 'react-router-dom';

export default function Header(): React.ReactElement {
  return (
    <header className="layout__header" role="banner">
      <Link to="/requirements" className="header__brand" aria-label="Spec2Ship — go to requirements">
        Spec2Ship
      </Link>
      <span className="header__tagline" aria-hidden="true">
        QA Traceability Dashboard
      </span>
    </header>
  );
}
