# TASK 8 — FINAL END-TO-END TESTING AND POLISH

IMPORTANT: This task is ONLY for final testing, reliability fixes, and very small correctness/accessibility fixes.

DO NOT redesign the application.
DO NOT change the cosmic UI.
DO NOT replace or modify the current background images.
DO NOT replace or modify the risk-card planet images.
DO NOT change the header design, sidebar design, colors, spacing, layout, typography, or visual theme unless a specific test is impossible to complete because of an actual functional bug.
DO NOT upgrade or downgrade dependencies.
DO NOT change package versions.
DO NOT rename existing routes.
DO NOT restructure the application.
DO NOT rewrite working components unnecessarily.
DO NOT add new product features.
DO NOT commit changes.
DO NOT push changes to GitHub.

The current UI and application features are considered complete.

CURRENT SPEC2SHIP WORKFLOW

Requirements
→ Test Cases
→ Traceability
→ Coverage Gaps
→ Change Impact
→ Risk Dashboard
→ Release Readiness

Your job is to verify this workflow using the existing application and existing Playwright setup.

============================================================
1. REVIEW THE EXISTING PROJECT FIRST
============================================================

Before editing anything:

- Review package.json and the existing test configuration.
- Review the current frontend routes.
- Review any existing Playwright tests.
- Review the current page components only as needed to understand reliable selectors.
- Reuse existing accessible labels, headings, roles, IDs, and text where possible.
- Do not modify production code unless a failing test exposes a legitimate application issue.

The project already has these scripts:

npm run typecheck
npm test
npm run test:e2e
npm run build

Use the existing versions and configuration.

============================================================
2. CREATE OR UPDATE THE MAIN E2E WORKFLOW TEST
============================================================

Create or update:

tests/e2e/workflow.spec.ts

Do not create unnecessary duplicate E2E files if this file already exists.

The test suite should verify the following existing functionality.

============================================================
3. REQUIREMENTS PAGE
============================================================

Verify:

- /requirements loads successfully.
- The Requirements page heading is visible.
- Requirement data is displayed.
- At least one requirement ID or requirement card is visible.
- The header requirement search is present.
- Searching for an existing requirement term filters/navigates correctly.
- Test a realistic existing search value such as:
  login
  OR
  REQ-AUTH-003
  depending on the existing seeded data.
- Verify relevant search results are visible after searching.

Do not change the search design.

============================================================
4. TEST CASES PAGE
============================================================

Verify:

- /tests loads successfully.
- The page heading is visible.
- Existing test-case information is displayed.
- The page does not show an application error state.

Do not add or edit test cases just for the E2E test.

============================================================
5. TRACEABILITY PAGE
============================================================

Verify:

- /traceability loads successfully.
- The page heading is visible.
- Existing traceability information is displayed.
- Requirement/test relationships are visible.

Do not alter the traceability logic.

============================================================
6. COVERAGE GAPS PAGE
============================================================

Verify:

- /coverage-gaps loads successfully.
- The page heading is visible.
- Existing coverage-gap information or coverage status is displayed.
- The page loads without an application error.

============================================================
7. CHANGE IMPACT PAGE
============================================================

Verify:

- /impact loads successfully.
- The page heading is visible.
- The existing requirement-selection interaction is available.
- Select a requirement using the existing UI.
- Verify that the resulting change-impact information is displayed.

Do not create a new interaction if the current one already works.

============================================================
8. RISK DASHBOARD
============================================================

Verify:

- /risk loads successfully.
- The Risk Dashboard heading is visible.
- The Critical, High, Medium, and Low KPI cards are present.
- Existing risk requirement cards are displayed.
- The Sort By control is present.
- Change the sort option and verify the control updates successfully.
- Find at least one risk card.
- Click "Show factor breakdown".
- Verify the factor breakdown becomes visible.
- Verify the button can return to "Hide factor breakdown" or otherwise confirms the expanded state.

Do not modify the current cosmic risk-card artwork or styling.

============================================================
9. RELEASE READINESS
============================================================

Verify:

- /report loads successfully.
- The Release Readiness Report heading is visible.
- Real report data is shown, not the old "Coming Soon" placeholder.
- An overall verdict is visible.
- The report summary/coverage information is visible.
- Requirement status information is visible.
- The "Print Report" button is present.
- The "Download JSON" button is present.

For Download JSON:

- Use Playwright's download handling.
- Click Download JSON.
- Verify a download occurs.
- Verify the suggested filename contains:
  spec2ship-release-readiness
  or exactly:
  spec2ship-release-readiness.json

Do not trigger an actual operating-system print dialog in automated testing.
For Print Report, verifying the control is present and enabled is sufficient unless the existing Playwright environment provides a safe method to test window.print() without opening a blocking native dialog.

============================================================
10. NAVIGATION
============================================================

Verify the primary navigation works for the main workflow pages.

Prefer testing the existing sidebar navigation instead of directly navigating to every route when practical.

Do not rename navigation labels or routes simply to make tests easier.

============================================================
11. BROWSER CONSOLE ERRORS
============================================================

During the E2E workflow:

- Capture browser console errors where practical.
- Fail or report legitimate uncaught application errors.
- Ignore only known harmless development/tooling messages if clearly unrelated to Spec2Ship functionality.
- Do not suppress real errors simply to make tests pass.

============================================================
12. ACCESSIBILITY CHECK
============================================================

Perform a small targeted accessibility review only.

Check existing pages/components for:

- one clear page heading
- accessible button names
- search input label
- select control label
- aria-expanded on expandable controls
- aria-controls where appropriate
- proper table headers
- status/error roles where already implemented
- keyboard-focusable interactive controls

Only make a production-code change if there is a clear accessibility defect.

Do not perform a visual redesign.

============================================================
13. ALLOWED FIXES
============================================================

If a test fails because of a legitimate issue, you MAY make a small targeted fix.

Examples of acceptable fixes:

- correcting a broken selector-independent accessibility label
- fixing a broken route
- fixing an interaction that does not work
- fixing an actual console error
- adding a stable semantic identifier only when necessary
- correcting a genuine TypeScript or runtime bug

Examples of NOT acceptable changes:

- redesigning pages
- changing the cosmic theme
- replacing images
- changing layout spacing for aesthetic reasons
- changing component architecture
- changing backend business rules
- changing risk calculations
- changing release-readiness rules
- adding features
- upgrading dependencies
- changing package versions
- rewriting components that already work

============================================================
14. DO NOT TOUCH UNRELATED FILES
============================================================

Keep the scope as small as possible.

Prefer changes only to:

tests/e2e/workflow.spec.ts

and, only if a genuine bug is discovered, the minimum production file required to fix it.

Do NOT edit:

- cosmic background assets
- risk planet assets
- global visual styling unless required to fix an actual functional/accessibility defect
- package versions

============================================================
15. RUN FINAL VALIDATION
============================================================

Run all of these:

npm run typecheck
npm test
npm run test:e2e
npm run build

Do not stop after the first successful command.

If something fails:

1. Identify the exact reason.
2. Make only the smallest appropriate fix.
3. Re-run the affected command.
4. Re-run the full validation sequence before finishing.

============================================================
16. FINAL RESPONSE
============================================================

When finished, provide a concise Task 8 summary containing:

1. Files changed
2. E2E scenarios added or updated
3. Any application bugs found
4. Any production-code fixes made
5. Accessibility fixes, if any
6. Typecheck result
7. Unit-test result, including number of passing tests
8. E2E-test result, including number of passing tests
9. Build result
10. Any remaining limitation or issue

IMPORTANT:

Do not commit.
Do not push.
Do not modify the visual design.
Do not change dependencies.
Do not make unrelated improvements.

Stop after the tests, minimal fixes, validation, and final summary.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

TASK 8 — FINAL END-TO-END TESTING AND POLISH

IMPORTANT: This task is ONLY for final testing, reliability fixes, and very small correctness/accessibility fixes.

DO NOT redesign the application.
DO NOT change the cosmic UI.
DO NOT replace or modify the current background images.
DO NOT replace or modify the risk-card planet images.
DO NOT change the header design, sidebar design, colors, spacing, layout, typography, or visual theme unless a specific test is impossible to complete because of an actual functional bug.
DO NOT upgrade or downgrade dependencies.
DO NOT change package versions.
DO NOT rename existing routes.
DO NOT restructure the application.
DO NOT rewrite working components unnecessarily.
DO NOT add new product features.
DO NOT commit changes.
DO NOT push changes to GitHub.

The current UI and application features are considered complete.

CURRENT SPEC2SHIP WORKFLOW

