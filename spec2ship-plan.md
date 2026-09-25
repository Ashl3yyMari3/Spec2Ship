# Spec2Ship — Implementation Plan

## Top-Level Overview

Spec2Ship is an AI-assisted QA traceability and release-readiness system built for the IBM Bob 2.0 Hackathon. It takes a set of software requirements, parses them into a structured model, suggests test cases deterministically from acceptance criteria, links tests back to requirements, detects coverage gaps, assesses change impact, calculates release risk, and produces a human-readable release-readiness report. The entire workflow is driven from a local web UI backed by an Express API. No paid third-party API is required.

The MVP demonstrates the full end-to-end pipeline using the existing ShopSphere fictional authentication requirements as the primary demo dataset.

---

## 1. Problem Statement

QA engineers and developers frequently lack a clear, automated connection between software requirements and test coverage. The result is:

- Requirements that have no corresponding tests.
- Changes that silently break untested areas.
- Release decisions made without objective risk evidence.
- Traceability documents that are written once and never maintained.

Spec2Ship solves this by maintaining a live traceability matrix that links every requirement to the tests that cover it, flags gaps, models risk, and generates a release-readiness verdict with supporting evidence.

---

## 2. MVP Scope

**In scope:**
- Parse markdown requirements files into a structured requirement model.
- Seeded test cases (JSON) plus a deterministic test-suggestion engine that generates positive, negative, boundary, and edge-case test suggestions from acceptance criteria — no external API required.
- Requirement-to-test traceability matrix (explicit linkage); suggested tests retain traceability to their originating requirement and acceptance criterion.
- Coverage-gap detection: requirements with zero test coverage.
- Change-impact analysis: given a changed requirement ID, surface all tests that must be re-evaluated.
- Release-risk score per requirement (based on criticality, coverage gaps, test execution results, and change impact).
- Release-readiness verdict: Ready / Review Required / Not Ready, with a full per-reason explanation.
- React + Vite frontend displaying all of the above.
- Express backend serving the parsed data, traceability matrix, and report.
- Playwright end-to-end tests for the full workflow.
- Sample data: ShopSphere authentication requirements (3 requirements, acceptance criteria pre-loaded).

**Out of scope (post-hackathon):**
- Live GitHub integration or diff-based change detection.
- AI-generated test cases from an LLM API.
- User authentication or multi-user support.
- Database persistence (file-based JSON store is sufficient for MVP).
- CI/CD pipeline integration.

---

## 3. User Workflow

1. **Load requirements** — user selects or uses the pre-loaded ShopSphere authentication requirements.
2. **View requirements** — the UI displays each requirement with its ID, title, description, and acceptance criteria.
3. **View test cases** — the UI displays all test cases, each linked to one or more requirement IDs.
4. **View traceability matrix** — a requirement × test matrix showing which tests cover which requirements.
5. **Review coverage gaps** — the UI highlights requirements with zero or insufficient test coverage.
6. **Run change-impact analysis** — the user marks a requirement as "changed"; the system surfaces all tests that reference it.
7. **Review risk scores** — each requirement displays a calculated risk score with contributing factors.
8. **Generate release-readiness report** — a single-page summary report with the overall verdict and per-requirement status.
9. **Export report** — the report is available as a printable HTML page or JSON download.

---

## 4. Proposed Architecture

```
Browser (React + Vite)
        │
        │  HTTP (fetch / REST)
        ▼
Express API Server (Node.js + TypeScript)
        │
        ├── /api/requirements       → parsed requirement model
        ├── /api/tests              → test case model
        ├── /api/traceability       → requirement-to-test links
        ├── /api/gaps               → coverage gap detection
        ├── /api/impact/:reqId      → change-impact analysis
        ├── /api/risk               → risk scores per requirement
        └── /api/report             → release-readiness report
        │
        ├── data/requirements/      → markdown requirement files (parsed on load)
        ├── data/tests/             → JSON test case files
        └── data/traceability/      → JSON traceability link files
```

All data is file-based. The backend reads from `data/` on startup and caches in memory. No database is required.

---

## 5. Frontend Responsibilities

