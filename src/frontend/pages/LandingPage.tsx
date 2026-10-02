import React from 'react';
import { SignInButton, SignUpButton } from '@clerk/react';

export default function LandingPage(): React.ReactElement {
  return (
    <div style={{ padding: '80px 32px', textAlign: 'center' }}>
      <h1>Spec2Ship</h1>

      <p>
        Turn requirements into release confidence.
      </p>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '24px',
        }}
      >
        <SignInButton mode="modal">
          <button type="button">Sign In</button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button type="button">Create Account</button>
        </SignUpButton>
      </div>
    </div>
  );
}