Requirements
→ Test Cases
→ Traceability
→ Coverage Gaps
→ Change Impact
→ Risk Dashboard
→ Release Readiness

Your job is to verify this workflow using the existing application and existing Playwright setup.

============================================================
1. REVIEW THE EXISTING PROJECT FIRST
============================================================

Before editing anything:

- Review package.json and the existing test configuration.
- Review the current frontend routes.
- Review any existing Playwright tests.
- Review the current page components only as needed to understand reliable selectors.
- Reuse existing accessible labels, headings, roles, IDs, and text where possible.
- Do not modify production code unless a failing test exposes a legitimate application issue.

The project already has these scripts:

npm run typecheck
npm test
npm run test:e2e
npm run build

Use the existing versions and configuration.

============================================================
2. CREATE OR UPDATE THE MAIN E2E WORKFLOW TEST
============================================================

Create or update:

tests/e2e/workflow.spec.ts

Do not create unnecessary duplicate E2E files if this file already exists.

The test suite should verify the following existing functionality.

============================================================
3. REQUIREMENTS PAGE
============================================================

Verify:

- /requirements loads successfully.
- The Requirements page heading is visible.
- Requirement data is displayed.
- At least one requirement ID or requirement card is visible.
- The header requirement search is present.
- Searching for an existing requirement term filters/navigates correctly.
- Test a realistic existing search value such as:
  login
  OR
  REQ-AUTH-003
  depending on the existing seeded data.
- Verify relevant search results are visible after searching.

Do not change the search design.

============================================================
4. TEST CASES PAGE
============================================================

Verify:

- /tests loads successfully.
- The page heading is visible.
- Existing test-case information is displayed.
- The page does not show an application error state.

Do not add or edit test cases just for the E2E test.

============================================================
5. TRACEABILITY PAGE
============================================================

Verify:

- /traceability loads successfully.
- The page heading is visible.
- Existing traceability information is displayed.
- Requirement/test relationships are visible.

Do not alter the traceability logic.

============================================================
6. COVERAGE GAPS PAGE
============================================================

Verify:

- /coverage-gaps loads successfully.
- The page heading is visible.
- Existing coverage-gap information or coverage status is displayed.
- The page loads without an application error.

============================================================
7. CHANGE IMPACT PAGE
============================================================

Verify:

- /impact loads successfully.
- The page heading is visible.
- The existing requirement-selection interaction is available.
- Select a requirement using the existing UI.
- Verify that the resulting change-impact information is displayed.

Do not create a new interaction if the current one already works.

============================================================
8. RISK DASHBOARD
============================================================

Verify:

- /risk loads successfully.
- The Risk Dashboard heading is visible.
- The Critical, High, Medium, and Low KPI cards are present.
- Existing risk requirement cards are displayed.
- The Sort By control is present.
- Change the sort option and verify the control updates successfully.
- Find at least one risk card.
- Click "Show factor breakdown".
- Verify the factor breakdown becomes visible.
- Verify the button can return to "Hide factor breakdown" or otherwise confirms the expanded state.

Do not modify the current cosmic risk-card artwork or styling.

============================================================
9. RELEASE READINESS
============================================================

Verify:

- /report loads successfully.
- The Release Readiness Report heading is visible.
- Real report data is shown, not the old "Coming Soon" placeholder.
- An overall verdict is visible.
- The report summary/coverage information is visible.
- Requirement status information is visible.
- The "Print Report" button is present.
- The "Download JSON" button is present.

For Download JSON:

- Use Playwright's download handling.
- Click Download JSON.
- Verify a download occurs.
- Verify the suggested filename contains:
  spec2ship-release-readiness
  or exactly:
  spec2ship-release-readiness.json

Do not trigger an actual operating-system print dialog in automated testing.
For Print Report, verifying the control is present and enabled is sufficient unless the existing Playwright environment provides a safe method to test window.print() without opening a blocking native dialog.

============================================================
10. NAVIGATION
============================================================

Verify the primary navigation works for the main workflow pages.

Prefer testing the existing sidebar navigation instead of directly navigating to every route when practical.

Do not rename navigation labels or routes simply to make tests easier.

============================================================
11. BROWSER CONSOLE ERRORS
============================================================

During the E2E workflow:

- Capture browser console errors where practical.
- Fail or report legitimate uncaught application errors.
- Ignore only known harmless development/tooling messages if clearly unrelated to Spec2Ship functionality.
- Do not suppress real errors simply to make tests pass.

