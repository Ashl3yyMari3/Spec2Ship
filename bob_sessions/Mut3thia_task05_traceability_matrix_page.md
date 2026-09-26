# You are implementing TASK 5 of the Spec2Ship project.

==================================================
PROJECT CONTEXT
===============

Project: Spec2Ship

Repository:
https://github.com/Ashl3yyMari3/Spec2Ship

Spec2Ship is an AI-assisted QA traceability and release-readiness tool. It takes software requirements and connects them to test cases so QA/development teams can see:

* which requirements are covered by tests
* which requirements have coverage gaps
* which tests are affected by requirement changes
* requirement risk levels
* whether software is Ready, Review Required, or Not Ready for release

The demo application is a fictional e-commerce system called ShopSphere, currently focused primarily on authentication requirements such as registration, login, and account lockout.

==================================================
CURRENT PROJECT STATUS
======================

Task 1: Architecture / Planning
COMPLETE

Task 2: Project Foundation
COMPLETE

Task 3: Backend
COMPLETE

Task 4: Frontend Foundation + Requirements + Test Cases
COMPLETE and already pushed to main

Task 5: Traceability Matrix
THIS IS YOUR TASK

Task 6: Coverage Gaps + Change Impact + Risk
NOT YET

Task 7: Release Readiness
NOT YET

==================================================
IMPORTANT TEAM / GIT CONTEXT
============================

Another developer is currently working separately on a pre-existing Task 3 parser/environment issue.

The current shared main branch may show:

83 passing / 5 failing tests

The five failures concern:

* acceptance-criteria parsing
* downstream suggested-test generation

The other developer is handling this issue separately.

DO NOT attempt to fix that issue as part of Task 5.

DO NOT modify the parser or test suggestion backend.

DO NOT modify Task 3 tests.

Task 5 is FRONTEND ONLY.

==================================================
GIT / BRANCH REQUIREMENT
========================

DO NOT work directly on main.

Before modifying any files:

1. Check the current branch.
2. Check git status.
3. Make sure you have the latest main branch available locally.
4. Create and switch to this dedicated branch:

task-5-traceability-matrix

5. Perform ALL Task 5 work only on this branch.
6. Do NOT push directly to main.
7. Do NOT merge into main.
8. Do NOT rebase the Task 5 branch onto another branch during implementation.
9. Do NOT pull or merge the other developer's parser fix into this branch unless explicitly instructed.
10. Do not modify unrelated files.

At the end, report:

* current branch
* git status
* files changed
* files created
* whether any backend files were modified

The purpose is to allow the other developer to continue their Task 3 fix independently.

==================================================
EXISTING FRONTEND
=================

The project already uses:

* React
* TypeScript
* Vite
* React Router
* existing AppLayout
* existing Header
* existing Sidebar
* existing useApi hook
* shared TypeScript models

Task 4 already implemented:

* Requirements page
* Test Cases page
* frontend API integration
* loading states
* error states
* existing application shell/navigation

Do NOT redesign the whole application.

Do NOT replace working Task 4 functionality.

Build Task 5 consistently with the existing frontend.

==================================================
CURRENT TRACEABILITY PAGE
=========================

The existing file:

src/frontend/pages/TraceabilityPage.tsx

currently contains a placeholder indicating that the Traceability Matrix will be implemented in Task 5.

Replace that placeholder with the complete Task 5 implementation.

==================================================
EXISTING BACKEND API
====================

The backend already provides:

GET /api/traceability

The endpoint builds the traceability matrix from the existing requirements, test cases, and traceability links.

DO NOT create a new backend endpoint.

DO NOT modify the backend implementation.

DO NOT duplicate backend traceability logic.

The frontend should consume the existing endpoint.

==================================================
EXISTING TRACEABILITY DATA
==========================

The traceability response contains the existing requirements, test cases, and links.

Relevant data includes:

Requirements:

* id
* title
* description
* acceptanceCriteria
* domain
* criticality
* sourceFile
* tags
* changed

Test cases:

* id
* title
* description
* type
* requirementIds
* acceptanceCriteriaRefs
* status
* automated
* origin
* notes

Traceability links:

* requirementId
* testCaseId
* coverageType
* notes

Acceptance criteria references contain:

* requirementId
* criterionIndex

Use the existing shared TypeScript models wherever possible.

Do NOT create conflicting duplicate domain models.

==================================================
TASK 5 OBJECTIVE
================

Build a professional Traceability Matrix workspace that allows a QA engineer to understand the relationship between:

Requirement
↓
Acceptance Criteria
↓
Test Cases
↓
Coverage

The page should make traceability understandable at a glance while allowing the user to inspect the details of an individual requirement.

==================================================

1. TRACEABILITY PAGE HEADER
   ==================================================

Create a clear page header:

Title:
Traceability Matrix

Subtitle should explain that the page maps requirements to their associated test cases and coverage.

Keep the language professional and consistent with the rest of Spec2Ship.

==================================================
2. TRACEABILITY SUMMARY
=======================

At the top of the page, calculate and display summary metrics from the API response.

Display:

* Total Requirements
* Total Test Cases
* Fully Covered Requirements
* Partially Covered Requirements
* Requirements With No Coverage

These values must be calculated from the existing API data.

Do NOT hardcode these numbers.

Do NOT create backend calculations.

The summary should update automatically if the API data changes.

==================================================
3. MAIN TRACEABILITY MATRIX
===========================

Create a clear, usable matrix/table.

Each requirement row should display at minimum:

* Requirement ID
* Requirement Title
* Criticality
* Coverage Status
* Number of Linked Tests
* Changed Status

Coverage status must use the existing traceability links.

Possible states:

FULL
PARTIAL
NO COVERAGE

Use visually distinct but professional badges/status indicators.

Do not invent coverage.

If a requirement has no associated links, it must show:

No Coverage

If its links indicate full coverage, show:

Full

If the links indicate partial coverage, show:

Partial

Use the actual existing coverageType values.

==================================================
4. REQUIREMENT SELECTION
========================

Allow the user to select a requirement from the matrix.

Selecting a requirement should display its detailed traceability information on the same page.

Do NOT navigate to a separate route unless the existing architecture strongly requires it.

Prefer a detail panel/section below or beside the matrix.

The selected row should have a clear selected state.

==================================================
5. REQUIREMENT DETAILS
======================

When a requirement is selected, display:

* Requirement ID
* Title
* Description
* Domain
* Criticality
* Changed status
* Source file
* Tags if available

Do not expose unnecessary raw implementation data.

==================================================
6. ACCEPTANCE CRITERIA
======================

Display the selected requirement's acceptance criteria.

The criteria must remain in the original order.

Internally, acceptanceCriteriaRefs use zero-based criterionIndex.

For users, display normal human-friendly numbering starting from 1.

Example:

1. The email address is required.
2. The email address must use a valid email format.
3. The email address must be unique.

Do NOT alter the original criterion text.

==================================================
7. ACCEPTANCE CRITERIA COVERAGE
===============================

For every acceptance criterion, determine whether one or more test cases explicitly reference it through:

TestCase.acceptanceCriteriaRefs

Do NOT infer criterion coverage from:

* test title
* test description
* requirement title
* test ID

Only explicit acceptanceCriteriaRefs should count as acceptance-criteria coverage.

For each criterion, display:

* criterion number
* criterion text
* coverage state
* linked test IDs where available

Coverage states:

Covered
Not Covered

If covered, show the relevant test case IDs.

If not covered, make the gap clearly visible.

If the API returns an empty acceptanceCriteria array, do NOT treat this as a frontend error.

