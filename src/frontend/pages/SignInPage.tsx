import React, {
  FormEvent,
  useState,
} from 'react';
import {
  useAuth,
  useSignIn,
} from '@clerk/react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import '../styles/auth.css';

const clerkConfigured = Boolean(
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim(),
);

function AuthSetupNotice(): React.ReactElement {
  return (
    <main className="auth-page">
      <section className="auth-shell auth-shell--single">
        <div className="auth-card auth-card--setup">
          <div className="auth-brand">
            <span className="auth-brand__orb">S2S</span>
            <span>Spec2Ship</span>
          </div>

          <p className="auth-eyebrow">
            Authentication Setup
          </p>

          <h1>Clerk is ready for your keys.</h1>

          <p className="auth-copy">
            Add your Clerk publishable key to
            <code> VITE_CLERK_PUBLISHABLE_KEY </code>
            in your local <code>.env</code> file, then
            restart Spec2Ship.
          </p>

          <Link
            to="/"
            className="auth-secondary-link"
          >
            Return to Spec2Ship
          </Link>
        </div>
      </section>
    </main>
  );
}

function ClerkSignInForm(): React.ReactElement {
  const navigate = useNavigate();
  const {
    isLoaded: authLoaded,
    isSignedIn,
  } = useAuth();
  const {
    signIn,
    errors,
    fetchStatus,
  } = useSignIn();

  const [emailAddress, setEmailAddress] =
    useState('');
  const [password, setPassword] =
    useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);
  const [flowError, setFlowError] =
    useState<string | null>(null);
  const [verificationReady, setVerificationReady] =
    useState(false);

  const loading =
    fetchStatus === 'fetching';

  if (authLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  async function finishSignIn(): Promise<void> {
    await signIn.finalize({
      navigate: ({
        session,
        decorateUrl,
      }) => {
        if (session?.currentTask) {
          setFlowError(
            'Your account needs an additional authentication step before Spec2Ship can continue.',
          );
          return;
        }

        const destination =
          decorateUrl('/');

        if (destination.startsWith('http')) {
          window.location.href = destination;
          return;
        }

        navigate(destination);
      },
    });
  }

  async function prepareEmailVerification(): Promise<void> {
    const emailFactor =
      signIn.supportedSecondFactors.find(
        (factor) =>
          factor.strategy === 'email_code',
      );

    if (!emailFactor) {
      setFlowError(
        'This account requires an additional verification method that this first Spec2Ship sign-in screen does not support yet.',
      );
      return;
    }

    await signIn.mfa.sendEmailCode();
    setVerificationReady(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFlowError(null);

    const { error } =
      await signIn.password({
        emailAddress:
          emailAddress.trim(),
        password,
      });

    if (error) {
      return;
    }

    if (signIn.status === 'complete') {
      await finishSignIn();
      return;
    }

    if (
      signIn.status ===
        'needs_client_trust' ||
      signIn.status ===
        'needs_second_factor'
    ) {
      await prepareEmailVerification();
      return;
    }

    setFlowError(
      'Spec2Ship could not complete sign in with the current authentication state.',
    );
  }

  async function handleVerify(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setFlowError(null);

    await signIn.mfa.verifyEmailCode({
      code: code.trim(),
    });

    if (signIn.status === 'complete') {
      await finishSignIn();
      return;
    }

    setFlowError(
      'The verification step is not complete yet. Please try again.',
    );
  }

  const needsVerification =
    verificationReady ||
    signIn.status ===
      'needs_client_trust' ||
    signIn.status ===
      'needs_second_factor';

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <div className="auth-story">
          <Link
            to="/"
            className="auth-brand"
          >
            <span className="auth-brand__orb">
              S2S
            </span>
            <span>Spec2Ship</span>
          </Link>

          <div className="auth-story__content">
            <p className="auth-eyebrow">
              Release Intelligence
            </p>

            <h1>
              Turn QA evidence into a clear
              ship decision.
            </h1>

            <p>
              Connect requirements, tests,
              automation, coverage, risk, and
              change impact in one explainable
              release workflow.
            </p>

            <div className="auth-story__signal">
              <span>100% Coverage</span>
              <strong>Review Required</strong>
              <small>
                Coverage is only part of release
                readiness.
              </small>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div>
            <p className="auth-eyebrow">
              Welcome Back
            </p>
            <h2>
              Sign in to Spec2Ship
            </h2>
            <p className="auth-card__intro">
              Continue to your QA workspaces and
              release evidence.
            </p>
          </div>

          {needsVerification ? (
            <form
              className="auth-form"
              onSubmit={(event) =>
                void handleVerify(event)
              }
            >
              <label>
                <span>Verification code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) =>
                    setCode(
                      event.target.value,
                    )
                  }
                  placeholder="Enter code"
                  required
                />

                {errors.fields.code && (
                  <small className="auth-field-error">
                    {
                      errors.fields.code
                        .message
                    }
                  </small>
                )}
              </label>

              <p className="auth-helper">
                Clerk requires an additional
                verification step for this sign-in.
              </p>

              {flowError && (
                <div
                  className="auth-error"
                  role="alert"
                >
                  {flowError}
                </div>
              )}

              <button
                type="submit"
                className="auth-primary-button"
                disabled={
                  loading ||
                  !code.trim()
                }
              >
                {loading
                  ? 'Verifying…'
                  : 'Verify & Continue'}
              </button>

              <button
                type="button"
                className="auth-link-button"
                onClick={() => {
                  setCode('');
                  setVerificationReady(false);
                  setFlowError(null);
                  signIn.reset();
                }}
                disabled={loading}
              >
                Start over
              </button>
            </form>
          ) : (
            <form
              className="auth-form"
              onSubmit={(event) =>
                void handleSubmit(event)
              }
            >
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={emailAddress}
                  onChange={(event) =>
                    setEmailAddress(
                      event.target.value,
                    )
                  }
                  placeholder="you@company.com"
                  required
                />

                {errors.fields.identifier && (
                  <small className="auth-field-error">
                    {
                      errors.fields.identifier
                        .message
                    }
                  </small>
                )}
              </label>

              <label>
                <span>Password</span>

                <div className="auth-password">
                  <input
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showPassword
                      ? 'Hide'
                      : 'Show'}
                  </button>
                </div>

                {errors.fields.password && (
                  <small className="auth-field-error">
                    {
                      errors.fields.password
                        .message
                    }
                  </small>
                )}
              </label>

              {flowError && (
                <div
                  className="auth-error"
                  role="alert"
                >
                  {flowError}
                </div>
              )}

              <button
                type="submit"
                className="auth-primary-button"
                disabled={
                  loading ||
                  !emailAddress.trim() ||
                  !password
                }
              >
                {loading
                  ? 'Signing in…'
                  : 'Sign In'}
              </button>
            </form>
          )}

          <div className="auth-card__footer">
            <span>New to Spec2Ship?</span>
            <span>
              Account creation is the next
              authentication screen we’re building.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SignInPage(): React.ReactElement {
  if (!clerkConfigured) {
    return <AuthSetupNotice />;
  }

  return <ClerkSignInForm />;
}