============================================================
12. ACCESSIBILITY CHECK
============================================================

Perform a small targeted accessibility review only.

Check existing pages/components for:

- one clear page heading
- accessible button names
- search input label
- select control label
- aria-expanded on expandable controls
- aria-controls where appropriate
- proper table headers
- status/error roles where already implemented
- keyboard-focusable interactive controls

Only make a production-code change if there is a clear accessibility defect.

Do not perform a visual redesign.

============================================================
13. ALLOWED FIXES
============================================================

If a test fails because of a legitimate issue, you MAY make a small targeted fix.

Examples of acceptable fixes:

- correcting a broken selector-independent accessibility label
- fixing a broken route
- fixing an interaction that does not work
- fixing an actual console error
- adding a stable semantic identifier only when necessary
- correcting a genuine TypeScript or runtime bug

Examples of NOT acceptable changes:

- redesigning pages
- changing the cosmic theme
- replacing images
- changing layout spacing for aesthetic reasons
- changing component architecture
- changing backend business rules
- changing risk calculations
- changing release-readiness rules
- adding features
- upgrading dependencies
- changing package versions
- rewriting components that already work

============================================================
14. DO NOT TOUCH UNRELATED FILES
============================================================

Keep the scope as small as possible.

Prefer changes only to:

tests/e2e/workflow.spec.ts

and, only if a genuine bug is discovered, the minimum production file required to fix it.

Do NOT edit:

- cosmic background assets
- risk planet assets
- global visual styling unless required to fix an actual functional/accessibility defect
- package versions

============================================================
15. RUN FINAL VALIDATION
============================================================

Run all of these:

npm run typecheck
npm test
npm run test:e2e
npm run build

Do not stop after the first successful command.

If something fails:

1. Identify the exact reason.
2. Make only the smallest appropriate fix.
3. Re-run the affected command.
4. Re-run the full validation sequence before finishing.

============================================================
16. FINAL RESPONSE
============================================================

When finished, provide a concise Task 8 summary containing:

1. Files changed
2. E2E scenarios added or updated
3. Any application bugs found
4. Any production-code fixes made
5. Accessibility fixes, if any
6. Typecheck result
7. Unit-test result, including number of passing tests
8. E2E-test result, including number of passing tests
9. Build result
10. Any remaining limitation or issue

IMPORTANT:

Do not commit.
Do not push.
Do not modify the visual design.
Do not change dependencies.
Do not make unrelated improvements.

Stop after the tests, minimal fixes, validation, and final summary.

---

### 🤖 Assistant

> 🔧 called: update_todo_list

I'll start by thoroughly reviewing the existing project structure before making any changes.

> 🔧 **update_todo_list** — 
[-] Review project structure, package.json, routes, and existing tests
[ ] Review page components for reliable selectors
[ ] Create/update tests/e2e/workflow.spec.ts
[ ] Run npm run typecheck
[ ] Run npm test
[ ] Run npm run test:e2e
[ ] Run npm run build
[ ] Fix any legitimate bugs found
[ ] Re-run full validation after fixes
[ ] Provide final summary


### 🤖 Assistant

> 🔧 called: read_file, list_files, list_files



> 🔧 **list_files** — src/frontend

> 🔧 **list_files** — tests

> 🔧 **read_file** — package.json

### 🤖 Assistant

> 🔧 called: read_file, list_files, list_files



> 🔧 **list_files** — src/frontend/pages

> 🔧 **list_files** — src/frontend/components

> 🔧 **read_file** — src/frontend/App.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/frontend/pages/RequirementsPage.tsx

> 🔧 **read_file** — src/frontend/pages/RiskPage.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/frontend/pages/ImpactPage.tsx

> 🔧 **read_file** — src/frontend/pages/ReportPage.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/frontend/pages/CoverageGapsPage.tsx

> 🔧 **read_file** — src/frontend/pages/TestsPage.tsx

> 🔧 **read_file** — src/frontend/pages/TraceabilityPage.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now let me review the key components for reliable selectors:

> 🔧 **read_file** — src/frontend/components/Layout/AppLayout.tsx

> 🔧 **read_file** — src/frontend/components/Risk/RiskDashboard.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/frontend/components/Layout/Header.tsx

> 🔧 **read_file** — src/frontend/components/Layout/Sidebar.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — src/frontend/components/Risk/RiskDashboard.tsx

