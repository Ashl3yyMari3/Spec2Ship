import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Spec2Ship E2E tests.
 *
 * The tests run against the Vite dev server (frontend) which proxies API
 * calls to the Express backend. Both servers are started via webServer.
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // Start the Express backend on port 3001
      command: 'tsx src/backend/index.ts',
      url: 'http://localhost:3001/api/requirements',
      reuseExistingServer: !process.env.CI,
      timeout: 15_000,
    },
    {
      // Start the Vite frontend on port 5173
      command: 'vite',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 20_000,
    },
  ],
});