- Display requirements list with IDs, titles, acceptance-criteria counts.
- Display test cases list with IDs, titles, linked requirement IDs, pass/fail status.
- Render the traceability matrix as a grid: rows = requirements, columns = test cases, cells indicate coverage.
- Show coverage-gap indicators inline on the requirements list (red badge for zero coverage).
- Change-impact panel: select a requirement, view all tests that must be re-evaluated.
- Risk dashboard: per-requirement risk score (numeric 0–100) with a color-coded tier (Low / Medium / High / Critical).
- Release-readiness report page: overall verdict banner, per-requirement status table, summary metrics.
- Report export: "Print" button (browser print-to-PDF) and "Download JSON" button.
- Navigation: sidebar with links to each major section.
- Responsive layout sufficient for a desktop demo.

---

## 6. Backend Responsibilities

- Parse markdown requirement files (`.md`) into the requirement data model on startup. Criticality is read from YAML front-matter; default is `"medium"` if absent.
- Load JSON seeded test case files into the test data model.
- Load JSON traceability link files.
- Run the deterministic `testSuggestionService` at startup to generate suggested test cases from each requirement's acceptance criteria; merge these with seeded test cases.
- Serve all data via 8 REST endpoints (requirements, tests, suggestions, traceability, gaps, impact, risk, report).
- Compute coverage-gap detection on demand.
- Compute change-impact analysis for a given requirement ID.
- Compute release-risk scores using the four-factor weighted formula (Section 12).
- Compute the evidence-based release-readiness report and verdict (Section 13).
- No persistence writes required for MVP (read-only data layer).
- CORS enabled for local development (Vite dev server on a different port).

---

## 7. Requirement Data Model

```
Requirement {
  id:               string          // e.g. "REQ-AUTH-001"
  title:            string          // e.g. "User Registration"
  description:      string          // prose description
  acceptanceCriteria: string[]      // ordered list of criteria
  domain:           string          // e.g. "authentication"
  criticality:      "low" | "medium" | "high" | "critical"
  sourceFile:       string          // relative path to .md source
  tags:             string[]        // optional labels
  changed:          boolean         // true if marked as recently changed
}
```

Criticality is explicitly declared in the requirement source file using YAML front-matter. Valid values are `"low"`, `"medium"`, `"high"`, and `"critical"`. If no value is provided, the default is `"medium"`. Keyword-based inference is not used. For the ShopSphere dataset, `REQ-AUTH-003 — Account Lockout` is explicitly marked `criticality: critical` because it is security-related.

---

## 8. Test Case Data Model

```
TestCase {
  id:                    string          // e.g. "TC-AUTH-001-01"
  title:                 string          // short description
  description:           string          // what the test validates
  type:                  "functional" | "negative" | "boundary" | "security" | "edge"
  requirementIds:        string[]        // which requirements this test covers
  acceptanceCriteriaRefs: AcceptanceCriteriaRef[]  // traceability to originating AC items
  status:                "pass" | "fail" | "not_run" | "blocked"
  automated:             boolean
  origin:                "seeded" | "suggested"  // seeded = manually authored; suggested = generated by test suggester
  notes:                 string
}

AcceptanceCriteriaRef {
  requirementId:         string   // e.g. "REQ-AUTH-001"
  criterionIndex:        number   // 0-based index into Requirement.acceptanceCriteria
}
```

For the MVP, a small set of seeded test cases are hand-authored in `data/tests/auth-tests.json`. Additionally, a deterministic `testSuggestionService.ts` generates suggested test cases from the parsed acceptance criteria of each requirement. Suggested tests carry `AcceptanceCriteriaRef` entries so their origin is always traceable. Both seeded and suggested tests are served by `/api/tests`.

---

## 9. Requirement-to-Test Traceability Model

```
TraceabilityLink {
  requirementId:    string          // references Requirement.id
  testCaseId:       string          // references TestCase.id
  coverageType:     "full" | "partial"
  notes:            string
}

TraceabilityMatrix {
  requirements:     Requirement[]
  testCases:        TestCase[]
  links:            TraceabilityLink[]
  generatedAt:      string          // ISO timestamp
}
```

The matrix is computed by the backend by joining requirements, test cases, and links. It is returned as a single object by `/api/traceability`.

---

## 10. Coverage-Gap Detection Approach

A requirement has a **coverage gap** if:

- It has zero `TraceabilityLink` entries → `gap: "no_coverage"`.
- It has links, but all linked test cases have `status: "not_run"` or `status: "blocked"` → `gap: "no_executed_coverage"`.
- It has links, but no test covers a `"negative"` or `"boundary"` type → `gap: "missing_test_types"` (informational).

The `/api/gaps` endpoint returns:

```
CoverageGapReport {
  totalRequirements:   number
  coveredCount:        number
  gapCount:            number
  gaps: {
    requirementId:     string
    gapType:           "no_coverage" | "no_executed_coverage" | "missing_test_types"
    missingTypes:      string[]    // only for missing_test_types
    message:           string
  }[]
}
```

---

## 11. Change-Impact Analysis Approach

When a requirement is marked `changed: true`:

1. Look up all `TraceabilityLink` entries where `requirementId` matches.
2. Collect the linked `TestCase` objects.
3. For each test case, also surface other requirements that share that test (transitively impacted requirements).
4. Return the set of tests that must be re-evaluated and any transitively impacted requirements.

The `/api/impact/:reqId` endpoint returns:

```
ImpactReport {
  changedRequirementId:      string
  directlyImpactedTests:     TestCase[]
  transitivelyImpactedReqs:  Requirement[]
  recommendation:            string    // human-readable summary
}
```

---

## 12. Release-Risk Calculation Approach

Each requirement receives a numeric risk score from 0–100. The score is a weighted sum of four deterministic factors. All factor weights and raw values are included in the API response so the UI can display a full breakdown.

| Factor                          | Weight | Raw Value Range |
|--------------------------------|--------|-----------------|
| Criticality                     | 35%    | low=10, medium=40, high=70, critical=100 |
| Coverage gap                    | 30%    | fully covered=0, partial coverage=50, no coverage=100 |
| Test execution completeness     | 20%    | all pass=0, some not_run or blocked=50, any fail=100 |
| Change impact                   | 15%    | not changed=0, changed=100 |

```
riskScore = (criticality * 0.35)
          + (coverageGap * 0.30)
          + (executionCompleteness * 0.20)
          + (changeImpact * 0.15)
```

Risk tiers:
- 0–24: Low
- 25–49: Medium
- 50–74: High
- 75–100: Critical

The UI displays each factor's raw value and weighted contribution alongside the final score so the score is always explainable.

---

## 13. Release-Readiness Calculation Approach

The overall release verdict is evidence-based and determined by evaluating specific observable conditions, not merely by looking at risk tier counts. The verdict is one of three levels. All matching reasons are collected and surfaced in the report.

### NOT READY — any of the following must be true:
- At least one `critical` requirement has zero test coverage.
- At least one test with `type: "security"` linked to a `critical` requirement has `status: "fail"`.
- At least one `critical` requirement has an unresolved `gap: "no_coverage"` or `gap: "no_executed_coverage"`.
- Overall requirement coverage (requirements with at least one passing test / total requirements) is below 70%.

### REVIEW REQUIRED — none of the NOT READY conditions apply, and any of the following are true:
- Overall requirement coverage is between 70% and 89% (inclusive).
- At least one `high` or `medium` requirement has a coverage gap of any type.
- At least one test has `status: "not_run"` or `status: "blocked"`.
- At least one requirement is marked `changed: true` (change-impact analysis identifies areas needing validation).

### READY — all of the following must be true:
- Overall requirement coverage is at least 90%.
- Every `critical` requirement has at least one test with `status: "pass"`.
- No test with `type: "security"` linked to a `critical` requirement has `status: "fail"`.
- No unresolved `gap: "no_coverage"` or `gap: "no_executed_coverage"` for any `critical` requirement.

Supporting metrics included in the verdict:
- Total requirements analyzed.
- Overall coverage percentage (formula above).
- Requirements with full coverage / partial coverage / no coverage.
- Number of tests passing / failing / not run / blocked.
- Ordered list of blocking reasons (for NOT READY).
- Ordered list of review reasons (for REVIEW REQUIRED).
- Ordered list of confirmations (for READY, lists what evidence satisfied each condition).

---

## 14. Report-Generation Approach

The `/api/report` endpoint assembles the full release-readiness report as a JSON object:

```
ReleaseReadinessReport {
  generatedAt:        string
  overallVerdict:     "Ready" | "Review Required" | "Not Ready"
  verdictRationale:   string
  summary: {
    totalRequirements:  number
    coveredRequirements: number
    uncoveredRequirements: number
    passingTests:       number
    failingTests:       number
    notRunTests:        number
    blockedTests:       number
    criticalRiskCount:  number
    highRiskCount:      number
    mediumRiskCount:    number
    lowRiskCount:       number
  }
  requirementStatuses: {
    requirement:        Requirement
    riskScore:          number
    riskTier:          "Low" | "Medium" | "High" | "Critical"
    coverageStatus:     "full" | "partial" | "none"
    linkedTests:        TestCase[]
    gapDetails:         string | null
  }[]
  coveragePercentage:  number        // 0–100, rounded to 1 decimal place
  blockingReasons:     string[]      // populated when verdict is "Not Ready"
  reviewReasons:       string[]      // populated when verdict is "Review Required"
  readyConfirmations:  string[]      // populated when verdict is "Ready"
}
```

The frontend renders this as the Report page. A print stylesheet ensures clean PDF export via browser print.

---

## 15. Proposed File/Folder Structure

```
spec2ship/
├── README.md
├── LICENSE
├── .gitignore
├── .bobignore
├── package.json                    ← root workspace (or single package)
├── tsconfig.json
├── vite.config.ts
│
├── docs/
│   ├── dataset_sources.md
│   └── README.md
│
├── sample_data/
│   └── requirements/
│       └── authentication.md
│
├── data/                           ← runtime data (read by backend)
│   ├── requirements/               ← .md files (symlink or copy of sample_data)
│   ├── tests/                      ← JSON test case files
│   │   └── auth-tests.json
│   └── traceability/               ← JSON traceability link files
│       └── auth-traceability.json
│
├── src/
│   ├── backend/
│   │   ├── index.ts                ← Express entry point
│   │   ├── server.ts               ← app factory (for testing)
│   │   ├── routes/
│   │   │   ├── requirements.ts
│   │   │   ├── tests.ts
│   │   │   ├── suggestions.ts
│   │   │   ├── traceability.ts
│   │   │   ├── gaps.ts
│   │   │   ├── impact.ts
│   │   │   ├── risk.ts
│   │   │   └── report.ts
│   │   ├── services/
│   │   │   ├── requirementParser.ts      ← parse .md → Requirement[]
│   │   │   ├── testSuggestionService.ts  ← deterministic test suggestion from AC
│   │   │   ├── coverageService.ts        ← gap detection logic
│   │   │   ├── impactService.ts          ← change-impact logic
│   │   │   ├── riskService.ts            ← risk score calculation (4-factor)
│   │   │   └── reportService.ts          ← evidence-based report assembly
│   │   └── types/
│   │       └── models.ts              ← all shared TypeScript interfaces
│   │
│   └── frontend/
│       ├── index.html
│       ├── main.tsx                   ← React entry point
│       ├── App.tsx                    ← router and layout
│       ├── components/
│       │   ├── Layout/
│       │   │   ├── Sidebar.tsx
│       │   │   └── Header.tsx
│       │   ├── Requirements/
│       │   │   ├── RequirementsList.tsx
│       │   │   └── RequirementDetail.tsx
│       │   ├── TestCases/
│       │   │   └── TestCasesList.tsx
│       │   ├── Traceability/
│       │   │   └── TraceabilityMatrix.tsx
│       │   ├── Gaps/
│       │   │   └── CoverageGaps.tsx
│       │   ├── Impact/
│       │   │   └── ImpactAnalysis.tsx
│       │   ├── Risk/
│       │   │   └── RiskDashboard.tsx
│       │   └── Report/
│       │       └── ReleaseReport.tsx
│       ├── pages/
│       │   ├── RequirementsPage.tsx
│       │   ├── TestsPage.tsx
│       │   ├── TraceabilityPage.tsx
│       │   ├── GapsPage.tsx
│       │   ├── ImpactPage.tsx
│       │   ├── RiskPage.tsx
│       │   └── ReportPage.tsx
│       ├── hooks/
│       │   └── useApi.ts              ← shared fetch hook
│       └── styles/
│           └── globals.css
│
├── tests/
│   ├── unit/
│   │   ├── requirementParser.test.ts
│   │   ├── testSuggestionService.test.ts
│   │   ├── coverageService.test.ts
│   │   ├── riskService.test.ts
│   │   └── reportService.test.ts
│   ├── integration/
│   │   └── api.test.ts
│   └── e2e/
│       └── workflow.spec.ts           ← Playwright full workflow test
│
├── reports/
│   └── README.md
│
└── bob_sessions/
    └── README.md
```