Show a graceful empty state such as:

No acceptance criteria available.

Do NOT modify the backend parser to solve this.

==================================================
8. LINKED TEST CASES
====================

For the selected requirement, display the associated test cases.

A test case should be associated with the requirement when appropriate based on:

* TraceabilityLink.requirementId
* TestCase.requirementIds

Use the existing traceability data rather than creating a new backend relationship.

For each linked test case display:

* Test ID
* Title
* Test Type
* Status
* Automated / Manual
* Origin
* Coverage Type
* Notes where useful

Existing test types include:

Functional
Negative
Boundary
Security
Edge

Existing test statuses include:

Pass
Fail
Not Run
Blocked

Existing test origins include:

Seeded
Suggested

Clearly distinguish seeded and suggested tests.

Do not invent new origin values.

==================================================
9. SEARCH
=========

Add client-side search for requirements.

Search should match at least:

* Requirement ID
* Requirement title

Search should update the matrix immediately.

Do not add a backend search endpoint.

==================================================
10. FILTERS
===========

Add client-side filters.

Criticality:

* All
* Low
* Medium
* High
* Critical

Coverage:

* All
* Full
* Partial
* No Coverage

Changed:

* All
* Changed
* Unchanged

Filters should work together.

Example:

High + Partial + Changed

should show only requirements matching all three conditions.

Provide a clear Reset Filters control.

Do not modify the backend for filtering.

==================================================
11. EMPTY STATES
================

Handle these situations gracefully.

No requirements:

"No requirements available."

No search/filter matches:

"No requirements match your current filters."

No acceptance criteria:

"No acceptance criteria available."

No linked tests:

"No test cases are currently linked to this requirement."

Do not show a broken or blank UI.

==================================================
12. LOADING STATE
=================

While /api/traceability is loading, display a professional loading state.

Do not render misleading empty data while the request is still loading.

Use the existing application's visual conventions.

==================================================
13. ERROR STATE
===============

If /api/traceability fails:

Display a clear error state.

Example:

"Failed to load traceability data."

Include the actual error information where appropriate.

Use:

role="alert"

Do not leave the page blank.

==================================================
14. RESPONSIVE DESIGN
=====================

The Traceability Matrix must remain usable on:

* desktop
* tablet
* smaller screens

For narrow screens, a horizontally scrollable matrix is acceptable.

Do not allow table content to destroy the page layout.

The requirement detail section should also remain readable on smaller screens.

==================================================
15. ACCESSIBILITY
=================

Use semantic HTML.

Interactive controls must be keyboard accessible.

Buttons should have meaningful labels.

Selected requirements should have a clear accessible state.

Use appropriate ARIA attributes only where needed.

Do not make accessibility dependent on color alone.

==================================================
16. VISUAL DESIGN
=================

Match the existing Spec2Ship UI.

The product should feel like a professional QA/developer engineering platform.

Use:

* clean cards
* structured tables
* consistent spacing
* clear typography
* professional status badges
* subtle borders
* appropriate hierarchy

Avoid:

* emojis
* excessive gradients
* excessive animations
* decorative AI imagery
* fake AI-generated styling
* unnecessary visual clutter

Do not redesign the existing application shell.

==================================================
17. COMPONENT ORGANIZATION
==========================

Keep the implementation maintainable.

If appropriate, create components such as:

src/frontend/components/Traceability/TraceabilitySummary.tsx

src/frontend/components/Traceability/TraceabilityMatrix.tsx

src/frontend/components/Traceability/RequirementTraceabilityDetail.tsx

src/frontend/components/Traceability/AcceptanceCriteriaCoverage.tsx

src/frontend/components/Traceability/LinkedTests.tsx

Do not create components unnecessarily.

Keep components focused and reusable.

Do not make one giant TraceabilityPage.tsx if reasonable component separation improves maintainability.

==================================================
18. API INTEGRATION
===================

Use the existing:

useApi()

hook.

The page should call:

/api/traceability

Do not add a second API implementation.

Do not use hardcoded demo data.

Do not use mock data.

Do not introduce a new data-fetching library.

==================================================
19. TYPESCRIPT
==============

Use the existing shared models.

Maintain strict TypeScript compatibility.

Do not introduce unnecessary any types.

Do not leave unused variables or imports.

Respect the project's:

noUnusedLocals
noUnusedParameters
strict

configuration.

==================================================
20. KNOWN TASK 3 ISSUE
======================

The local environment may currently show:

83/88 tests passing

because acceptance criteria may not be parsed correctly in one environment.

This is already being handled by another developer.

DO NOT:

* modify requirementParser.ts
* modify testSuggestionService.ts
* modify Task 3 tests
* alter backend APIs
* change acceptance-criteria parsing
* change test generation logic

The Task 5 frontend should simply display whatever valid data the API returns.

The UI must gracefully handle an empty acceptanceCriteria array.

==================================================
21. TASK 5 SCOPE CONTROL
========================

DO NOT implement any Task 6 or Task 7 functionality.

Specifically DO NOT implement:

* Coverage Gaps page
* Change Impact page
* Risk dashboard
* Risk scoring changes
* Release Readiness page
* Release readiness logic
* new backend services
* new backend endpoints
* database changes
* authentication
* AI model integrations
* external APIs

Those are future tasks.

==================================================
22. DO NOT BREAK TASK 4
=======================

After implementing Task 5, verify that these still work:

/requirements

/tests

/traceability

Do not remove existing navigation.

Do not remove existing Requirements functionality.

Do not remove existing Test Cases functionality.

Do not change the existing API hook unless absolutely necessary.

==================================================
23. VALIDATION
==============

After implementation, run:

npm run typecheck

npm run build

If possible, run:

npm run dev

Then verify:

http://localhost:5173/requirements

http://localhost:5173/tests

http://localhost:5173/traceability

Do not attempt to fix the known backend 83/88 test issue as part of this task.

If typecheck or build fails because of your Task 5 changes, fix those frontend issues.

Do not modify backend code to make validation pass.

==================================================
24. FINAL CODE REVIEW
=====================

Before finishing, inspect the final git diff.

Verify:

* only Task 5/frontend-related files were modified or created
* no backend files were changed
* no Task 3 tests were changed
* no parser files were changed
* no test suggestion files were changed
* no requirements were hardcoded
* no test cases were hardcoded
* no acceptance criteria were hardcoded
* no mock traceability data was added
* no unrelated dependencies were added
* no secrets were added
* no debugging code was left behind
* Task 4 pages remain intact
* Traceability uses /api/traceability
* acceptance criteria coverage uses explicit acceptanceCriteriaRefs
* seeded/suggested tests are distinguishable
* filters work together
* loading state works
* error state works
* empty states work
* responsive layout works
* TypeScript is clean
* production build succeeds

==================================================
25. GIT FINALIZATION
====================

Do NOT merge into main.

Do NOT push directly to main.

Remain on:

task-5-traceability-matrix

At the end, provide the exact output of:

git branch --show-current

git status --short

Also summarize the files changed.

If the project workflow permits committing, create ONE clean Task 5 commit with a message similar to:

feat: implement traceability matrix

Do not create unnecessary intermediate commits.

Do not push to main.

If you are unable to commit, leave the working tree ready for review and report that clearly.

==================================================
FINAL RESPONSE
==============

When finished, report:

1. Task 5 implementation summary.
2. Traceability Matrix features implemented.
3. Files created.
4. Files modified.
5. Confirmation that no backend/Task 3 files were changed.
6. Current branch name.
7. npm run typecheck result.
8. npm run build result.
9. Whether the application was manually verified.
10. Any remaining Task 5 issues.