> 🔧 **read_file** — src/frontend/components/Report/ReleaseReport.tsx

### 🤖 Assistant

> 🔧 called: read_file, glob



> 🔧 **read_file** — src/frontend/components/Risk/RiskDashboard.tsx

> 🔧 **glob** — playwright.config.*

### 🤖 Assistant

> 🔧 called: glob, read_file



> 🔧 **read_file** — src/frontend/components/Risk/RiskDashboard.tsx

> 🔧 **glob** — playwright.config.ts

### 🤖 Assistant

> 🔧 called: list_files, read_file

Now let me check for the playwright config and backend to understand the test setup:

> 🔧 **list_files** — .

> 🔧 **read_file** — src/backend/index.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — vite.config.ts

> 🔧 **read_file** — vitest.config.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — tsconfig.json

> 🔧 **read_file** — src/backend/server.ts

### 🤖 Assistant

> 🔧 called: list_files

Now let me look at the seeded data to understand what's available for tests:

> 🔧 **list_files** — data

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — data/requirements/authentication.md

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — data/requirements/authentication.md

### 🤖 Assistant

> 🔧 called: execute_command, read_file

Now I have enough context. Let me check if there's any existing playwright config or if I need to create one:

> 🔧 **execute_command** — ls -la tests/e2e/ && cat tests/e2e/.gitkeep 2>/dev/null || true

> 🔧 **read_file** — src/frontend/components/Gaps/CoverageGaps.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file

Now I have a thorough understanding of the project. There's no playwright config yet - I need to create it, plus the workflow spec. Let me also check the Traceability component and Report components for good selectors:

> 🔧 **read_file** — src/frontend/components/Traceability/TraceabilitySummary.tsx

> 🔧 **read_file** — src/frontend/components/Report/VerdictBanner.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have all the information I need. Let me create the playwright config and the E2E workflow test:

> 🔧 **update_todo_list** — 
[x] Review project structure, package.json, routes, and existing tests
[x] Review page components for reliable selectors
[-] Create/update tests/e2e/workflow.spec.ts
[ ] Create playwright.config.ts
[ ] Run npm run typecheck
[ ] Run npm test
[ ] Run npm run test:e2e
[ ] Run npm run build
[ ] Fix any legitimate bugs found
[ ] Re-run full validation after fixes
[ ] Provide final summary


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — playwright.config.ts

### 🤖 Assistant

> 🔧 called: write_file

Now create the comprehensive E2E workflow test:

> 🔧 **write_file** — tests/e2e/workflow.spec.ts

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Review project structure, package.json, routes, and existing tests
[x] Review page components for reliable selectors
[x] Create/update tests/e2e/workflow.spec.ts
[x] Create playwright.config.ts
[-] Run npm run typecheck
[ ] Run npm test
[ ] Run npm run test:e2e
[ ] Run npm run build
[ ] Fix any legitimate bugs found
[ ] Re-run full validation after fixes
[ ] Provide final summary


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run typecheck 2>&1

### 🤖 Assistant

> 🔧 called: apply_diff

Fix these three TypeScript issues:

> 🔧 **apply_diff** — tests/e2e/workflow.spec.ts

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — tests/e2e/workflow.spec.ts

### 🤖 Assistant

> 🔧 called: apply_diff

I need to remove the unused `firstCard` variable:

> 🔧 **apply_diff** — tests/e2e/workflow.spec.ts

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run typecheck 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

Typecheck passes cleanly. Now run unit tests:

> 🔧 **update_todo_list** — 
[x] Review project structure, package.json, routes, and existing tests
[x] Review page components for reliable selectors
[x] Create/update tests/e2e/workflow.spec.ts
[x] Create playwright.config.ts
[x] Run npm run typecheck
[-] Run npm test
[ ] Run npm run test:e2e
[ ] Run npm run build
[ ] Fix any legitimate bugs found
[ ] Re-run full validation after fixes
[ ] Provide final summary


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm test 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

89 tests all pass. Now run E2E tests:

> 🔧 **update_todo_list** — 
[x] Review project structure, package.json, routes, and existing tests
[x] Review page components for reliable selectors
[x] Create/update tests/e2e/workflow.spec.ts
[x] Create playwright.config.ts
[x] Run npm run typecheck
[x] Run npm test
[-] Run npm run test:e2e
[ ] Run npm run build
[ ] Fix any legitimate bugs found
[ ] Re-run full validation after fixes
[ ] Provide final summary


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run test:e2e 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Playwright browsers aren't installed. This is a setup requirement, not a code issue. Install them:

> 🔧 **execute_command** — npx playwright install chromium 2>&1

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run test:e2e 2>&1

### 🤖 Assistant

> 🔧 called: read_file

9 tests pass, 1 fails. The issue is that clicking `firstToggleBtn` after re-resolving via name `/Show factor breakdown/i` doesn't work because after clicking, the button's accessible name changes to "Hide factor breakdown", which means the locator still matches the *original* button but the click somehow isn't registering — or the locator is resolving to a different button. Let me investigate the actual RiskDashboard button click behavior:

The problem is the button click isn't actually toggling. Looking at the error, the button is being found (it resolves 14 times) but stays `aria-expanded="false"`. This means the click isn't working as expected — possibly because the button text includes an SVG chevron element that intercepts clicks. Let me look more carefully at what `factor-toggle-btn` looks like:

> 🔧 **read_file** — src/frontend/components/Risk/RiskDashboard.tsx

### 🤖 Assistant

> 🔧 called: read_file

The component looks correct. The problem is with how the locator resolves after clicking. After the click:
1. The button's text changes to "Hide factor breakdown"
2. The locator `getByRole('button', { name: /Show factor breakdown/i })` no longer matches that button
3. So `toHaveText(/Hide factor breakdown/i)` fails because no matching button has that text

The fix is to capture the button's locator by a stable attribute (`aria-controls`) instead of by name, so it stays the same element after the text changes.

Let me fix the test to use a stable locator for the toggle button:

> 🔧 **read_file** — tests/e2e/workflow.spec.ts

### 🤖 Assistant

> 🔧 called: apply_diff

The issue is clear: `getByRole('button', { name: /Show factor breakdown/i })` is a **live** locator that matches by accessible name. After clicking, the button text changes to "Hide factor breakdown", so the locator no longer resolves to that button. I need to use the stable CSS class selector `.factor-toggle-btn` to identify the first button:

> 🔧 **apply_diff** — <<<<<<< SEARCH
:start_line:256
-------
    // At least one risk card is visible
    const firstToggleBtn = page.getByRole('button', { name: /Show factor breakdown/i }).first();
    await expect(firstToggleBtn).toBeVisible();

    // Click "Show factor breakdown"
    await firstToggleBtn.click();

    // Button text should change to "Hide factor breakdown"
    await expect(firstToggleBtn).toHaveText(/Hide factor breakdown/i);

    // Button aria-expanded should be true
    await expect(firstToggleBtn).toHaveAttribute('aria-expanded', 'true');

    // The factor breakdown panel is now visible
    await expect(page.locator('.factor-breakdown-panel').first()).toBeVisible();

    // Click again to collapse
    await firstToggleBtn.click();
    await expect(firstToggleBtn).toHaveText(/Show factor breakdown/i);
    await expect(firstToggleBtn).toHaveAttribute('aria-expanded', 'false');
=======
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
>>>>>>> REPLACE


### 🤖 Assistant

> 🔧 called: execute_command

Now run typecheck to make sure it's still clean, then re-run E2E:

> 🔧 **execute_command** — npm run typecheck 2>&1 && npm run test:e2e 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

All 10 E2E tests pass. Now run the build:

> 🔧 **update_todo_list** — 
[x] Review project structure, package.json, routes, and existing tests
[x] Review page components for reliable selectors
[x] Create/update tests/e2e/workflow.spec.ts
[x] Create playwright.config.ts
[x] Run npm run typecheck
[x] Run npm test
[x] Run npm run test:e2e
[-] Run npm run build
[ ] Fix any legitimate bugs found
[ ] Re-run full validation after fixes
[ ] Provide final summary


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run build 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Build is clean. All validations pass. Let me do a final complete run to confirm everything:

> 🔧 **execute_command** — npm run typecheck 2>&1 && echo "--- TYPECHECK OK ---" && npm test 2>&1 && echo "--- UNIT TESTS OK ---" && npm run test:e2e 2>&1 && echo "--- E2E OK ---" && npm run build 2>&1 && echo "--- BUILD OK ---"

### 🤖 Assistant

> 🔧 called: update_todo_list