---

## 16. Testing Strategy

### Unit Tests (Vitest)
- `requirementParser.ts` — verify markdown files parse correctly into Requirement objects; verify YAML front-matter criticality is read; verify missing criticality defaults to `"medium"`.
- `testSuggestionService.ts` — verify that given a requirement with N acceptance criteria, at least one suggestion of each type (functional, negative, boundary, edge) is generated; verify `AcceptanceCriteriaRef` entries are populated correctly.
- `coverageService.ts` — verify gap types (`no_coverage`, `no_executed_coverage`, `missing_test_types`) are correctly detected from mock data.
- `riskService.ts` — verify the four-factor formula with known inputs produces expected scores; verify all factor raw values are included in the output.
- `reportService.ts` — verify NOT READY conditions trigger correctly; verify REVIEW REQUIRED conditions; verify READY conditions; verify all blocking/review/confirmation reason strings are populated.

### Integration Tests (Vitest + supertest)
- All 8 API endpoints respond with correct shapes.
- `/api/report` returns the correct verdict for the ShopSphere dataset (using fixture data with known statuses).
- `/api/impact/:reqId` returns the correct directly and transitively impacted items.
- `/api/suggestions` returns suggested test cases with `AcceptanceCriteriaRef` entries.
- `/api/risk` response includes factor breakdowns for each requirement.

### End-to-End Tests (Playwright)
- Full happy path: load app → view requirements → view tests → view traceability matrix → view gaps → run impact analysis → view risk dashboard → view report.
- Verify the report verdict displays on the Report page for the pre-loaded dataset.
- Verify coverage gap badges appear on the requirements list.
- Verify the risk score breakdown is visible on the Risk Dashboard for each requirement.

### Test Data
- The ShopSphere authentication dataset serves as the canonical test fixture.
- Unit tests use inline mock data; integration and e2e tests use the actual `data/` folder.

---

## 17. Error Handling and Edge Cases

- **Malformed markdown** — requirement parser must skip or warn on files that do not match the expected heading structure without crashing.
- **Missing traceability links** — a requirement with no links is not an error; it is correctly surfaced as a coverage gap.
- **Test ID reference not found** — if a `TraceabilityLink` references a non-existent `TestCase`, the backend logs a warning and skips the link.
- **Empty data directory** — if `data/requirements/` is empty, the API returns empty arrays; the frontend shows a "No requirements loaded" empty state.
- **Unknown requirement criticality tag** — defaults to `"medium"`.
- **API fetch failures in frontend** — each API call displays an inline error state rather than crashing the page.
- **`/api/impact/:reqId` for unknown ID** — returns 404 with a descriptive message.

---

## 18. Accessibility Considerations

- All interactive elements (buttons, links, selects) must be keyboard-navigable with visible focus states.
- Traceability matrix cells use `aria-label` attributes to describe what each cell represents (e.g., "REQ-AUTH-001 covered by TC-AUTH-001-01").
- Color-coded risk tiers must include a non-color indicator (text label or icon) so the display is not color-alone.
- The report verdict banner uses `role="status"` or `role="alert"` appropriate to its urgency.
- All images (if any) have `alt` text.
- Semantic HTML (`<main>`, `<nav>`, `<section>`, `<table>`) used throughout.

---

## 19. Security Considerations

- No user authentication required for MVP (local demo only).
- The backend must not allow path traversal when loading requirement files (validate file paths before reading).
- All API inputs (e.g., `reqId` parameter in `/api/impact/:reqId`) must be validated against the loaded requirement IDs before use; reject anything not matching `[A-Z0-9-]+`.
- CORS configuration must restrict origins to `localhost` only (not `*`) even in development.
- No secrets, credentials, or real PII in the codebase or sample data.

---

## 20. Suggested Implementation Phases