Do not claim something passed unless you actually ran it.

Do not claim the known 83/88 backend test issue was fixed.

STOP after completing Task 5. Do not begin Task 6 or Task 7.

---

**Status:** active  **Date:** 2026-09-25

---

### 👤 User

You are implementing TASK 5 of the Spec2Ship project.

==================================================
PROJECT CONTEXT
===============

Project: Spec2Ship

Repository:
https://github.com/Ashl3yyMari3/Spec2Ship

Spec2Ship is an AI-assisted QA traceability and release-readiness tool. It takes software requirements and connects them to test cases so QA/development teams can see:

* which requirements are covered by tests
* which requirements have coverage gaps
* which tests are affected by requirement changes
* requirement risk levels
* whether software is Ready, Review Required, or Not Ready for release

The demo application is a fictional e-commerce system called ShopSphere, currently focused primarily on authentication requirements such as registration, login, and account lockout.

==================================================
CURRENT PROJECT STATUS
======================

Task 1: Architecture / Planning
COMPLETE

Task 2: Project Foundation
COMPLETE

Task 3: Backend
COMPLETE

Task 4: Frontend Foundation + Requirements + Test Cases
COMPLETE and already pushed to main

Task 5: Traceability Matrix
THIS IS YOUR TASK

Task 6: Coverage Gaps + Change Impact + Risk
NOT YET

Task 7: Release Readiness
NOT YET

==================================================
IMPORTANT TEAM / GIT CONTEXT
============================

Another developer is currently working separately on a pre-existing Task 3 parser/environment issue.

The current shared main branch may show:

83 passing / 5 failing tests

The five failures concern:

* acceptance-criteria parsing
* downstream suggested-test generation

The other developer is handling this issue separately.

DO NOT attempt to fix that issue as part of Task 5.

DO NOT modify the parser or test suggestion backend.

DO NOT modify Task 3 tests.

Task 5 is FRONTEND ONLY.

==================================================
GIT / BRANCH REQUIREMENT
========================

DO NOT work directly on main.

Before modifying any files:

1. Check the current branch.
2. Check git status.
3. Make sure you have the latest main branch available locally.
4. Create and switch to this dedicated branch:

task-5-traceability-matrix

5. Perform ALL Task 5 work only on this branch.
6. Do NOT push directly to main.
7. Do NOT merge into main.
8. Do NOT rebase the Task 5 branch onto another branch during implementation.
9. Do NOT pull or merge the other developer's parser fix into this branch unless explicitly instructed.
10. Do not modify unrelated files.

At the end, report:

* current branch
* git status
* files changed
* files created
* whether any backend files were modified

The purpose is to allow the other developer to continue their Task 3 fix independently.

==================================================
EXISTING FRONTEND
=================

The project already uses:

* React
* TypeScript
* Vite
* React Router
* existing AppLayout
* existing Header
* existing Sidebar
* existing useApi hook
* shared TypeScript models

Task 4 already implemented:

* Requirements page
* Test Cases page
* frontend API integration
* loading states
* error states
* existing application shell/navigation

Do NOT redesign the whole application.

Do NOT replace working Task 4 functionality.

Build Task 5 consistently with the existing frontend.

==================================================
CURRENT TRACEABILITY PAGE
=========================

The existing file:

src/frontend/pages/TraceabilityPage.tsx

currently contains a placeholder indicating that the Traceability Matrix will be implemented in Task 5.

Replace that placeholder with the complete Task 5 implementation.

==================================================
EXISTING BACKEND API
====================

The backend already provides:

GET /api/traceability

The endpoint builds the traceability matrix from the existing requirements, test cases, and traceability links.

DO NOT create a new backend endpoint.

DO NOT modify the backend implementation.

DO NOT duplicate backend traceability logic.

The frontend should consume the existing endpoint.

==================================================
EXISTING TRACEABILITY DATA
==========================

The traceability response contains the existing requirements, test cases, and links.

Relevant data includes:

Requirements:

* id
* title
* description
* acceptanceCriteria
* domain
* criticality
* sourceFile
* tags
* changed

Test cases:

* id
* title
* description
* type
* requirementIds
* acceptanceCriteriaRefs
* status
* automated
* origin
* notes

Traceability links:

* requirementId
* testCaseId
* coverageType
* notes

Acceptance criteria references contain:

* requirementId
* criterionIndex

Use the existing shared TypeScript models wherever possible.

Do NOT create conflicting duplicate domain models.

==================================================
TASK 5 OBJECTIVE
================

Build a professional Traceability Matrix workspace that allows a QA engineer to understand the relationship between:

Requirement
↓
Acceptance Criteria
↓
Test Cases
↓
Coverage

The page should make traceability understandable at a glance while allowing the user to inspect the details of an individual requirement.

==================================================

1. TRACEABILITY PAGE HEADER
   ==================================================

Create a clear page header:

Title:
Traceability Matrix

Subtitle should explain that the page maps requirements to their associated test cases and coverage.

Keep the language professional and consistent with the rest of Spec2Ship.

==================================================
2. TRACEABILITY SUMMARY
=======================

At the top of the page, calculate and display summary metrics from the API response.

Display:

* Total Requirements
* Total Test Cases
* Fully Covered Requirements
* Partially Covered Requirements
* Requirements With No Coverage

These values must be calculated from the existing API data.

Do NOT hardcode these numbers.

Do NOT create backend calculations.

The summary should update automatically if the API data changes.

==================================================
3. MAIN TRACEABILITY MATRIX
===========================

Create a clear, usable matrix/table.

Each requirement row should display at minimum:

* Requirement ID
* Requirement Title
* Criticality
* Coverage Status
* Number of Linked Tests
* Changed Status

Coverage status must use the existing traceability links.

Possible states:

FULL
PARTIAL
NO COVERAGE

Use visually distinct but professional badges/status indicators.

Do not invent coverage.

If a requirement has no associated links, it must show:

No Coverage

If its links indicate full coverage, show:

Full

If the links indicate partial coverage, show:

Partial

Use the actual existing coverageType values.

==================================================
4. REQUIREMENT SELECTION
========================

Allow the user to select a requirement from the matrix.

Selecting a requirement should display its detailed traceability information on the same page.

Do NOT navigate to a separate route unless the existing architecture strongly requires it.

Prefer a detail panel/section below or beside the matrix.

The selected row should have a clear selected state.

==================================================
5. REQUIREMENT DETAILS
======================

When a requirement is selected, display:

* Requirement ID
* Title
* Description
* Domain
* Criticality
* Changed status
* Source file
* Tags if available

Do not expose unnecessary raw implementation data.

==================================================
6. ACCEPTANCE CRITERIA
======================

Display the selected requirement's acceptance criteria.

The criteria must remain in the original order.

Internally, acceptanceCriteriaRefs use zero-based criterionIndex.

For users, display normal human-friendly numbering starting from 1.

Example:

1. The email address is required.
2. The email address must use a valid email format.
3. The email address must be unique.

Do NOT alter the original criterion text.

==================================================
7. ACCEPTANCE CRITERIA COVERAGE
===============================

For every acceptance criterion, determine whether one or more test cases explicitly reference it through:

TestCase.acceptanceCriteriaRefs

Do NOT infer criterion coverage from:

* test title
* test description
* requirement title
* test ID

Only explicit acceptanceCriteriaRefs should count as acceptance-criteria coverage.

For each criterion, display:

* criterion number
* criterion text
* coverage state
* linked test IDs where available

Coverage states:

Covered
Not Covered

If covered, show the relevant test case IDs.

If not covered, make the gap clearly visible.

If the API returns an empty acceptanceCriteria array, do NOT treat this as a frontend error.

Show a graceful empty state such as:

No acceptance criteria available.

Do NOT modify the backend parser to solve this.

==================================================
8. LINKED TEST CASES
====================

For the selected requirement, display the associated test cases.

A test case should be associated with the requirement when appropriate based on:

* TraceabilityLink.requirementId
* TestCase.requirementIds

Use the existing traceability data rather than creating a new backend relationship.

For each linked test case display:

* Test ID
* Title
* Test Type
* Status
* Automated / Manual
* Origin
* Coverage Type
* Notes where useful

Existing test types include:

Functional
Negative
Boundary
Security
Edge

Existing test statuses include:

Pass
Fail
Not Run
Blocked

Existing test origins include:

Seeded
Suggested

Clearly distinguish seeded and suggested tests.

Do not invent new origin values.

==================================================
9. SEARCH
=========

Add client-side search for requirements.

Search should match at least:

* Requirement ID
* Requirement title

Search should update the matrix immediately.

Do not add a backend search endpoint.

==================================================
10. FILTERS
===========

Add client-side filters.

Criticality:

* All
* Low
* Medium
* High
* Critical

Coverage:

* All
* Full
* Partial
* No Coverage

Changed:

* All
* Changed
* Unchanged

Filters should work together.

Example:

High + Partial + Changed

should show only requirements matching all three conditions.

Provide a clear Reset Filters control.

Do not modify the backend for filtering.

==================================================
11. EMPTY STATES
================

Handle these situations gracefully.

No requirements:

"No requirements available."

No search/filter matches:

"No requirements match your current filters."

No acceptance criteria:

"No acceptance criteria available."

No linked tests:

"No test cases are currently linked to this requirement."

Do not show a broken or blank UI.

==================================================
12. LOADING STATE
=================

While /api/traceability is loading, display a professional loading state.

Do not render misleading empty data while the request is still loading.

Use the existing application's visual conventions.

==================================================
13. ERROR STATE
===============

If /api/traceability fails:

Display a clear error state.

Example:

"Failed to load traceability data."

Include the actual error information where appropriate.

Use:

role="alert"

Do not leave the page blank.

==================================================
14. RESPONSIVE DESIGN
=====================

The Traceability Matrix must remain usable on:

* desktop
* tablet
* smaller screens

For narrow screens, a horizontally scrollable matrix is acceptable.

Do not allow table content to destroy the page layout.

The requirement detail section should also remain readable on smaller screens.

==================================================
15. ACCESSIBILITY
=================

Use semantic HTML.

Interactive controls must be keyboard accessible.

Buttons should have meaningful labels.

Selected requirements should have a clear accessible state.

Use appropriate ARIA attributes only where needed.

Do not make accessibility dependent on color alone.

==================================================
16. VISUAL DESIGN
=================

Match the existing Spec2Ship UI.

The product should feel like a professional QA/developer engineering platform.

Use:

* clean cards
* structured tables
* consistent spacing
* clear typography
* professional status badges
* subtle borders
* appropriate hierarchy

Avoid:

* emojis
* excessive gradients
* excessive animations
* decorative AI imagery
* fake AI-generated styling
* unnecessary visual clutter

Do not redesign the existing application shell.

==================================================
17. COMPONENT ORGANIZATION
==========================

Keep the implementation maintainable.

If appropriate, create components such as:

src/frontend/components/Traceability/TraceabilitySummary.tsx

src/frontend/components/Traceability/TraceabilityMatrix.tsx

src/frontend/components/Traceability/RequirementTraceabilityDetail.tsx

src/frontend/components/Traceability/AcceptanceCriteriaCoverage.tsx

src/frontend/components/Traceability/LinkedTests.tsx

Do not create components unnecessarily.

Keep components focused and reusable.

Do not make one giant TraceabilityPage.tsx if reasonable component separation improves maintainability.

==================================================
18. API INTEGRATION
===================

Use the existing:

useApi()

hook.

The page should call:

/api/traceability

Do not add a second API implementation.

Do not use hardcoded demo data.

Do not use mock data.

Do not introduce a new data-fetching library.

==================================================
19. TYPESCRIPT
==============

Use the existing shared models.

Maintain strict TypeScript compatibility.

Do not introduce unnecessary any types.

Do not leave unused variables or imports.

Respect the project's:

noUnusedLocals
noUnusedParameters
strict

configuration.

==================================================
20. KNOWN TASK 3 ISSUE
======================

The local environment may currently show:

83/88 tests passing

because acceptance criteria may not be parsed correctly in one environment.

This is already being handled by another developer.

DO NOT:

* modify requirementParser.ts
* modify testSuggestionService.ts
* modify Task 3 tests
* alter backend APIs
* change acceptance-criteria parsing
* change test generation logic

The Task 5 frontend should simply display whatever valid data the API returns.

The UI must gracefully handle an empty acceptanceCriteria array.

==================================================
21. TASK 5 SCOPE CONTROL
========================

DO NOT implement any Task 6 or Task 7 functionality.

Specifically DO NOT implement:

* Coverage Gaps page
* Change Impact page
* Risk dashboard
* Risk scoring changes
* Release Readiness page
* Release readiness logic
* new backend services
* new backend endpoints
* database changes
* authentication
* AI model integrations
* external APIs

Those are future tasks.

==================================================
22. DO NOT BREAK TASK 4
=======================

After implementing Task 5, verify that these still work:

/requirements

/tests

/traceability

Do not remove existing navigation.

Do not remove existing Requirements functionality.

Do not remove existing Test Cases functionality.

Do not change the existing API hook unless absolutely necessary.

==================================================
23. VALIDATION
==============

After implementation, run:

npm run typecheck

npm run build

If possible, run:

npm run dev

Then verify:

http://localhost:5173/requirements

http://localhost:5173/tests

http://localhost:5173/traceability

Do not attempt to fix the known backend 83/88 test issue as part of this task.

If typecheck or build fails because of your Task 5 changes, fix those frontend issues.

Do not modify backend code to make validation pass.

==================================================
24. FINAL CODE REVIEW
=====================

Before finishing, inspect the final git diff.

Verify:

* only Task 5/frontend-related files were modified or created
* no backend files were changed
* no Task 3 tests were changed
* no parser files were changed
* no test suggestion files were changed
* no requirements were hardcoded
* no test cases were hardcoded
* no acceptance criteria were hardcoded
* no mock traceability data was added
* no unrelated dependencies were added
* no secrets were added
* no debugging code was left behind
* Task 4 pages remain intact
* Traceability uses /api/traceability
* acceptance criteria coverage uses explicit acceptanceCriteriaRefs
* seeded/suggested tests are distinguishable
* filters work together
* loading state works
* error state works
* empty states work
* responsive layout works
* TypeScript is clean
* production build succeeds

==================================================
25. GIT FINALIZATION
====================

Do NOT merge into main.

Do NOT push directly to main.

Remain on:

task-5-traceability-matrix

At the end, provide the exact output of:

git branch --show-current

git status --short

Also summarize the files changed.

If the project workflow permits committing, create ONE clean Task 5 commit with a message similar to:

feat: implement traceability matrix

Do not create unnecessary intermediate commits.

Do not push to main.

If you are unable to commit, leave the working tree ready for review and report that clearly.

==================================================
FINAL RESPONSE
==============

