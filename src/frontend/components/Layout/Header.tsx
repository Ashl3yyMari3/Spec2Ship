import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function OrbitalLogo(): React.ReactElement {
  return (
    <svg
      className="header__logo-icon"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="6"
        fill="#A78BFA"
      />

      <ellipse
        cx="20"
        cy="20"
        rx="16"
        ry="7"
        stroke="#8B5CF6"
        strokeWidth="1.5"
      />

      <ellipse
        cx="20"
        cy="20"
        rx="7"
        ry="16"
        stroke="#22D3EE"
        strokeWidth="1.5"
        transform="rotate(38 20 20)"
      />

      <circle
        cx="33"
        cy="18"
        r="2"
        fill="#39FF88"
      />
    </svg>
  );
}

export default function Header(): React.ReactElement {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      navigate('/requirements');
      return;
    }

    navigate(
      `/requirements?search=${encodeURIComponent(
        trimmedQuery,
      )}`,
    );
  }

  return (
    <header
      className="layout__header"
      role="banner"
    >
      <Link
        to="/risk"
        className="header__brand"
        aria-label="Spec2Ship — go to risk dashboard"
      >
        <OrbitalLogo />

        <span className="header__brand-copy">
          <span className="header__brand-text">
            Spec2Ship
          </span>

          <span className="header__brand-subtitle">
            Requirements → Tests → Release Confidence
          </span>
        </span>
      </Link>

      <form
        className="header-search"
        role="search"
        onSubmit={handleSubmit}
      >
        <span
          className="header-search__icon"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search requirements..."
          aria-label="Search requirements"
        />
      </form>

      <span
        className="header__mission-control"
        aria-hidden="true"
      >
        QA Mission Control
      </span>
    </header>
  );
}