### Phase 1 — Foundation
- Project scaffold: `package.json`, `tsconfig.json`, `vite.config.ts`.
- Define all TypeScript interfaces in `src/backend/types/models.ts` including `AcceptanceCriteriaRef`, `RiskFactors`, and updated `TestCase`.
- Update `sample_data/requirements/authentication.md` with YAML front-matter criticality per requirement.
- Populate `data/requirements/` from the updated sample file.
- Author `data/tests/auth-tests.json` (seeded test cases with `acceptanceCriteriaRefs` and `origin: "seeded"`).
- Author `data/traceability/auth-traceability.json` (links between seeded test cases and requirements).

### Phase 2 — Backend API
- Implement Express server with all 8 routes (including `/api/suggestions`).
- Implement `requirementParser.ts`, `testSuggestionService.ts`, `coverageService.ts`, `impactService.ts`, `riskService.ts`, `reportService.ts`.
- Write unit tests for all services.
- Write integration tests for all 8 endpoints.

### Phase 3 — Frontend Core
- Scaffold React app with Vite.
- Implement sidebar navigation and layout.
- Build Requirements, Test Cases, and Traceability Matrix pages.

### Phase 4 — Analysis Views
- Build Coverage Gaps page.
- Build Change-Impact Analysis page.
- Build Risk Dashboard page.

### Phase 5 — Report
- Build Release-Readiness Report page.
- Implement print stylesheet.
- Implement JSON download button.

### Phase 6 — End-to-End Testing and Polish
- Write Playwright e2e tests for the full workflow.
- Accessibility pass: focus states, ARIA labels, semantic HTML.
- Final README update with run instructions and demo walkthrough.

---

## 21. Acceptance Criteria for the MVP

- [ ] The app runs locally with a single command (e.g., `npm run dev`).
- [ ] The Requirements page displays all 3 ShopSphere authentication requirements with their acceptance criteria. `REQ-AUTH-003` shows `criticality: critical`.
- [ ] The Test Cases page displays seeded and suggested test cases; each shows its linked requirement IDs and, for suggested tests, the originating acceptance criterion reference.
- [ ] The Traceability Matrix page shows a requirement × test grid with correct coverage indicators.
- [ ] The Coverage Gaps page correctly identifies requirements with zero or insufficient test coverage and labels the gap type.
- [ ] The Change-Impact page: selecting a requirement surfaces all directly impacted tests and any transitively impacted requirements.
- [ ] The Risk Dashboard displays a numeric risk score, tier, and per-factor breakdown for each requirement.
- [ ] The Release-Readiness Report page displays an overall verdict (Ready / Review Required / Not Ready), per-requirement status, coverage percentage, and the full list of blocking reasons, review reasons, or ready confirmations.
- [ ] The report verdict is correct and matches the evidence for the ShopSphere dataset.
- [ ] The report can be printed (print stylesheet renders cleanly) and downloaded as JSON.
- [ ] All unit and integration tests pass.
- [ ] At least one Playwright e2e test covers the full happy-path workflow.
- [ ] No console errors in the browser during a standard walkthrough.
- [ ] No real personal data in the codebase.

---

## 22. First Coding Task

**Task: Project Scaffold and Data Models**

The first coding task establishes the entire project foundation that all other tasks depend on. It must not be skipped or combined with Phase 2.

Specifically:

1. Create `package.json` at the root with scripts for `dev`, `build`, `test`, and `lint`. Include runtime dependencies: `express`, `cors`. Include build/dev dependencies: `typescript`, `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `react-router-dom`, `vitest`, `supertest`, `@playwright/test`, plus TypeScript type packages for all of the above.

2. Create `tsconfig.json` (strict mode, ESNext target, path aliases for `@backend` and `@frontend`).

3. Create `vite.config.ts` with the React plugin and a proxy for `/api` pointing to the Express server port (3001).

4. Create `src/backend/types/models.ts` containing all TypeScript interfaces: `Requirement`, `AcceptanceCriteriaRef`, `TestCase`, `TraceabilityLink`, `TraceabilityMatrix`, `CoverageGap`, `CoverageGapReport`, `ImpactReport`, `RiskFactors`, `RiskScore`, `ReleaseReadinessReport`.

5. Update `sample_data/requirements/authentication.md` to add YAML front-matter to each requirement block setting `criticality`. `REQ-AUTH-003` must be `criticality: critical`. Copy (or symlink) the file to `data/requirements/authentication.md`.

6. Author `data/tests/auth-tests.json` with seeded test cases for all 3 authentication requirements, covering functional, negative, boundary, and security types. Each test case must include `acceptanceCriteriaRefs` and `origin: "seeded"`.

7. Author `data/traceability/auth-traceability.json` with traceability links connecting the seeded test cases to their requirements with `coverageType` values.

**Expected outcome:** A compilable TypeScript project with a valid data layer that is ready for backend service implementation in Phase 2.

---

## Sub-Tasks

### Sub-Task 1 — Project Scaffold and Data Models
- **Intent:** Establish the build system, TypeScript configuration, shared type definitions, and seed data so every subsequent task has a stable foundation.
- **Expected Outcomes:** `npm install` succeeds; `npx tsc --noEmit` passes; `data/` folder contains `authentication.md` with YAML front-matter criticality, valid seeded test case JSON with `AcceptanceCriteriaRef` entries, and traceability link JSON.
- **Todo List:**
  1. Create root `package.json` with all required dependencies and scripts.
  2. Create `tsconfig.json` in strict mode.
  3. Create `vite.config.ts` with React plugin and `/api` proxy.
  4. Create `src/backend/types/models.ts` with all TypeScript interfaces including `AcceptanceCriteriaRef`, `RiskFactors`, and the updated `TestCase` (with `origin` and `acceptanceCriteriaRefs`).
  5. Update `sample_data/requirements/authentication.md` with YAML front-matter per requirement (criticality field); mark `REQ-AUTH-003` as `critical`.
  6. Copy to `data/requirements/authentication.md`.
  7. Create `data/tests/auth-tests.json` with seeded test cases for REQ-AUTH-001, REQ-AUTH-002, REQ-AUTH-003, with `acceptanceCriteriaRefs` and `origin: "seeded"`.
  8. Create `data/traceability/auth-traceability.json` with requirement-to-test links.
- **Relevant Context:** `sample_data/requirements/authentication.md`, Sections 7–9 (data models), Section 3 (criticality decisions).
- **Status:** [ ] pending

---

### Sub-Task 2 — Backend Services and API
- **Intent:** Implement the Express server, all service modules (parser, test suggester, coverage, impact, risk, report), and expose them via 8 REST endpoints.
- **Expected Outcomes:** `npm run dev:backend` starts the server on port 3001; all 8 `/api/*` endpoints return correct data for the ShopSphere dataset; unit tests for all services pass; integration tests for all endpoints pass.
- **Todo List:**
  1. Create `src/backend/server.ts` (Express app factory with CORS and JSON middleware).
  2. Create `src/backend/index.ts` (entry point, listen on port 3001).
  3. Implement `src/backend/services/requirementParser.ts` (parse `.md` with YAML front-matter).
  4. Implement `src/backend/services/testSuggestionService.ts` (deterministic suggestions from AC).
  5. Implement `src/backend/services/coverageService.ts`.
  6. Implement `src/backend/services/impactService.ts`.
  7. Implement `src/backend/services/riskService.ts` (four-factor formula; include factor raw values in output).
  8. Implement `src/backend/services/reportService.ts` (evidence-based verdict with per-reason lists).
  9. Create all 8 route files in `src/backend/routes/`.
  10. Write unit tests for each service (`tests/unit/`).
  11. Write integration tests for all endpoints using supertest (`tests/integration/api.test.ts`).
- **Relevant Context:** Sections 10–14 (service logic), Section 12 (risk formula with weights), Section 13 (verdict conditions), Section 17 (error handling), `data/` fixtures from Sub-Task 1.
- **Status:** [ ] pending

---

### Sub-Task 3 — Frontend Foundation and Requirements View
- **Intent:** Scaffold the React frontend with routing and layout, and implement the Requirements and Test Cases pages.
- **Expected Outcomes:** `npm run dev` shows the app in the browser; Requirements page lists all 3 auth requirements with criticality badges and acceptance criteria; Test Cases page lists seeded and suggested test cases with origin labels and requirement links.
- **Todo List:**
  1. Create `src/frontend/index.html`.
  2. Create `src/frontend/main.tsx` and `App.tsx` with React Router routes for all 7 pages.
  3. Implement `Sidebar.tsx` (links to all pages) and `Header.tsx`.
  4. Implement `useApi.ts` shared fetch hook with inline error state.
  5. Implement `RequirementsPage.tsx` and `RequirementsList.tsx` (show criticality badge, AC count).
  6. Implement `TestsPage.tsx` and `TestCasesList.tsx` (show origin label, requirement links, AC ref details).
  7. Add basic global styles.
- **Relevant Context:** Section 5 (frontend responsibilities), Section 15 (file structure), Section 18 (accessibility: semantic HTML, focus states).
- **Status:** [ ] pending

---

### Sub-Task 4 — Traceability Matrix Page
- **Intent:** Build the requirement × test matrix grid that is the core visual deliverable of traceability.
- **Expected Outcomes:** TraceabilityPage shows a grid with requirements as rows and test cases as columns; covered cells are clearly marked; uncovered cells are visually distinct.
- **Todo List:**
  1. Implement `TraceabilityPage.tsx`.
  2. Implement `TraceabilityMatrix.tsx` component.
  3. Add ARIA labels to all matrix cells.
- **Relevant Context:** Section 9 (traceability model), Section 18 (accessibility).
- **Status:** [ ] pending

---

### Sub-Task 5 — Coverage Gaps, Change-Impact, and Risk Pages
- **Intent:** Implement the three analysis views that turn traceability data into actionable QA insights.
- **Expected Outcomes:** Gaps page lists requirements with coverage problems and gap type label; Impact page lets the user select a requirement and see directly impacted tests and transitively impacted requirements; Risk page shows risk score with numeric value, tier label, and per-factor breakdown for each requirement.
- **Todo List:**
  1. Implement `GapsPage.tsx` and `CoverageGaps.tsx` (show gap type, requirement ID, and criticality).
  2. Implement `ImpactPage.tsx` and `ImpactAnalysis.tsx` (requirement selector, direct tests list, transitive requirements list).
  3. Implement `RiskPage.tsx` and `RiskDashboard.tsx` (score, tier, factor table per requirement).
  4. Ensure all color-coded elements have non-color fallback indicators (text label + icon, not color alone).
- **Relevant Context:** Sections 10–12, Section 17 (error handling), Section 18 (accessibility).
- **Status:** [ ] pending

---

### Sub-Task 6 — Release-Readiness Report Page
- **Intent:** Build the report page that synthesizes all analysis into a single, explainable release verdict.
- **Expected Outcomes:** Report page shows the verdict (Ready / Review Required / Not Ready), coverage percentage, per-requirement status table, and the full list of specific blocking reasons, review reasons, or ready confirmations; print view renders cleanly; JSON download works.
- **Todo List:**
  1. Implement `ReportPage.tsx` and `ReleaseReport.tsx`.
  2. Render the verdict banner with correct `role` attribute (`role="alert"` for Not Ready, `role="status"` for others).
  3. Render coverage percentage, summary metric counts, and per-requirement status table.
  4. Render the blocking reasons / review reasons / ready confirmations list (whichever is applicable).
  5. Add print CSS media query stylesheet.
  6. Implement "Download JSON" button.
- **Relevant Context:** Section 13 (verdict conditions and reason lists), Section 14 (report model), Section 18 (accessibility).
- **Status:** [ ] pending

---

### Sub-Task 7 — End-to-End Tests and Final Polish
- **Intent:** Validate the full workflow with Playwright and complete accessibility and documentation polish.
- **Expected Outcomes:** All unit, integration, and e2e tests pass; no console errors during a standard walkthrough; README contains run instructions.
- **Todo List:**
  1. Write `tests/e2e/workflow.spec.ts` covering the full happy-path workflow.
  2. Verify all acceptance criteria from Section 21 pass.
  3. Fix any accessibility issues found during final review.
  4. Update `README.md` with full run instructions and demo walkthrough.
  5. Update `bob_sessions/README.md` with session evidence instructions reminder.
- **Relevant Context:** Section 16 (testing strategy), Section 21 (acceptance criteria).
- **Status:** [ ] pending