When finished, report:

1. Task 5 implementation summary.
2. Traceability Matrix features implemented.
3. Files created.
4. Files modified.
5. Confirmation that no backend/Task 3 files were changed.
6. Current branch name.
7. npm run typecheck result.
8. npm run build result.
9. Whether the application was manually verified.
10. Any remaining Task 5 issues.

Do not claim something passed unless you actually ran it.

Do not claim the known 83/88 backend test issue was fixed.

STOP after completing Task 5. Do not begin Task 6 or Task 7.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Set up git branch (check status, create task-5-traceability-matrix)
[ ] Explore existing codebase (structure, models, hooks, components)
[ ] Implement TraceabilitySummary component
[ ] Implement TraceabilityMatrix component
[ ] Implement AcceptanceCriteriaCoverage component
[ ] Implement LinkedTests component
[ ] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git branch --show-current; git status --short

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — .

### 🤖 Assistant

> 🔧 called: execute_command

The workspace directory doesn't exist yet. Let me find the actual project location.

> 🔧 **execute_command** — Get-ChildItem -Path "C:\Users\promi" -Directory | Select-Object Name, FullName

### 🤖 Assistant

> 🔧 called: ask_followup_question



### 🤖 Assistant

The workspace directory C:\Users\promi\.bob\playground doesn't exist. Where is the Spec2Ship project located on your system?

> 🔧 **ask_followup_question** — The workspace directory C:\Users\promi\.bob\playground doesn't exist. Where is the Spec2Ship project located on your system?

---

### 👤 User

allowed

---

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — Get-ChildItem -Path "C:\Users\promi" -Directory | Select-Object Name, FullName

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git branch --show-current; git status --short

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git fetch origin; git status

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git checkout -b task-5-traceability-matrix

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[-] Explore existing codebase (structure, models, hooks, components)
[ ] Implement TraceabilitySummary component
[ ] Implement TraceabilityMatrix component
[ ] Implement AcceptanceCriteriaCoverage component
[ ] Implement LinkedTests component
[ ] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: list_files, execute_command



> 🔧 **list_files** — C:\Users\promi\Spec2Ship

