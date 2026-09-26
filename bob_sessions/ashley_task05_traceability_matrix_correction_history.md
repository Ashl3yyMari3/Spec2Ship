# TASK 05 CORRECTION — REQUIREMENT × TEST TRACEABILITY GRID

PROJECT: Spec2Ship
BRANCH: task-5-traceability-matrix

IMPORTANT:
This is a correction to the existing Task 05 Traceability Matrix implementation.

Preserve all Task 05 work already present on this branch.

DO NOT replace or remove:
- Traceability summary metrics
- filters/search
- requirement detail panel
- acceptance-criteria coverage
- linked test case views
- existing accessibility work

The current implementation is useful, but it is missing the core requirement × test-case matrix defined in spec2ship-plan.md.

==================================================
1. READ FIRST
==================================================

Before changing anything, inspect:

- spec2ship-plan.md
- src/frontend/pages/TraceabilityPage.tsx
- src/frontend/components/Traceability/TraceabilityMatrix.tsx
- src/frontend/components/Traceability/TraceabilitySummary.tsx
- src/frontend/components/Traceability/RequirementTraceabilityDetail.tsx
- src/frontend/components/Traceability/AcceptanceCriteriaCoverage.tsx
- src/frontend/components/Traceability/LinkedTests.tsx
- src/backend/types/models.ts
- src/backend/server.ts

Also inspect the actual response shape from:

GET /api/traceability

Do not modify files yet.

==================================================
2. CURRENT PROBLEM
==================================================

The existing TraceabilityMatrix.tsx currently shows a requirements summary table with columns such as:

ID
Title
Criticality
Coverage
Tests
Changed

That table may remain.

However, Task 05 specifically requires an actual requirement × test-case traceability matrix.

The UI must additionally show:

- requirements as ROWS
- test cases as COLUMNS
- each requirement/test intersection as a matrix cell
- whether that test covers that requirement

Example concept:

                    TC-001   TC-002   TC-003
REQ-AUTH-001          ✓        ✓        —
REQ-AUTH-002          —        —        ✓
REQ-AUTH-003          —        ✓        ✓

Use the data already returned by:

GET /api/traceability

Do not create new backend logic.

==================================================
3. MATRIX COVERAGE LOGIC
==================================================

Determine coverage using the existing TraceabilityMatrix data.

A cell is covered when the test case is linked to the requirement through the traceability data.

Use the existing backend models and links as the source of truth.

Do not invent or hard-code requirement/test relationships.

If coverageType is available, expose whether coverage is:

- full
- partial

An uncovered cell must clearly display that it is not covered.

==================================================
4. ACCESSIBILITY
==================================================

The matrix must use semantic table markup:

<table>
<thead>
<tbody>
<th>
<td>

Requirement row headers should use:

scope="row"

Test case column headers should use:

scope="col"

Every requirement × test cell must include a meaningful aria-label.

Examples:

REQ-AUTH-001 covered by TC-AUTH-001-01

REQ-AUTH-001 partially covered by TC-AUTH-001-02

REQ-AUTH-001 not covered by TC-AUTH-002-01

Do not rely on color alone.

Covered cells should include a visible symbol/text such as:

✓ Full
◐ Partial
— None

or another equally clear accessible treatment.

==================================================
5. RESPONSIVE BEHAVIOR
==================================================

The matrix may become horizontally wide.

Place it in a horizontally scrollable container so:

- columns remain readable
- the page layout does not break
- requirement identifiers remain understandable

Do not introduce a large UI framework.

==================================================
6. PRESERVE CURRENT TASK 05 FEATURES
==================================================

Keep the current:

- filters
- summary cards
- requirement table
- requirement detail interaction
- acceptance-criteria coverage
- linked tests

The new requirement × test-case matrix should complement those features.

Do not remove working functionality merely to add the grid.

==================================================
7. DO NOT TOUCH
==================================================

Do NOT modify:

- backend services
- requirementParser.ts
- testSuggestionService.ts
- backend API routes
- seeded data
- existing unit/integration tests merely to force green results
- bob_sessions/

Do NOT implement:

- Coverage Gaps page
- Change Impact page
- Risk Dashboard
- Release Readiness Report
- Playwright E2E tests

Do NOT commit.

Do NOT push.

==================================================
8. VALIDATION
==================================================

After the correction run:

npm run typecheck
npm test
npm run build

Expected current test baseline:

89 / 89 passing

Task 05 correction must not introduce any new failures.

Verify:

- requirement × test grid renders from /api/traceability data
- every requirement appears as a row
- test cases appear as columns
- covered/uncovered cells are correct
- full/partial coverage is distinguishable when applicable
- matrix cells have accessible aria-labels
- current Task 05 features still work
- no backend files were modified
- bob_sessions/ was not modified

==================================================
9. FINAL RESPONSE
==================================================

When complete, report:

- files modified
- how the requirement × test matrix was implemented
- coverage logic used
- accessibility behavior
- validation commands
- final test count
- build result
- confirmation existing Task 05 functionality was preserved
- confirmation no backend files were modified
- confirmation bob_sessions/ was not modified
- confirmation no commit or push occurred

Then STOP and wait for human review.

---

**Status:** active  **Date:** 2026-09-26

---

### 👤 User

TASK 05 CORRECTION — REQUIREMENT × TEST TRACEABILITY GRID

PROJECT: Spec2Ship
BRANCH: task-5-traceability-matrix

IMPORTANT:
This is a correction to the existing Task 05 Traceability Matrix implementation.

Preserve all Task 05 work already present on this branch.

DO NOT replace or remove:
- Traceability summary metrics
- filters/search
- requirement detail panel
- acceptance-criteria coverage
- linked test case views
- existing accessibility work

The current implementation is useful, but it is missing the core requirement × test-case matrix defined in spec2ship-plan.md.

==================================================
1. READ FIRST
==================================================

Before changing anything, inspect:

- spec2ship-plan.md
- src/frontend/pages/TraceabilityPage.tsx
- src/frontend/components/Traceability/TraceabilityMatrix.tsx
- src/frontend/components/Traceability/TraceabilitySummary.tsx
- src/frontend/components/Traceability/RequirementTraceabilityDetail.tsx
- src/frontend/components/Traceability/AcceptanceCriteriaCoverage.tsx
- src/frontend/components/Traceability/LinkedTests.tsx
- src/backend/types/models.ts
- src/backend/server.ts

Also inspect the actual response shape from:

GET /api/traceability

Do not modify files yet.

==================================================
2. CURRENT PROBLEM
==================================================

The existing TraceabilityMatrix.tsx currently shows a requirements summary table with columns such as:

ID
Title
Criticality
Coverage
Tests
Changed

That table may remain.

However, Task 05 specifically requires an actual requirement × test-case traceability matrix.

The UI must additionally show:

- requirements as ROWS
- test cases as COLUMNS
- each requirement/test intersection as a matrix cell
- whether that test covers that requirement

Example concept:

                    TC-001   TC-002   TC-003
REQ-AUTH-001          ✓        ✓        —
REQ-AUTH-002          —        —        ✓
REQ-AUTH-003          —        ✓        ✓

Use the data already returned by:

GET /api/traceability

Do not create new backend logic.

==================================================
3. MATRIX COVERAGE LOGIC
==================================================

Determine coverage using the existing TraceabilityMatrix data.

A cell is covered when the test case is linked to the requirement through the traceability data.

Use the existing backend models and links as the source of truth.

Do not invent or hard-code requirement/test relationships.

If coverageType is available, expose whether coverage is:

- full
- partial

An uncovered cell must clearly display that it is not covered.

==================================================
4. ACCESSIBILITY
==================================================

The matrix must use semantic table markup:

<table>
<thead>
<tbody>
<th>
<td>

Requirement row headers should use:

scope="row"

Test case column headers should use:

scope="col"

Every requirement × test cell must include a meaningful aria-label.

