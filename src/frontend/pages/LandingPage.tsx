import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/react';
import '../styles/landing.css';

export default function LandingPage(): React.ReactElement {
  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__brand">
          <span className="landing__brand-orbit">◉</span>

          <div>
            <span className="landing__brand-name">
              Spec2Ship
            </span>

            <span className="landing__brand-subtitle">
              QA Mission Control
            </span>
          </div>
        </div>

        <div className="landing__nav-actions">
          <SignInButton mode="modal">
            <button
              type="button"
              className="landing__button landing__button--ghost"
            >
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button
              type="button"
              className="landing__button landing__button--primary"
            >
              Create Account
            </button>
          </SignUpButton>
        </div>
      </header>

      <main className="landing__main">
        <section className="landing__hero">
          <div className="landing__eyebrow">
            AI-assisted QA engineering workspace
          </div>

          <h1 className="landing__title">
            Release intelligence
            <span> for QA teams.</span>
          </h1>

          <p className="landing__description">
            Connect requirements, tests, automation,
            coverage, risk, and release readiness in one
            intelligent QA workspace.
          </p>

          <div className="landing__hero-actions">
            <SignUpButton mode="modal">
              <button
                type="button"
                className="landing__button landing__button--hero"
              >
                Launch Mission Control
              </button>
            </SignUpButton>

            <SignInButton mode="modal">
              <button
                type="button"
                className="landing__button landing__button--secondary"
              >
                Sign In
              </button>
            </SignInButton>
          </div>

          <div className="landing__flow">
            <span>Requirements</span>
            <span>→</span>
            <span>Tests</span>
            <span>→</span>
            <span>Coverage</span>
            <span>→</span>
            <span>Release Confidence</span>
          </div>
        </section>

        <section className="landing__preview">
          <div className="landing__preview-header">
            <div>
              <span className="landing__preview-label">
                SPEC2SHIP
              </span>

              <h2>QA Mission Control</h2>
            </div>

            <span className="landing__status">
              ● System Ready
            </span>
          </div>

          <div className="landing__metrics">
            <article className="landing__metric">
              <span>Requirements</span>
              <strong>Trace</strong>
              <small>
                Connect specifications directly to testing.
              </small>
            </article>

            <article className="landing__metric">
              <span>Coverage</span>
              <strong>Detect</strong>
              <small>
                Surface gaps before they become release risk.
              </small>
            </article>

            <article className="landing__metric">
              <span>Risk</span>
              <strong>Prioritize</strong>
              <small>
                Focus testing where failures matter most.
              </small>
            </article>

            <article className="landing__metric">
              <span>Automation</span>
              <strong>Build</strong>
              <small>
                Develop and run automation from one workspace.
              </small>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}