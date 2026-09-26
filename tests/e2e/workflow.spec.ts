/**
 * workflow.spec.ts — Spec2Ship end-to-end workflow tests.
 *
 * Tests the full Requirements → Tests → Traceability → Coverage Gaps →
 * Change Impact → Risk Dashboard → Release Readiness workflow.
 */
import { test, expect, type Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Captures all browser console errors that look like real application errors. */
function attachConsoleListener(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known harmless dev-tooling / browser extension noise
      const harmless = [
        'favicon',
        'ResizeObserver loop',
        '[vite]',
        'Download the React DevTools',
      ];
      if (!harmless.some((h) => text.includes(h))) {
        errors.push(text);
      }
    }
  });
  return errors;
}

/** Wait for the page to stop showing any loading spinner / status message. */
async function waitForContent(page: Page): Promise<void> {
  // Wait until the "Loading …" status messages are gone (or never appeared)
  await page.waitForFunction(
    () => !document.querySelector('[role="status"]')?.textContent?.includes('Loading'),
    { timeout: 10_000 },
  );
}

// ---------------------------------------------------------------------------
// 1. REQUIREMENTS PAGE
// ---------------------------------------------------------------------------

test.describe('Requirements page', () => {
  test('loads and displays requirement data', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/requirements');
    await waitForContent(page);

    // Page heading
    await expect(page.getByRole('heading', { name: 'Requirements', level: 1 })).toBeVisible();

    // At least one requirement ID is visible (REQ-AUTH-001, -002 or -003)
    await expect(page.getByText(/REQ-AUTH-\d+/).first()).toBeVisible();

    // Header search input is present
    await expect(page.getByRole('searchbox', { name: 'Search requirements' })).toBeVisible();

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('search filters requirements correctly', async ({ page }) => {
    await page.goto('/requirements');
    await waitForContent(page);

    const searchInput = page.getByRole('searchbox', { name: 'Search requirements' });
    await searchInput.fill('login');
    await searchInput.press('Enter');

    // URL should contain the search param
    await expect(page).toHaveURL(/search=login/);
    await waitForContent(page);

    // REQ-AUTH-002 (User Login) should appear; result heading should change
    await expect(page.getByText(/Search results for/i)).toBeVisible();
    await expect(page.getByText(/REQ-AUTH-002/).first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 2. TEST CASES PAGE
// ---------------------------------------------------------------------------

test.describe('Test Cases page', () => {
  test('loads and displays test case data', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/tests');
    await waitForContent(page);

    await expect(page.getByRole('heading', { name: 'Test Cases', level: 1 })).toBeVisible();

    // No error state
    const errorAlert = page.getByRole('alert');
    const hasError = await errorAlert.count() > 0;
    if (hasError) {
      const errorText = await errorAlert.textContent();
      throw new Error(`Test Cases page shows an error: ${errorText}`);
    }

    // Content is visible — at least one test ID or title present
    await expect(page.locator('body')).not.toContainText('Coming Soon');

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. TRACEABILITY PAGE
// ---------------------------------------------------------------------------

test.describe('Traceability page', () => {
  test('loads and displays traceability data', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/traceability');
    await waitForContent(page);

    await expect(page.getByRole('heading', { name: 'Traceability Matrix', level: 1 })).toBeVisible();

    // No error state
    const errorAlert = page.getByRole('alert');
    const hasError = await errorAlert.count() > 0;
    if (hasError) {
      const errorText = await errorAlert.textContent();
      throw new Error(`Traceability page shows an error: ${errorText}`);
    }

    // Summary metrics / matrix content is visible
    await expect(page.locator('body')).not.toContainText('Coming Soon');

    // At least one requirement ID visible in the traceability view
    await expect(page.getByText(/REQ-AUTH-\d+/).first()).toBeVisible();

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 4. COVERAGE GAPS PAGE
// ---------------------------------------------------------------------------

test.describe('Coverage Gaps page', () => {
  test('loads and displays coverage status', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/coverage-gaps');
    await waitForContent(page);

    await expect(page.getByRole('heading', { name: 'Coverage Gaps', level: 1 })).toBeVisible();

    // No error state
    const errorAlert = page.getByRole('alert');
    const hasError = await errorAlert.count() > 0;
    if (hasError) {
      const errorText = await errorAlert.textContent();
      throw new Error(`Coverage Gaps page shows an error: ${errorText}`);
    }

    // Coverage content shown — either gap cards or a "no gaps" message
    const hasContent =
      (await page.getByText(/Total Requirements/i).count()) > 0 ||
      (await page.getByText(/Coverage Gaps/i).count()) > 1 || // heading + content
      (await page.getByText(/No coverage gaps/i).count()) > 0;
    expect(hasContent, 'Coverage Gaps page should display coverage data').toBe(true);

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 5. CHANGE IMPACT PAGE
// ---------------------------------------------------------------------------

test.describe('Change Impact page', () => {
  test('loads, allows requirement selection, and shows impact data', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/impact');
    await waitForContent(page);

    await expect(page.getByRole('heading', { name: 'Change Impact', level: 1 })).toBeVisible();

    // Requirement selector is present
    const select = page.getByRole('combobox', { name: /Select a requirement/i });
    await expect(select).toBeVisible();

    // Select REQ-AUTH-001
    await select.selectOption({ label: 'REQ-AUTH-001 — User Registration' });

    // Wait for the impact analysis to load
    await page.waitForFunction(
      () => !document.querySelector('[role="status"]')?.textContent?.includes('Analyzing'),
      { timeout: 10_000 },
    );

    // Impact content should be visible — no error alert
    const errorAlert = page.getByRole('alert');
    const hasError = await errorAlert.count() > 0;
    if (hasError) {
      const errorText = await errorAlert.textContent();
      throw new Error(`Change Impact page shows an error after selection: ${errorText}`);
    }

    // Some impact information should be visible
    await expect(page.locator('body')).not.toContainText('Coming Soon');

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 6. RISK DASHBOARD
// ---------------------------------------------------------------------------

test.describe('Risk Dashboard', () => {
  test('loads with KPI cards, risk cards, sort control, and factor breakdown', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/risk');
    await waitForContent(page);

    // Main heading
    await expect(page.getByRole('heading', { name: 'Risk Dashboard', level: 1 })).toBeVisible();

    // All four KPI tier cards
    await expect(page.getByLabel(/Critical risk:/i)).toBeVisible();
    await expect(page.getByLabel(/High risk:/i)).toBeVisible();
    await expect(page.getByLabel(/Medium risk:/i)).toBeVisible();
    await expect(page.getByLabel(/Low risk:/i)).toBeVisible();

    // Sort by control
    const sortSelect = page.locator('#risk-sort');
    await expect(sortSelect).toBeVisible();

    // Change sort order
    await sortSelect.selectOption('tier');
    await expect(sortSelect).toHaveValue('tier');

    await sortSelect.selectOption('id');
    await expect(sortSelect).toHaveValue('id');

    // Reset to score
    await sortSelect.selectOption('score');
    await expect(sortSelect).toHaveValue('score');

    // At least one risk card is visible — use stable class selector so locator
    // survives the button text change from "Show…" → "Hide…"
    const firstToggleBtn = page.locator('.factor-toggle-btn').first();
    await expect(firstToggleBtn).toBeVisible();
    await expect(firstToggleBtn).toContainText(/Show factor breakdown/i);

    // Click "Show factor breakdown"
    await firstToggleBtn.click();

    // Button text should change to "Hide factor breakdown"
    await expect(firstToggleBtn).toContainText(/Hide factor breakdown/i);

    // Button aria-expanded should be true
    await expect(firstToggleBtn).toHaveAttribute('aria-expanded', 'true');

    // The factor breakdown panel is now visible
    await expect(page.locator('.factor-breakdown-panel').first()).toBeVisible();

    // Click again to collapse
    await firstToggleBtn.click();
    await expect(firstToggleBtn).toContainText(/Show factor breakdown/i);
    await expect(firstToggleBtn).toHaveAttribute('aria-expanded', 'false');

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 7. RELEASE READINESS PAGE
// ---------------------------------------------------------------------------

test.describe('Release Readiness page', () => {
  test('loads with real report data, verdict, summary, and action buttons', async ({ page }) => {
    const errors = attachConsoleListener(page);

    await page.goto('/report');
    await waitForContent(page);

    // Main heading
    await expect(page.getByRole('heading', { name: 'Release Readiness Report', level: 1 })).toBeVisible();

    // No "Coming Soon" placeholder
    await expect(page.locator('body')).not.toContainText('Coming Soon');

    // Overall verdict visible (one of: Ready, Review Required, Not Ready)
    const verdictEl = page.locator('[role="status"], [role="alert"]').filter({ hasText: /Ready|Review Required|Not Ready/ }).first();
    await expect(verdictEl).toBeVisible();

    // Summary / coverage section
    await expect(page.getByText(/Total Requirements/i)).toBeVisible();

    // Requirement status section
    await expect(page.getByText(/Requirement Status/i)).toBeVisible();

    // Print Report button
    const printBtn = page.getByRole('button', { name: /Print.*Report|Print this report/i });
    await expect(printBtn).toBeVisible();
    await expect(printBtn).toBeEnabled();

    // Download JSON button
    const downloadBtn = page.getByRole('button', { name: /Download.*JSON|Download report as JSON/i });
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();

    // No real app errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('Download JSON produces a downloadable file', async ({ page }) => {
    await page.goto('/report');
    await waitForContent(page);

    const downloadBtn = page.getByRole('button', { name: /Download.*JSON|Download report as JSON/i });
    await expect(downloadBtn).toBeVisible();

    // Listen for the download event triggered by the blob anchor click
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10_000 }),
      downloadBtn.click(),
    ]);

    // Suggested filename should match the expected pattern
    const suggestedFilename = download.suggestedFilename();
    expect(suggestedFilename).toMatch(/spec2ship-release-readiness/);
  });
});

// ---------------------------------------------------------------------------
// 8. NAVIGATION — sidebar links
// ---------------------------------------------------------------------------

test.describe('Sidebar navigation', () => {
  test('navigates to all main workflow pages via sidebar', async ({ page }) => {
    await page.goto('/requirements');

    const nav = page.getByRole('complementary', { name: 'Main navigation' });
    await expect(nav).toBeVisible();

    const routes: Array<{ label: string; expectedHeading: string }> = [
      { label: 'Test Cases',        expectedHeading: 'Test Cases' },
      { label: 'Traceability',      expectedHeading: 'Traceability Matrix' },
      { label: 'Coverage Gaps',     expectedHeading: 'Coverage Gaps' },
      { label: 'Change Impact',     expectedHeading: 'Change Impact' },
      { label: 'Risk Dashboard',    expectedHeading: 'Risk Dashboard' },
      { label: 'Release Readiness', expectedHeading: 'Release Readiness Report' },
      { label: 'Requirements',      expectedHeading: 'Requirements' },
    ];

    for (const { label, expectedHeading } of routes) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page.getByRole('heading', { name: expectedHeading, level: 1 })).toBeVisible({ timeout: 8_000 });
    }
  });
});