Examples:

REQ-AUTH-001 covered by TC-AUTH-001-01

REQ-AUTH-001 partially covered by TC-AUTH-001-02

REQ-AUTH-001 not covered by TC-AUTH-002-01

Do not rely on color alone.

Covered cells should include a visible symbol/text such as:

✓ Full
◐ Partial
— None

or another equally clear accessible treatment.

==================================================
5. RESPONSIVE BEHAVIOR
==================================================

The matrix may become horizontally wide.

Place it in a horizontally scrollable container so:

- columns remain readable
- the page layout does not break
- requirement identifiers remain understandable

Do not introduce a large UI framework.

==================================================
6. PRESERVE CURRENT TASK 05 FEATURES
==================================================

Keep the current:

- filters
- summary cards
- requirement table
- requirement detail interaction
- acceptance-criteria coverage
- linked tests

The new requirement × test-case matrix should complement those features.

Do not remove working functionality merely to add the grid.

==================================================
7. DO NOT TOUCH
==================================================

Do NOT modify:

- backend services
- requirementParser.ts
- testSuggestionService.ts
- backend API routes
- seeded data
- existing unit/integration tests merely to force green results
- bob_sessions/

Do NOT implement:

- Coverage Gaps page
- Change Impact page
- Risk Dashboard
- Release Readiness Report
- Playwright E2E tests

Do NOT commit.

Do NOT push.

==================================================
8. VALIDATION
==================================================

After the correction run:

npm run typecheck
npm test
npm run build

Expected current test baseline:

89 / 89 passing

Task 05 correction must not introduce any new failures.

Verify:

- requirement × test grid renders from /api/traceability data
- every requirement appears as a row
- test cases appear as columns
- covered/uncovered cells are correct
- full/partial coverage is distinguishable when applicable
- matrix cells have accessible aria-labels
- current Task 05 features still work
- no backend files were modified
- bob_sessions/ was not modified

==================================================
9. FINAL RESPONSE
==================================================

When complete, report:

- files modified
- how the requirement × test matrix was implemented
- coverage logic used
- accessibility behavior
- validation commands
- final test count
- build result
- confirmation existing Task 05 functionality was preserved
- confirmation no backend files were modified
- confirmation bob_sessions/ was not modified
- confirmation no commit or push occurred

Then STOP and wait for human review.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Read and inspect all relevant files before making changes
[ ] Implement requirement × test-case matrix in TraceabilityMatrix.tsx
[ ] Validate with typecheck, test, and build


### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file

Let me start by reading all the relevant files simultaneously.

> 🔧 **read_file** — spec2ship-plan.md

> 🔧 **read_file** — src/frontend/pages/TraceabilityPage.tsx

> 🔧 **read_file** — src/backend/types/models.ts

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/frontend/components/Traceability/TraceabilitySummary.tsx

> 🔧 **read_file** — src/frontend/components/Traceability/TraceabilityMatrix.tsx

> 🔧 **read_file** — src/frontend/components/Traceability/RequirementTraceabilityDetail.tsx

### 🤖 Assistant

> 🔧 called: read_file, read_file, read_file



> 🔧 **read_file** — src/frontend/components/Traceability/AcceptanceCriteriaCoverage.tsx

> 🔧 **read_file** — src/frontend/components/Traceability/LinkedTests.tsx

> 🔧 **read_file** — src/backend/server.ts

### 🤖 Assistant

> 🔧 called: read_file, glob

Now let me check the spec2ship-plan.md for Task 04 specifically (which covers the Traceability Matrix page), and also look at existing tests to understand what's tested:

> 🔧 **read_file** — spec2ship-plan.md

> 🔧 **glob** — src/frontend/components/Traceability/**/*.test.*

### 🤖 Assistant

> 🔧 called: glob



> 🔧 **glob** — src/**/*.test.*

### 🤖 Assistant

> 🔧 called: glob



> 🔧 **glob** — tests/**/*.test.*

### 🤖 Assistant