All four validation commands pass cleanly.

> 🔧 **update_todo_list** — 
[x] Review project structure, package.json, routes, and existing tests
[x] Review page components for reliable selectors
[x] Create/update tests/e2e/workflow.spec.ts
[x] Create playwright.config.ts
[x] Run npm run typecheck
[x] Run npm test
[x] Run npm run test:e2e
[x] Run npm run build
[x] Fix any legitimate bugs found
[x] Re-run full validation after fixes
[-] Provide final summary


### 🤖 Assistant

---

## Task 8 — Final Summary

### 1. Files Changed

| File | Action |
|---|---|
| [`playwright.config.ts`](playwright.config.ts) | **Created** — Playwright configuration: Chromium only, 1 worker, `webServer` blocks that auto-start both the Express backend (port 3001) and Vite frontend (port 5173) |
| [`tests/e2e/workflow.spec.ts`](tests/e2e/workflow.spec.ts) | **Created** — Full end-to-end workflow test suite (10 tests) |

No production source files were modified.

---

### 2. E2E Scenarios Added

All 10 tests in **`tests/e2e/workflow.spec.ts`**:

| # | Describe | Test |
|---|---|---|
| 1 | Requirements page | Loads, displays requirement IDs, search input present |
| 2 | Requirements page | Search for "login" → URL updates, results filtered, REQ-AUTH-002 visible |
| 3 | Test Cases page | Loads, displays data, no error state |
| 4 | Traceability page | Loads, heading visible, REQ-AUTH IDs present |
| 5 | Coverage Gaps page | Loads, coverage status displayed |
| 6 | Change Impact page | Loads, select REQ-AUTH-001, impact analysis displayed |
| 7 | Risk Dashboard | KPI cards (Critical/High/Medium/Low), sort control, toggle button expand/collapse, `aria-expanded`, `.factor-breakdown-panel` visible |
| 8 | Release Readiness page | Heading, real report data (not "Coming Soon"), verdict, summary, Print/Download buttons |
| 9 | Release Readiness page | Download JSON → download event fires, filename matches `spec2ship-release-readiness` |
| 10 | Sidebar navigation | Clicks every nav link in turn, verifies correct `h1` heading per page |

---

### 3. Application Bugs Found

None. All pages loaded correctly, all features worked, no console errors were observed during the E2E run.

---

### 4. Production-Code Fixes Made

**None.** No production source files were touched.

---

### 5. Accessibility Fixes

No accessibility defects were found that required a code change. The existing components already have:
- `role="status"` / `role="alert"` on loading/error states
- `aria-label` on search input, buttons, KPI cards, verdict banner
- `aria-expanded` + `aria-controls` on the factor-toggle button
- `aria-label="Main navigation"` on the sidebar `<aside>`
- Proper `<label htmlFor>` on the sort select and impact select

---

### 6. Typecheck Result

✅ **0 errors** — `tsc --noEmit` exits cleanly.

---

### 7. Unit-Test Result

✅ **89 tests passing** across 6 test files (5 unit + 1 integration). Zero failures.

---

### 8. E2E-Test Result

✅ **10 / 10 tests passing** in Chromium. Total duration ≈ 4 s.

One test required a locator fix during development: the Risk Dashboard toggle-button test initially used `getByRole('button', { name: /Show factor breakdown/i })`, which stopped resolving after the text changed. Fixed by using the stable CSS class selector `.factor-toggle-btn` so the locator survives the text change from "Show…" → "Hide…".

---

### 9. Build Result

✅ **Clean production build** — `tsc -p tsconfig.node.json && vite build` completes in ~730 ms with no errors or warnings (asset sizes are expected large due to planet/background PNG assets).

---

### 10. Remaining Limitations / Notes

- **Playwright browsers must be installed** via `npx playwright install chromium` before the first E2E run on a new machine. The package is present in `devDependencies` but browser binaries are not committed to the repo (standard Playwright behaviour).
- Only Chromium is configured for E2E. Firefox/WebKit can be added to [`playwright.config.ts`](playwright.config.ts) if cross-browser coverage is needed later.
- The Download JSON test relies on `page.waitForEvent('download')`. This works in Playwright's Chromium context because Playwright intercepts the programmatic `<a>.click()` blob download — no OS file-system dialog is triggered.
- `window.print()` is not exercised (as instructed); only button presence and `enabled` state are verified.