> 🔧 **execute_command** — Get-ChildItem -Path "C:\Users\promi\Spec2Ship\src" -Recurse -File | Select-Object FullName | ForEach-Object { $_.FullName.Replace("C:\Users\promi\Spec2Ship\", "") }

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\backend\types\models.ts

> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\hooks\useApi.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\pages\TraceabilityPage.tsx

> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\App.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\styles\globals.css

> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\components\Layout\AppLayout.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\pages\RequirementsPage.tsx

> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\pages\TestsPage.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\components\Requirements\RequirementsList.tsx

> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\frontend\components\TestCases\TestCasesList.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — C:\Users\promi\Spec2Ship\src\backend\services\traceabilityService.ts

> 🔧 **read_file** — C:\Users\promi\Spec2Ship\tsconfig.json

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a thorough understanding of the codebase. Let me implement all the components.

> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[-] Implement TraceabilitySummary component
[ ] Implement TraceabilityMatrix component
[ ] Implement AcceptanceCriteriaCoverage component
[ ] Implement LinkedTests component
[ ] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — New-Item -ItemType Directory -Path "C:\Users\promi\Spec2Ship\src\frontend\components\Traceability" -Force

### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — C:\Users\promi\Spec2Ship\src\frontend\components\Traceability\TraceabilitySummary.tsx

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[-] Implement TraceabilityMatrix component
[ ] Implement AcceptanceCriteriaCoverage component
[ ] Implement LinkedTests component
[ ] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — import React from 'react';
import type { Requirement, TraceabilityMatrix, Criticality } from '@backend/types/models';

// ---------------------------------------------------------------------------
// Coverage logic
// ---------------------------------------------------------------------------

export type CoverageStatus = 'full' | 'partial' | 'none';

export function computeCoverageStatus(
  req: Requirement,
  matrix: TraceabilityMatrix,
): CoverageStatus {
  const links = matrix.links.filter((l) => l.requirementId === req.id);
  if (links.length === 0) return 'none';
  if (links.every((l) => l.coverageType === 'full')) return 'full';
  return 'partial';
}

export function getLinkedTestCount(req: Requirement, matrix: TraceabilityMatrix): number {
  // Count unique test cases linked to this requirement via links OR requirementIds
  const linkIds = new Set(
    matrix.links
      .filter((l) => l.requirementId === req.id)
      .map((l) => l.testCaseId),
  );
  matrix.testCases.forEach((tc) => {
    if (tc.requirementIds.includes(req.id)) linkIds.add(tc.id);
  });
  return linkIds.size;
}

// ---------------------------------------------------------------------------
// Filters / Search
// ---------------------------------------------------------------------------

export type CriticalityFilter = 'all' | Criticality;
export type CoverageFilter = 'all' | 'full' | 'partial' | 'none';
export type ChangedFilter = 'all' | 'changed' | 'unchanged';

export interface MatrixFilters {
  search: string;
  criticality: CriticalityFilter;
  coverage: CoverageFilter;
  changed: ChangedFilter;
}

export const DEFAULT_FILTERS: MatrixFilters = {
  search: '',
  criticality: 'all',
  coverage: 'all',
  changed: 'all',
};

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

function criticalityClass(c: Criticality): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: Criticality): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function CoverageBadge({ status }: { status: CoverageStatus }): React.ReactElement {
  const styles: Record<CoverageStatus, React.CSSProperties> = {
    full: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' },
    partial: { background: '#fff7ed', color: '#9a3412', border: '1px solid #fdba74' },
    none: { background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1' },
  };
  const labels: Record<CoverageStatus, string> = {
    full: 'Full',
    partial: 'Partial',
    none: 'No Coverage',
  };
  return (
    <span
      className="badge"
      style={styles[status]}
      aria-label={`Coverage: ${labels[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------

interface FilterBarProps {
  filters: MatrixFilters;
  onChange: (f: MatrixFilters) => void;
}

function FilterBar({ filters, onChange }: FilterBarProps): React.ReactElement {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.criticality !== 'all' ||
    filters.coverage !== 'all' ||
    filters.changed !== 'all';

  const inputStyle: React.CSSProperties = {
    fontSize: '13px',
    padding: '5px 10px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    height: '32px',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px 16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
      }}
    >
      <input
        type="search"
        placeholder="Search by ID or title…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        aria-label="Search requirements"
        style={{ ...inputStyle, minWidth: '200px', flex: '1 1 200px' }}
      />

      <select
        value={filters.criticality}
        onChange={(e) => onChange({ ...filters, criticality: e.target.value as CriticalityFilter })}
        aria-label="Filter by criticality"
        style={selectStyle}
      >
        <option value="all">All Criticalities</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filters.coverage}
        onChange={(e) => onChange({ ...filters, coverage: e.target.value as CoverageFilter })}
        aria-label="Filter by coverage"
        style={selectStyle}
      >
        <option value="all">All Coverage</option>
        <option value="full">Full</option>
        <option value="partial">Partial</option>
        <option value="none">No Coverage</option>
      </select>

      <select
        value={filters.changed}
        onChange={(e) => onChange({ ...filters, changed: e.target.value as ChangedFilter })}
        aria-label="Filter by changed status"
        style={selectStyle}
      >
        <option value="all">All Changed Status</option>
        <option value="changed">Changed</option>
        <option value="unchanged">Unchanged</option>
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => onChange(DEFAULT_FILTERS)}
          aria-label="Reset all filters"
          style={{
            fontSize: '12px',
            padding: '5px 12px',
            height: '32px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main matrix component
// ---------------------------------------------------------------------------

interface Props {
  matrix: TraceabilityMatrix;
  selectedRequirementId: string | null;
  onSelectRequirement: (id: string) => void;
}

export default function TraceabilityMatrix({
  matrix,
  selectedRequirementId,
  onSelectRequirement,
}: Props): React.ReactElement {
  const [filters, setFilters] = React.useState<MatrixFilters>(DEFAULT_FILTERS);

  const filteredRequirements = React.useMemo(() => {
    return matrix.requirements.filter((req) => {
      const q = filters.search.trim().toLowerCase();
      if (q && !req.id.toLowerCase().includes(q) && !req.title.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.criticality !== 'all' && req.criticality !== filters.criticality) {
        return false;
      }
      if (filters.coverage !== 'all') {
        const status = computeCoverageStatus(req, matrix);
        if (status !== filters.coverage) return false;
      }
      if (filters.changed !== 'all') {
        if (filters.changed === 'changed' && !req.changed) return false;
        if (filters.changed === 'unchanged' && req.changed) return false;
      }
      return true;
    });
  }, [matrix, filters]);

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />

      {filteredRequirements.length === 0 ? (
        <p className="state-message" role="status">
          {matrix.requirements.length === 0
            ? 'No requirements available.'
            : 'No requirements match your current filters.'}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13.5px',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-label="Traceability matrix"
          >
            <thead>
              <tr
                style={{
                  background: 'var(--color-surface)',
                  borderBottom: '2px solid var(--color-border)',
                }}
              >
                {['ID', 'Title', 'Criticality', 'Coverage', 'Tests', 'Changed'].map((col) => (
                  <th
                    key={col}
                    scope="col"
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--color-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRequirements.map((req, idx) => {
                const coverageStatus = computeCoverageStatus(req, matrix);
                const testCount = getLinkedTestCount(req, matrix);
                const isSelected = req.id === selectedRequirementId;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequirement(req.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectRequirement(req.id);
                      }
                    }}
                    tabIndex={0}
                    role="row"
                    aria-selected={isSelected}
                    style={{
                      cursor: 'pointer',
                      background: isSelected
                        ? '#eff6ff'
                        : isEven
                        ? 'var(--color-bg)'
                        : 'var(--color-surface)',
                      borderBottom: '1px solid var(--color-border)',
                      outline: isSelected ? '2px solid var(--color-accent)' : undefined,
                      outlineOffset: '-2px',
                      transition: 'background 0.1s',
                    }}
                  >
                    <td
                      style={{
                        padding: '10px 14px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {req.id}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        fontWeight: isSelected ? 600 : 400,
                        color: 'var(--color-text)',
                        maxWidth: '300px',
                      }}
                    >
                      {req.title}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <span className={criticalityClass(req.criticality)}>
                        {criticalityLabel(req.criticality)}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <CoverageBadge status={coverageStatus} />
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        textAlign: 'center',
                        color: testCount === 0 ? 'var(--color-muted)' : 'var(--color-text)',
                        fontWeight: 500,
                      }}
                    >
                      {testCount}
                    </td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      {req.changed ? (
                        <span className="badge badge--high">Changed</span>
                      ) : (
                        <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[-] Implement AcceptanceCriteriaCoverage component
[ ] Implement LinkedTests component
[ ] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — import React from 'react';
import type { Requirement, TestCase } from '@backend/types/models';

interface Props {
  requirement: Requirement;
  testCases: TestCase[];
}

interface CriterionCoverage {
  index: number;      // 0-based
  text: string;
  coveredByTestIds: string[];
}

function buildCriterionCoverage(
  req: Requirement,
  testCases: TestCase[],
): CriterionCoverage[] {
  return req.acceptanceCriteria.map((text, index) => {
    const coveredByTestIds = testCases
      .filter((tc) =>
        tc.acceptanceCriteriaRefs.some(
          (ref) => ref.requirementId === req.id && ref.criterionIndex === index,
        ),
      )
      .map((tc) => tc.id);

    return { index, text, coveredByTestIds };
  });
}

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-muted)',
  marginBottom: '10px',
};

export default function AcceptanceCriteriaCoverage({
  requirement,
  testCases,
}: Props): React.ReactElement {
  if (requirement.acceptanceCriteria.length === 0) {
    return (
      <div>
        <p style={sectionHeadingStyle}>Acceptance Criteria Coverage</p>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
          No acceptance criteria available.
        </p>
      </div>
    );
  }

  const criterionCoverage = buildCriterionCoverage(requirement, testCases);

  return (
    <div>
      <p style={sectionHeadingStyle}>Acceptance Criteria Coverage</p>
      <ol
        style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}
        aria-label={`Acceptance criteria coverage for ${requirement.id}`}
      >
        {criterionCoverage.map((item) => {
          const isCovered = item.coveredByTestIds.length > 0;
          return (
            <li
              key={item.index}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '10px 12px',
                border: '1px solid',
                borderColor: isCovered ? '#86efac' : 'var(--color-border)',
                borderRadius: 'var(--radius)',
                background: isCovered ? '#f0fdf4' : 'var(--color-surface)',
                alignItems: 'flex-start',
              }}
            >
              {/* Number */}
              <span
                style={{
                  flexShrink: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isCovered ? '#22c55e' : 'var(--color-border)',
                  color: isCovered ? '#fff' : 'var(--color-muted)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '1px',
                }}
                aria-hidden="true"
              >
                {item.index + 1}
              </span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0, lineHeight: 1.5 }}>
                  {item.text}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    flexWrap: 'wrap',
                  }}
                >
                  {isCovered ? (
                    <>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#166534',
                          background: '#dcfce7',
                          border: '1px solid #86efac',
                          borderRadius: '10px',
                          padding: '1px 8px',
                        }}
                        aria-label="Covered"
                      >
                        Covered
                      </span>
                      {item.coveredByTestIds.map((tcId) => (
                        <span
                          key={tcId}
                          className="badge badge--type"
                          style={{ fontFamily: 'monospace', fontSize: '11px' }}
                        >
                          {tcId}
                        </span>
                      ))}
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#991b1b',
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '10px',
                        padding: '1px 8px',
                      }}
                      aria-label="Not covered"
                    >
                      Not Covered
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[x] Implement AcceptanceCriteriaCoverage component
[-] Implement LinkedTests component
[ ] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — import React from 'react';
import type { TestCase, TraceabilityMatrix, TestStatus, TestOrigin, CoverageType } from '@backend/types/models';

interface Props {
  requirementId: string;
  matrix: TraceabilityMatrix;
}

function getLinkedTestCases(requirementId: string, matrix: TraceabilityMatrix): {
  testCase: TestCase;
  coverageType: CoverageType | null;
  notes: string;
}[] {
  // Gather test IDs from links first (preserving coverageType/notes)
  const linkMap = new Map<string, { coverageType: CoverageType; notes: string }>();
  matrix.links
    .filter((l) => l.requirementId === requirementId)
    .forEach((l) => {
      linkMap.set(l.testCaseId, { coverageType: l.coverageType, notes: l.notes });
    });

  // Also include test cases that reference this requirement via requirementIds
  const allIds = new Set<string>(linkMap.keys());
  matrix.testCases.forEach((tc) => {
    if (tc.requirementIds.includes(requirementId)) allIds.add(tc.id);
  });

  const tcById = new Map(matrix.testCases.map((tc) => [tc.id, tc]));
  return Array.from(allIds)
    .map((id) => {
      const tc = tcById.get(id);
      if (!tc) return null;
      const linkInfo = linkMap.get(id) ?? null;
      return {
        testCase: tc,
        coverageType: linkInfo?.coverageType ?? null,
        notes: linkInfo?.notes ?? '',
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadgeClass(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass: 'badge badge--pass',
    fail: 'badge badge--fail',
    not_run: 'badge badge--not-run',
    blocked: 'badge badge--blocked',
  };
  return map[s];
}

function statusLabel(s: TestStatus): string {
  const map: Record<TestStatus, string> = {
    pass: 'Pass',
    fail: 'Fail',
    not_run: 'Not Run',
    blocked: 'Blocked',
  };
  return map[s];
}

function originClass(o: TestOrigin): string {
  return `badge badge--origin-${o}`;
}

function originLabel(o: TestOrigin): string {
  return o === 'seeded' ? 'Seeded' : 'Suggested';
}

function CoverageTypeBadge({ type }: { type: CoverageType | null }): React.ReactElement | null {
  if (!type) return null;
  const styles: Record<CoverageType, React.CSSProperties> = {
    full: { background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' },
    partial: { background: '#fff7ed', color: '#9a3412', border: '1px solid #fdba74' },
  };
  const labels: Record<CoverageType, string> = {
    full: 'Full Coverage',
    partial: 'Partial Coverage',
  };
  return (
    <span className="badge" style={styles[type]}>
      {labels[type]}
    </span>
  );
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-muted)',
  marginBottom: '2px',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LinkedTests({ requirementId, matrix }: Props): React.ReactElement {
  const linked = getLinkedTestCases(requirementId, matrix);

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-muted)',
    marginBottom: '10px',
  };

  if (linked.length === 0) {
    return (
      <div>
        <p style={sectionHeadingStyle}>Linked Test Cases</p>
        <p style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
          No test cases are currently linked to this requirement.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p style={sectionHeadingStyle}>
        Linked Test Cases{' '}
        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: '12px' }}>
          ({linked.length})
        </span>
      </p>
      <div style={{ display: 'grid', gap: '10px' }}>
        {linked.map(({ testCase: tc, coverageType, notes }) => (
          <div
            key={tc.id}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              background: 'var(--color-bg)',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '6px',
              }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-accent)',
                  letterSpacing: '0.05em',
                }}
              >
                {tc.id}
              </span>
              <span
                style={{
                  fontSize: '13.5px',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  flex: 1,
                  minWidth: '160px',
                }}
              >
                {tc.title}
              </span>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              <span className={statusBadgeClass(tc.status)}>{statusLabel(tc.status)}</span>
              <span className={originClass(tc.origin)}>{originLabel(tc.origin)}</span>
              <span className="badge badge--type">
                {tc.type.charAt(0).toUpperCase() + tc.type.slice(1)}
              </span>
              <span className="badge badge--type">
                {tc.automated ? 'Automated' : 'Manual'}
              </span>
              <CoverageTypeBadge type={coverageType} />
            </div>

            {/* Detail fields */}
            <dl style={{ display: 'grid', gap: '4px', margin: 0 }}>
              {tc.description && (
                <div>
                  <dt style={fieldLabelStyle}>Description</dt>
                  <dd style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                    {tc.description}
                  </dd>
                </div>
              )}
              {notes && (
                <div style={{ marginTop: '4px' }}>
                  <dt style={fieldLabelStyle}>Notes</dt>
                  <dd style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                    {notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[x] Implement AcceptanceCriteriaCoverage component
[x] Implement LinkedTests component
[-] Implement RequirementTraceabilityDetail component
[ ] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — import React from 'react';
import type { Requirement, TraceabilityMatrix, Criticality } from '@backend/types/models';
import AcceptanceCriteriaCoverage from './AcceptanceCriteriaCoverage';
import LinkedTests from './LinkedTests';

interface Props {
  requirement: Requirement;
  matrix: TraceabilityMatrix;
  onClose: () => void;
}

function criticalityClass(c: Criticality): string {
  return `badge badge--${c}`;
}

function criticalityLabel(c: Criticality): string {
  return c.charAt(0).toUpperCase() + c.slice(1);
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-muted)',
  marginBottom: '2px',
};

const fieldValueStyle: React.CSSProperties = {
  fontSize: '13.5px',
  color: 'var(--color-text)',
  lineHeight: 1.55,
};

export default function RequirementTraceabilityDetail({
  requirement: req,
  matrix,
  onClose,
}: Props): React.ReactElement {
  return (
    <section
      aria-label={`Traceability detail for ${req.id}`}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)',
        background: 'var(--color-bg)',
        boxShadow: 'var(--shadow-sm)',
        marginTop: '20px',
      }}
    >
      {/* Detail header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius) var(--radius) 0 0',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-accent)',
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            {req.id}
          </span>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {req.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label={`Close detail panel for ${req.id}`}
          style={{
            fontSize: '13px',
            padding: '5px 14px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-bg)',
            color: 'var(--color-muted)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          Close
        </button>
      </div>

      {/* Detail body */}
      <div style={{ padding: '20px' }}>
        {/* Requirement meta */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
          }}
        >
          <div>
            <dt style={fieldLabelStyle}>Criticality</dt>
            <dd>
              <span className={criticalityClass(req.criticality)}>
                {criticalityLabel(req.criticality)}
              </span>
            </dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Domain</dt>
            <dd style={fieldValueStyle}>{req.domain}</dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Changed</dt>
            <dd>
              {req.changed ? (
                <span className="badge badge--high">Changed</span>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Unchanged</span>
              )}
            </dd>
          </div>
          <div>
            <dt style={fieldLabelStyle}>Source File</dt>
            <dd
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--color-muted)',
                wordBreak: 'break-all',
              }}
            >
              {req.sourceFile}
            </dd>
          </div>
          {req.tags.length > 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <dt style={fieldLabelStyle}>Tags</dt>
              <dd style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                {req.tags.map((tag) => (
                  <span key={tag} className="badge badge--type">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </div>

        {/* Description */}
        {req.description && (
          <div style={{ marginBottom: '20px' }}>
            <p style={{ ...fieldLabelStyle, fontSize: '11px' }}>Description</p>
            <p style={{ fontSize: '13.5px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {req.description}
            </p>
          </div>
        )}

        {/* Acceptance Criteria Coverage */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-surface)',
          }}
        >
          <AcceptanceCriteriaCoverage
            requirement={req}
            testCases={matrix.testCases}
          />
        </div>

        {/* Linked Test Cases */}
        <div
          style={{
            padding: '16px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: 'var(--color-surface)',
          }}
        >
          <LinkedTests requirementId={req.id} matrix={matrix} />
        </div>
      </div>
    </section>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[x] Implement AcceptanceCriteriaCoverage component
[x] Implement LinkedTests component
[x] Implement RequirementTraceabilityDetail component
[-] Replace TraceabilityPage.tsx placeholder with full implementation
[ ] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — import React, { useState } from 'react';
import type { TraceabilityMatrix } from '@backend/types/models';
import { useApi } from '../hooks/useApi';
import TraceabilitySummary from '../components/Traceability/TraceabilitySummary';
import TraceabilityMatrixTable from '../components/Traceability/TraceabilityMatrix';
import RequirementTraceabilityDetail from '../components/Traceability/RequirementTraceabilityDetail';

export default function TraceabilityPage(): React.ReactElement {
  const { data, loading, error } = useApi<TraceabilityMatrix>('/api/traceability');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  const selectedRequirement =
    data && selectedReqId
      ? (data.requirements.find((r) => r.id === selectedReqId) ?? null)
      : null;

  function handleSelectRequirement(id: string): void {
    setSelectedReqId((prev) => (prev === id ? null : id));
  }

  function handleCloseDetail(): void {
    setSelectedReqId(null);
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-header__title">Traceability Matrix</h1>
        <p className="page-header__subtitle">
          Maps requirements to their associated test cases and acceptance criteria coverage
        </p>
      </div>

      {loading && (
        <p className="state-message" role="status" aria-live="polite">
          Loading traceability data…
        </p>
      )}

      {error && !loading && (
        <div className="state-message state-message--error" role="alert">
          <p className="state-message__title">Failed to load traceability data</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && data !== null && (
        <>
          <TraceabilitySummary matrix={data} />

          <TraceabilityMatrixTable
            matrix={data}
            selectedRequirementId={selectedReqId}
            onSelectRequirement={handleSelectRequirement}
          />

          {selectedRequirement && (
            <RequirementTraceabilityDetail
              requirement={selectedRequirement}
              matrix={data}
              onClose={handleCloseDetail}
            />
          )}
        </>
      )}
    </>
  );
}


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[x] Implement AcceptanceCriteriaCoverage component
[x] Implement LinkedTests component
[x] Implement RequirementTraceabilityDetail component
[x] Replace TraceabilityPage.tsx placeholder with full implementation
[-] Run typecheck and build validation
[ ] Final git review and commit


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run typecheck 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Typecheck passes with no errors. Now run the build:

> 🔧 **execute_command** — npm run build 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

Build passes cleanly. Now commit and do the final review:

> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[x] Implement AcceptanceCriteriaCoverage component
[x] Implement LinkedTests component
[x] Implement RequirementTraceabilityDetail component
[x] Replace TraceabilityPage.tsx placeholder with full implementation
[x] Run typecheck and build validation
[-] Final git review and commit


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git diff --name-only HEAD; echo "---"; git status --short

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git diff HEAD -- src/backend/ src/backend/types/ src/backend/services/ 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

No backend files changed. Now commit:

> 🔧 **execute_command** — git add src/frontend/components/Traceability/ src/frontend/pages/TraceabilityPage.tsx

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git commit -m "feat: implement traceability matrix"

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git -c user.email="task5@spec2ship.dev" -c user.name="Task 5" commit -m "feat: implement traceability matrix"

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — git branch --show-current; git status --short

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Set up git branch (check status, create task-5-traceability-matrix)
[x] Explore existing codebase (structure, models, hooks, components)
[x] Implement TraceabilitySummary component
[x] Implement TraceabilityMatrix component
[x] Implement AcceptanceCriteriaCoverage component
[x] Implement LinkedTests component
[x] Implement RequirementTraceabilityDetail component
[x] Replace TraceabilityPage.tsx placeholder with full implementation
[x] Run typecheck and build validation
[x] Final git review and commit


### 🤖 Assistant

---

## Task 5 — Implementation Report

### 1. Implementation Summary

The Traceability Matrix page (`/traceability`) has been fully implemented. It replaces the placeholder with a professional, fully functional QA traceability workspace. The page consumes the existing `GET /api/traceability` endpoint via the existing `useApi()` hook and renders all data computed client-side with no hardcoded values.

---

### 2. Features Implemented

| # | Feature | Details |
|---|---------|---------|
| 1 | **Page header** | Title + subtitle consistent with existing pages |
| 2 | **Summary metrics** | 5 cards: Total Requirements, Total Test Cases, Fully Covered, Partially Covered, No Coverage — all computed from API data |
| 3 | **Traceability matrix table** | Columns: ID, Title, Criticality, Coverage, Tests, Changed — with alternating rows, selected-row highlight |
| 4 | **Requirement selection** | Click (or keyboard Enter/Space) selects a row; clicking again deselects; detail panel appears below |
| 5 | **Requirement detail** | Shows ID, title, description, domain, criticality, changed status, source file, tags |
| 6 | **Acceptance criteria coverage** | Per-criterion display with 1-based numbering, Covered/Not Covered badges, linked test IDs — driven **only** by `acceptanceCriteriaRefs` |
| 7 | **Linked test cases** | Shows all tests linked via `TraceabilityLink` or `TestCase.requirementIds`; displays ID, title, type, status, automated/manual, origin, coverage type, notes |
| 8 | **Search** | Client-side, matches on requirement ID and title, real-time |
| 9 | **Filters** | Criticality × Coverage × Changed — all work together; Reset Filters button shown when any filter is active |
| 10 | **Empty states** | "No requirements available", "No requirements match your current filters", "No acceptance criteria available", "No test cases linked" |
| 11 | **Loading state** | `role="status"` live region while fetching |
| 12 | **Error state** | `role="alert"` with error message on fetch failure |
| 13 | **Responsive** | Filter bar wraps, table is horizontally scrollable, detail panel uses auto-fill grid |
| 14 | **Accessibility** | Semantic HTML, keyboard-navigable rows (`tabIndex`, `role="row"`, `aria-selected`), ARIA labels on controls, no color-only states |
| 15 | **Seeded vs. Suggested** | Distinguished by existing `badge--origin-seeded` / `badge--origin-suggested` CSS classes |

---

### 3. Files Created

| File | Purpose |
|------|---------|
| [`src/frontend/components/Traceability/TraceabilitySummary.tsx`](C:\Users\promi\Spec2Ship\src\frontend\components\Traceability\TraceabilitySummary.tsx) | 5-metric summary cards |
| [`src/frontend/components/Traceability/TraceabilityMatrix.tsx`](C:\Users\promi\Spec2Ship\src\frontend\components\Traceability\TraceabilityMatrix.tsx) | Filter bar + sortable requirement table |
| [`src/frontend/components/Traceability/AcceptanceCriteriaCoverage.tsx`](C:\Users\promi\Spec2Ship\src\frontend\components\Traceability\AcceptanceCriteriaCoverage.tsx) | Per-criterion coverage panel |
| [`src/frontend/components/Traceability/LinkedTests.tsx`](C:\Users\promi\Spec2Ship\src\frontend\components\Traceability\LinkedTests.tsx) | Linked test cases panel |
| [`src/frontend/components/Traceability/RequirementTraceabilityDetail.tsx`](C:\Users\promi\Spec2Ship\src\frontend\components\Traceability\RequirementTraceabilityDetail.tsx) | Full detail panel (wraps AC coverage + linked tests) |

### 4. Files Modified

| File | Change |
|------|--------|
| [`src/frontend/pages/TraceabilityPage.tsx`](C:\Users\promi\Spec2Ship\src\frontend\pages\TraceabilityPage.tsx) | Replaced placeholder with full page implementation |

### 5. Backend files modified
**None.** Zero backend files were touched. No parser, test suggestion, or Task 3 test files were modified.

### 6. Current branch
```
task-5-traceability-matrix
```
Working tree is clean (git status shows nothing after commit).

### 7. `npm run typecheck` result
**Passed — no errors, no warnings.**

### 8. `npm run build` result
**Passed.** Production build: `192 kB JS / 5.6 kB CSS`, built in 2.15s.

### 9. Manual verification
Not run (dev server was not started). Typecheck and production build both pass cleanly.

### 10. Remaining Task 5 issues
None. The known 83/88 backend test issue is **not related to Task 5** and was not touched. The acceptance criteria coverage panel gracefully renders an empty state when `acceptanceCriteria` is `[]`.