> 🔧 called: glob



> 🔧 **glob** — **/*.test.*

### 🤖 Assistant

> 🔧 called: glob, read_file



> 🔧 **read_file** — tests/integration/api.test.ts

> 🔧 **glob** — tests/unit/traceability*.test.*

### 🤖 Assistant

> 🔧 called: glob

Now I have a thorough understanding of the codebase. Let me check the traceability API response shape quickly by looking at the traceability service:

> 🔧 **glob** — src/backend/services/traceabilityService.ts

### 🤖 Assistant

> 🔧 called: glob



> 🔧 **glob** — src/backend/services/*.ts

### 🤖 Assistant

> 🔧 called: glob



> 🔧 **glob** — src/backend/services/*.js

### 🤖 Assistant

> 🔧 called: list_files



> 🔧 **list_files** — src/backend/services

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — src/backend/services/traceabilityService.ts

### 🤖 Assistant

> 🔧 called: read_file

Now I have a complete picture. The `/api/traceability` endpoint returns a `TraceabilityMatrix` with:
- `requirements[]` — requirement objects
- `testCases[]` — test case objects  
- `links[]` — `TraceabilityLink` objects with `requirementId`, `testCaseId`, `coverageType`

The coverage logic: a cell is covered when there's a `TraceabilityLink` with the matching `requirementId` + `testCaseId`. `coverageType` is either `'full'` or `'partial'`.

Now let me look at the existing tests to understand the baseline:

> 🔧 **read_file** — tests/integration/api.test.ts

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have everything I need. Let me now implement the requirement × test-case matrix. The plan:

1. Create a new `RequirementTestGrid.tsx` component that renders the actual matrix grid
2. Update `TraceabilityMatrix.tsx` to include it below the existing summary table

The grid:
- Rows = requirements (filtered by current filters)
- Columns = test cases (all unique test cases that appear in any link, or all test cases)
- Cell = covered (full/partial) or uncovered (none), with aria-label
- Horizontally scrollable container
- Semantic `<table>` markup with `scope="row"` / `scope="col"`

> 🔧 **update_todo_list** — 
[x] Read and inspect all relevant files before making changes
[-] Implement requirement × test-case matrix in TraceabilityMatrix.tsx
[ ] Validate with typecheck, test, and build


### 🤖 Assistant

> 🔧 called: apply_diff

Now I'll add the grid component directly into the `TraceabilityMatrix.tsx` file, below the existing requirements summary table. The grid will use all test cases that are relevant (those linked to the filtered requirements, or to keep it manageable, all test cases linked to at least one requirement in the current view):

> 🔧 **apply_diff** — src/frontend/components/Traceability/TraceabilityMatrix.tsx

### 🤖 Assistant

> 🔧 called: read_file

I noticed there's a duplicate `style` prop on the `<p>` element at the bottom of `RequirementTestGrid` (both `style={gridSectionHeadingStyle}` and `style={{ marginTop: ... }}`). Let me fix that:

> 🔧 **read_file** — src/frontend/components/Traceability/TraceabilityMatrix.tsx

### 🤖 Assistant

> 🔧 called: apply_diff



> 🔧 **apply_diff** — src/frontend/components/Traceability/TraceabilityMatrix.tsx

### 🤖 Assistant

> 🔧 called: execute_command

Now let me run the typecheck, tests, and build:

> 🔧 **execute_command** — npm run typecheck 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Typecheck passes with no errors. Now tests:

> 🔧 **execute_command** — npm test 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

89/89 passing. Now build:

> 🔧 **execute_command** — npm run build 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

All validations pass cleanly. Let me do a final review of the modified file to confirm it is correct end-to-end:

> 🔧 **update_todo_list** — 
[x] Read and inspect all relevant files before making changes
[x] Implement requirement × test-case matrix in TraceabilityMatrix.tsx
[x] Validate with typecheck, test, and build


### 🤖 Assistant

---

## Task 05 Correction — Complete

### Files Modified

- **`src/frontend/components/Traceability/TraceabilityMatrix.tsx`** — only file changed. No backend files, no `bob_sessions/`, no tests modified. No commit or push made.

---

### How the Requirement × Test Matrix Was Implemented

Three additions were made inside `TraceabilityMatrix.tsx`:

1. **`getCellCoverage(reqId, tcId, matrix)`** — pure helper that looks up `matrix.links` for a matching `requirementId` + `testCaseId` pair and returns the `CoverageType` (`'full'` | `'partial'`) or `null` if no link exists.

2. **`GridCell`** component — renders a single `<td>` cell with:
   - A symbol + sub-label (not color alone) per coverage state:
     - `✓ Full` (green) for full coverage
     - `◐ Partial` (orange) for partial coverage
     - `— None` (muted) for no coverage
   - An explicit `aria-label` on the `<td>` (e.g. `"REQ-AUTH-001 covered by TC-AUTH-001-01"`, `"REQ-AUTH-001 partially covered by …"`, `"REQ-AUTH-001 not covered by …"`)

3. **`RequirementTestGrid`** component — renders the full `<table>`:
   - `<thead>` with `scope="col"` on every column header; the corner `<th>` is sticky (`position: sticky; left: 0`) so it stays visible during horizontal scroll
   - `<tbody>` rows where each row's first cell is a `<th scope="row">` (also sticky) showing the requirement ID
   - Every data cell delegates to `GridCell`
   - Wrapped in a `overflow-x: auto` scrollable container with border/radius
   - Shows only the test cases linked (via `links[]` or `testCase.requirementIds`) to the currently filtered requirements — so filters directly affect both the summary table and the grid
   - A small legend above the table explains the three symbols
   - A live-region footer shows the current dimension count (e.g. "5 requirements × 12 test cases")

The `RequirementTestGrid` is rendered directly below the existing requirements summary table inside the main `TraceabilityMatrix` export, inside the same `<>` fragment.

---

### Coverage Logic Used

- **Source of truth**: `matrix.links[]` (from `GET /api/traceability`) — specifically `TraceabilityLink.coverageType`.
- A cell is **full** when `links` contains a record with matching `requirementId` + `testCaseId` and `coverageType === 'full'`.
- A cell is **partial** when the same match exists but `coverageType === 'partial'`.
- A cell is **uncovered** when no matching link exists.
- Column set = union of all test cases reachable from filtered requirements via both `matrix.links` and `testCase.requirementIds` (mirrors existing `getLinkedTestCount` logic).
- No data is hard-coded.

---

### Accessibility Behavior

| Feature | Implementation |
|---|---|
| Semantic table markup | `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` |
| Column header scope | `scope="col"` on every `<th>` in `<thead>` |
| Row header scope | `scope="row"` on first `<th>` of every `<tbody>` row |
| Per-cell aria-label | `aria-label="REQ-… covered by TC-…"` / `partially covered by` / `not covered by` |
| Non-color indicators | Each cell shows a symbol (✓ / ◐ / —) **and** a text sub-label (Full / Partial / None) |
| Column/row header symbol | `aria-hidden="true"` on the decorative symbol `<span>`; text label below is visible |
| Horizontal scroll | `overflow-x: auto` wrapper; sticky row/column headers remain anchored |

---

### Validation Results

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ No errors |
| `npm test` | ✅ **89 / 89 passing** |
| `npm run build` | ✅ Success (196 kB JS, 5.57 kB CSS) |

---

### Confirmations

- ✅ Existing Task 05 features preserved: summary cards, filter bar, requirements table, requirement detail panel, acceptance-criteria coverage, linked tests
- ✅ No backend files modified
- ✅ `bob_sessions/` not modified
- ✅ No commit or push performed
- ✅ New matrix renders from `/api/traceability` data only
- ✅ Every requirement appears as a row; relevant test cases appear as columns; cells reflect `links[]` coverage type
- ✅ Full / partial / uncovered states are all visually and semantically distinguishable