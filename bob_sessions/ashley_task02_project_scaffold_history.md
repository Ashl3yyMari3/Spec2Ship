# TASK 02 — PROJECT SCAFFOLD AND DATA MODELS

You are working in the existing Spec2Ship repository for the IBM Bob 2.0 Hackathon.

SOURCE OF TRUTH

Before making changes:

1. Read spec2ship-plan.md.
2. Inspect the current repository structure.
3. Read sample_data/requirements/authentication.md.
4. Follow the approved architecture, data models, and decisions in spec2ship-plan.md.
5. Do not modify or delete anything inside bob_sessions/.
6. Preserve all existing documentation and evidence files.

SCOPE

For this task ONLY, implement:

- project/tooling configuration
- TypeScript data models
- fictional requirement metadata
- runtime requirement data
- seeded test data
- traceability data
- validation of this foundation

DO NOT implement:

- Express API routes
- backend service logic
- frontend pages or components
- test-suggestion logic
- coverage analysis
- change-impact analysis
- risk calculation
- release-readiness calculation
- Playwright test implementation
- application UI

Those belong to later tasks.

IMPLEMENTATION REQUIREMENTS

1. Project configuration

Create a root package.json using the approved stack:

- TypeScript
- React
- Vite
- Node.js
- Express
- Vitest
- Playwright

Include only dependencies needed by the approved architecture.

Provide scripts for at least:

- dev
- dev:frontend
- dev:backend
- build
- typecheck
- test
- test:e2e

Use a lightweight TypeScript runtime for the backend if needed.

2. TypeScript configuration

Create tsconfig.json with:

- strict mode
- modern ES target
- React JSX support
- appropriate Node/browser types
- clean module resolution

Avoid unnecessary configuration.

3. Vite configuration

Create vite.config.ts with:

- React plugin
- frontend Vite configuration
- /api proxy to localhost port 3001

Do not implement API routes yet.

4. Shared data models

Create:

src/backend/types/models.ts

Implement the interfaces/types already defined in spec2ship-plan.md, including:

- Requirement
- AcceptanceCriteriaRef
- TestCase
- TraceabilityLink
- TraceabilityMatrix
- CoverageGap
- CoverageGapReport
- ImpactReport
- RiskFactors
- RiskScore
- ReleaseReadinessReport

Use the exact approved domain values from the plan.

5. Requirement criticality

Update the fictional ShopSphere authentication requirements with explicit criticality:

REQ-AUTH-001 = high
REQ-AUTH-002 = high
REQ-AUTH-003 = critical

Do not infer criticality from keywords.

Use a deterministic metadata format that will be easy to parse later.

Do not create malformed Markdown just to force YAML front matter.

6. Runtime requirement data

Create:

data/requirements/

Populate it with the fictional authentication requirements in a format suitable for later deterministic parsing.

7. Seeded tests

Create:

data/tests/auth-tests.json

Create a small, meaningful seeded test set covering all three requirements.

Include appropriate examples of:

- functional
- negative
- boundary
- security
- edge testing

Every test must conform to the TestCase model in spec2ship-plan.md and include traceability to its originating requirement and acceptance criteria.

Use:

origin = "seeded"

Do not create an unnecessarily large dataset.

8. Traceability

Create:

data/traceability/auth-traceability.json

Link seeded tests to requirements using the approved TraceabilityLink model.

Use only:

coverageType = "full"
or
coverageType = "partial"

9. Validation

After implementation:

- run npm install
- run the project's typecheck command
- validate all JSON files
- verify package.json scripts
- fix any errors introduced by this task

Do not proceed if validation fails.

10. Final response

When finished, report only:

- files created
- files modified
- packages installed
- validation commands executed
- validation results
- any necessary architecture decisions
- confirmation that later-phase functionality was NOT implemented

IMPORTANT

Do not modify bob_sessions/.

Do not commit or push to GitHub.

Do not continue into Task 03.

Stop after successful validation and wait for human review.

---

**Status:** active  **Date:** 2026-09-25

---

### 👤 User

TASK 02 — PROJECT SCAFFOLD AND DATA MODELS

You are working in the existing Spec2Ship repository for the IBM Bob 2.0 Hackathon.

SOURCE OF TRUTH

Before making changes:

1. Read spec2ship-plan.md.
2. Inspect the current repository structure.
3. Read sample_data/requirements/authentication.md.
4. Follow the approved architecture, data models, and decisions in spec2ship-plan.md.
5. Do not modify or delete anything inside bob_sessions/.
6. Preserve all existing documentation and evidence files.

SCOPE

For this task ONLY, implement:

- project/tooling configuration
- TypeScript data models
- fictional requirement metadata
- runtime requirement data
- seeded test data
- traceability data
- validation of this foundation

DO NOT implement:

- Express API routes
- backend service logic
- frontend pages or components
- test-suggestion logic
- coverage analysis
- change-impact analysis
- risk calculation
- release-readiness calculation
- Playwright test implementation
- application UI

Those belong to later tasks.

IMPLEMENTATION REQUIREMENTS

1. Project configuration

Create a root package.json using the approved stack:

- TypeScript
- React
- Vite
- Node.js
- Express
- Vitest
- Playwright

Include only dependencies needed by the approved architecture.

Provide scripts for at least:

- dev
- dev:frontend
- dev:backend
- build
- typecheck
- test
- test:e2e

Use a lightweight TypeScript runtime for the backend if needed.

2. TypeScript configuration

Create tsconfig.json with:

- strict mode
- modern ES target
- React JSX support
- appropriate Node/browser types
- clean module resolution

Avoid unnecessary configuration.

3. Vite configuration

Create vite.config.ts with:

- React plugin
- frontend Vite configuration
- /api proxy to localhost port 3001

Do not implement API routes yet.

4. Shared data models

Create:

src/backend/types/models.ts

Implement the interfaces/types already defined in spec2ship-plan.md, including:

- Requirement
- AcceptanceCriteriaRef
- TestCase
- TraceabilityLink
- TraceabilityMatrix
- CoverageGap
- CoverageGapReport
- ImpactReport
- RiskFactors
- RiskScore
- ReleaseReadinessReport

Use the exact approved domain values from the plan.

5. Requirement criticality

Update the fictional ShopSphere authentication requirements with explicit criticality:

REQ-AUTH-001 = high
REQ-AUTH-002 = high
REQ-AUTH-003 = critical

Do not infer criticality from keywords.

Use a deterministic metadata format that will be easy to parse later.

Do not create malformed Markdown just to force YAML front matter.

6. Runtime requirement data

Create:

data/requirements/

Populate it with the fictional authentication requirements in a format suitable for later deterministic parsing.

7. Seeded tests

Create:

data/tests/auth-tests.json

Create a small, meaningful seeded test set covering all three requirements.

Include appropriate examples of:

- functional
- negative
- boundary
- security
- edge testing

Every test must conform to the TestCase model in spec2ship-plan.md and include traceability to its originating requirement and acceptance criteria.

Use:

origin = "seeded"

Do not create an unnecessarily large dataset.

8. Traceability

Create:

data/traceability/auth-traceability.json

Link seeded tests to requirements using the approved TraceabilityLink model.

Use only:

coverageType = "full"
or
coverageType = "partial"

9. Validation

After implementation:

- run npm install
- run the project's typecheck command
- validate all JSON files
- verify package.json scripts
- fix any errors introduced by this task

Do not proceed if validation fails.

10. Final response

When finished, report only:

- files created
- files modified
- packages installed
- validation commands executed
- validation results
- any necessary architecture decisions
- confirmation that later-phase functionality was NOT implemented

IMPORTANT

Do not modify bob_sessions/.

Do not commit or push to GitHub.

Do not continue into Task 03.

Stop after successful validation and wait for human review.

---

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[-] Read spec2ship-plan.md and inspect repository structure
[ ] Read sample_data/requirements/authentication.md
[ ] Create root package.json with approved stack
[ ] Create tsconfig.json
[ ] Create vite.config.ts
[ ] Create src/backend/types/models.ts with all data models
[ ] Update fictional authentication requirements with criticality metadata
[ ] Create data/requirements/ with parsed requirement data
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: read_file, list_files



> 🔧 **list_files** — .

> 🔧 **read_file** — spec2ship-plan.md

### 🤖 Assistant

> 🔧 called: read_file, list_files



> 🔧 **list_files** — src

> 🔧 **read_file** — spec2ship-plan.md

### 🤖 Assistant

> 🔧 called: read_file, read_file



> 🔧 **read_file** — spec2ship-plan.md

> 🔧 **read_file** — sample_data/requirements/authentication.md

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — spec2ship-plan.md

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — spec2ship-plan.md

### 🤖 Assistant

> 🔧 called: read_file



> 🔧 **read_file** — spec2ship-plan.md

### 🤖 Assistant

> 🔧 called: update_todo_list

Now I have a complete picture. Let me implement everything systematically.

> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[-] Create root package.json with approved stack
[ ] Create tsconfig.json
[ ] Create vite.config.ts
[ ] Create src/backend/types/models.ts with all data models
[ ] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[ ] Create data/requirements/authentication.md (copy with criticality metadata)
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — package.json

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[-] Create tsconfig.json
[ ] Create vite.config.ts
[ ] Create src/backend/types/models.ts with all data models
[ ] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[ ] Create data/requirements/authentication.md (copy with criticality metadata)
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file, write_file



> 🔧 **write_file** — tsconfig.json

> 🔧 **write_file** — tsconfig.node.json

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[-] Create vite.config.ts
[ ] Create src/backend/types/models.ts with all data models
[ ] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[ ] Create data/requirements/authentication.md (copy with criticality metadata)
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'src/frontend',
  build: {
    outDir: resolve(__dirname, 'dist/frontend'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@frontend': resolve(__dirname, 'src/frontend'),
      '@backend': resolve(__dirname, 'src/backend'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[-] Create src/backend/types/models.ts with all data models
[ ] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[ ] Create data/requirements/authentication.md (copy with criticality metadata)
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — /**
 * Spec2Ship — Shared TypeScript Data Models
 *
 * Single source of truth for all domain interfaces used by the backend
 * services and (via imports) by the frontend. Aligned with the data model
 * definitions in spec2ship-plan.md, Sections 7–14.
 */

// ---------------------------------------------------------------------------
// Requirement model (Section 7)
// ---------------------------------------------------------------------------

export type Criticality = 'low' | 'medium' | 'high' | 'critical';

export interface Requirement {
  id: string;               // e.g. "REQ-AUTH-001"
  title: string;            // e.g. "User Registration"
  description: string;      // prose description
  acceptanceCriteria: string[];  // ordered list of criteria (0-based index used in refs)
  domain: string;           // e.g. "authentication"
  criticality: Criticality;
  sourceFile: string;       // relative path to .md source
  tags: string[];           // optional labels
  changed: boolean;         // true if marked as recently changed
}

// ---------------------------------------------------------------------------
// Test Case model (Section 8)
// ---------------------------------------------------------------------------

export type TestType = 'functional' | 'negative' | 'boundary' | 'security' | 'edge';
export type TestStatus = 'pass' | 'fail' | 'not_run' | 'blocked';
export type TestOrigin = 'seeded' | 'suggested';

/**
 * References a single acceptance criterion in a specific requirement.
 * criterionIndex is a 0-based index into Requirement.acceptanceCriteria.
 */
export interface AcceptanceCriteriaRef {
  requirementId: string;    // e.g. "REQ-AUTH-001"
  criterionIndex: number;   // 0-based index into Requirement.acceptanceCriteria
}

export interface TestCase {
  id: string;                            // e.g. "TC-AUTH-001-01"
  title: string;                         // short description
  description: string;                   // what the test validates
  type: TestType;
  requirementIds: string[];              // which requirements this test covers
  acceptanceCriteriaRefs: AcceptanceCriteriaRef[];  // traceability to originating AC items
  status: TestStatus;
  automated: boolean;
  origin: TestOrigin;                    // seeded = hand-authored; suggested = generated
  notes: string;
}

// ---------------------------------------------------------------------------
// Traceability model (Section 9)
// ---------------------------------------------------------------------------

export type CoverageType = 'full' | 'partial';

export interface TraceabilityLink {
  requirementId: string;    // references Requirement.id
  testCaseId: string;       // references TestCase.id
  coverageType: CoverageType;
  notes: string;
}

export interface TraceabilityMatrix {
  requirements: Requirement[];
  testCases: TestCase[];
  links: TraceabilityLink[];
  generatedAt: string;      // ISO timestamp
}

// ---------------------------------------------------------------------------
// Coverage Gap model (Section 10)
// ---------------------------------------------------------------------------

export type GapType = 'no_coverage' | 'no_executed_coverage' | 'missing_test_types';

export interface CoverageGap {
  requirementId: string;
  gapType: GapType;
  missingTypes: string[];   // only populated for gapType = "missing_test_types"
  message: string;
}

export interface CoverageGapReport {
  totalRequirements: number;
  coveredCount: number;
  gapCount: number;
  gaps: CoverageGap[];
}

// ---------------------------------------------------------------------------
// Change-Impact model (Section 11)
// ---------------------------------------------------------------------------

export interface ImpactReport {
  changedRequirementId: string;
  directlyImpactedTests: TestCase[];
  transitivelyImpactedReqs: Requirement[];
  recommendation: string;   // human-readable summary
}

// ---------------------------------------------------------------------------
// Risk Score model (Section 12)
// ---------------------------------------------------------------------------

export interface RiskFactors {
  criticalityRaw: number;          // low=10, medium=40, high=70, critical=100
  coverageGapRaw: number;          // fully covered=0, partial=50, no coverage=100
  executionCompletenessRaw: number; // all pass=0, some not_run/blocked=50, any fail=100
  changeImpactRaw: number;          // not changed=0, changed=100
}

export type RiskTier = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RiskScore {
  requirementId: string;
  score: number;            // 0–100, weighted sum
  tier: RiskTier;           // Low | Medium | High | Critical
  factors: RiskFactors;
  weightedContributions: {
    criticality: number;    // criticalityRaw * 0.35
    coverageGap: number;    // coverageGapRaw * 0.30
    executionCompleteness: number; // executionCompletenessRaw * 0.20
    changeImpact: number;   // changeImpactRaw * 0.15
  };
}

// ---------------------------------------------------------------------------
// Release-Readiness Report model (Section 14)
// ---------------------------------------------------------------------------

export type ReleaseVerdict = 'Ready' | 'Review Required' | 'Not Ready';
export type CoverageStatus = 'full' | 'partial' | 'none';

export interface RequirementStatus {
  requirement: Requirement;
  riskScore: number;
  riskTier: RiskTier;
  coverageStatus: CoverageStatus;
  linkedTests: TestCase[];
  gapDetails: string | null;
}

export interface ReleaseReadinessReport {
  generatedAt: string;
  overallVerdict: ReleaseVerdict;
  verdictRationale: string;
  summary: {
    totalRequirements: number;
    coveredRequirements: number;
    uncoveredRequirements: number;
    passingTests: number;
    failingTests: number;
    notRunTests: number;
    blockedTests: number;
    criticalRiskCount: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
  };
  requirementStatuses: RequirementStatus[];
  coveragePercentage: number;   // 0–100, rounded to 1 decimal place
  blockingReasons: string[];    // populated when verdict is "Not Ready"
  reviewReasons: string[];      // populated when verdict is "Review Required"
  readyConfirmations: string[]; // populated when verdict is "Ready"
}


### 🤖 Assistant

> 🔧 called: update_todo_list

Now update the sample_data requirement file with YAML front-matter criticality, then create the data/ copy.

> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[-] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[ ] Create data/requirements/authentication.md (copy with criticality metadata)
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file

The plan says to add YAML front-matter per requirement, but warns "Do not create malformed Markdown just to force YAML front matter." The plan also notes the backend reads criticality from YAML front-matter. The cleanest approach is to add a single YAML front-matter block at the top of the document (one per file, standard Markdown/Jekyll convention), then also embed per-requirement metadata inline as HTML comments (which don't break Markdown rendering). However, re-reading the plan carefully: "Update `sample_data/requirements/authentication.md` to add YAML front-matter to each requirement block" — this means each individual requirement section gets its own criticality metadata.

The standard approach used by many documentation systems is to embed per-section metadata as an HTML comment or as a separate metadata block. Per the task constraint "Do not create malformed Markdown just to force YAML front matter", I'll use a single file-level YAML front-matter block that declares criticality for each requirement ID, plus keep the existing document intact.

> 🔧 **write_file** — ---
# Spec2Ship requirement metadata — parsed by requirementParser.ts
# Each entry maps a requirement ID to its explicit criticality value.
# Valid values: low | medium | high | critical
criticality:
  REQ-AUTH-001: high
  REQ-AUTH-002: high
  REQ-AUTH-003: critical
domain: authentication
---

# ShopSphere Authentication Requirements

## Application Context

ShopSphere is a fictional e-commerce application created solely as sample data for the Spec2Ship hackathon project.

No real customer, company, client, employee, or production data is used.

---

## REQ-AUTH-001 — User Registration

### Description

A new user must be able to create an account using an email address and password.

### Acceptance Criteria

1. The email address is required.
2. The email address must use a valid email format.
3. Each email address must be unique.
4. The password is required.
5. The password must contain at least 8 characters.
6. Leading and trailing spaces in the email address should be removed before validation.
7. Email addresses should be treated as case-insensitive when checking uniqueness.
8. After successful registration, the user must be redirected to the dashboard.
9. If registration fails, the user must remain on the registration page.
10. A meaningful validation message must be displayed when registration fails.

---

## REQ-AUTH-002 — User Login

### Description

A registered user must be able to sign in using a valid email address and password.

### Acceptance Criteria

1. Email and password are required.
2. Invalid credentials must not authenticate the user.
3. A successful login must redirect the user to the dashboard.
4. Authentication errors must not reveal whether a specific email address exists.
5. Leading and trailing spaces in the email address should be removed before authentication.
6. Email addresses should be treated as case-insensitive.
7. The password must remain case-sensitive.

---

## REQ-AUTH-003 — Account Lockout

### Description

The application must reduce the risk of repeated unauthorized login attempts.

### Acceptance Criteria

1. Five consecutive failed login attempts must trigger a temporary account lock.
2. The lock must last 15 minutes.
3. Successful authentication resets the failed-attempt counter.
4. The user must receive a generic message when the account is temporarily locked.
5. The lockout response must not expose sensitive account information.

---

## Expected QA Analysis

Spec2Ship should eventually identify:

- functional requirements
- acceptance criteria
- positive test scenarios
- negative test scenarios
- boundary conditions
- edge cases
- security-related considerations
- requirement ambiguities
- missing test coverage
- requirement-to-test traceability
- release risk


### 🤖 Assistant

> 🔧 called: update_todo_list

Now create the `data/requirements/authentication.md` (same content as the updated sample):

> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[x] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[-] Create data/requirements/authentication.md (copy with criticality metadata)
[ ] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — cp sample_data/requirements/authentication.md data/requirements/authentication.md

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — mkdir -p data/requirements data/tests data/traceability && cp sample_data/requirements/authentication.md data/requirements/authentication.md

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[x] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[x] Create data/requirements/authentication.md (copy with criticality metadata)
[-] Create data/tests/auth-tests.json with seeded test set
[ ] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file

Now author the seeded test cases. I'll create meaningful coverage for all 3 requirements with the required test types (functional, negative, boundary, security, edge), each with proper `acceptanceCriteriaRefs` and `origin: "seeded"`. The acceptance criteria are 0-indexed.

**REQ-AUTH-001** (10 AC, indices 0–9)
**REQ-AUTH-002** (7 AC, indices 0–6)  
**REQ-AUTH-003** (5 AC, indices 0–4)

> 🔧 **write_file** — [
  {
    "id": "TC-AUTH-001-01",
    "title": "Successful user registration with valid credentials",
    "description": "A new user provides a valid email address and a password of at least 8 characters. The system creates the account and redirects to the dashboard.",
    "type": "functional",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 0 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 1 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 3 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 4 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 7 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Happy-path registration covering email format, password length, and post-registration redirect."
  },
  {
    "id": "TC-AUTH-001-02",
    "title": "Registration rejected when email is missing",
    "description": "Submitting the registration form without an email address must fail with a validation message, and the user must remain on the registration page.",
    "type": "negative",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 0 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 8 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 9 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Verifies required-field validation and error message display for missing email."
  },
  {
    "id": "TC-AUTH-001-03",
    "title": "Registration rejected when password is missing",
    "description": "Submitting the registration form without a password must fail with a validation message, and the user must remain on the registration page.",
    "type": "negative",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 3 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 8 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 9 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Verifies required-field validation and error message display for missing password."
  },
  {
    "id": "TC-AUTH-001-04",
    "title": "Registration rejected when email format is invalid",
    "description": "Submitting a registration with a malformed email (e.g., 'notanemail') must fail validation. The user remains on the registration page and sees a meaningful error.",
    "type": "negative",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 1 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 8 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 9 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Tests multiple invalid email patterns: missing @, missing domain, double @ symbol."
  },
  {
    "id": "TC-AUTH-001-05",
    "title": "Registration rejected for duplicate email address",
    "description": "Attempting to register with an email address already in use must fail. The user remains on the registration page and receives a meaningful error.",
    "type": "negative",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 2 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 8 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 9 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Pre-registers an account then attempts re-registration with the same email."
  },
  {
    "id": "TC-AUTH-001-06",
    "title": "Password boundary — exactly 8 characters accepted",
    "description": "A password of exactly 8 characters (the minimum) must be accepted during registration.",
    "type": "boundary",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 4 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Lower boundary: 8 chars accepted. Companion test TC-AUTH-001-07 checks 7 chars rejected."
  },
  {
    "id": "TC-AUTH-001-07",
    "title": "Password boundary — 7 characters rejected",
    "description": "A password of 7 characters (one below the minimum) must be rejected. The user remains on the registration page with a validation error.",
    "type": "boundary",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 4 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 8 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 9 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Upper boundary of the rejection zone: 7 chars is just below the minimum threshold."
  },
  {
    "id": "TC-AUTH-001-08",
    "title": "Email leading and trailing spaces are trimmed before validation",
    "description": "An email with surrounding whitespace (e.g., '  user@example.com  ') must be trimmed before uniqueness and format checks. Registration must succeed if the trimmed email is valid and unique.",
    "type": "edge",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 5 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Edge case: whitespace-only input should also be treated as empty after trimming."
  },
  {
    "id": "TC-AUTH-001-09",
    "title": "Email uniqueness check is case-insensitive",
    "description": "Attempting to register 'USER@EXAMPLE.COM' when 'user@example.com' is already registered must be rejected as a duplicate.",
    "type": "edge",
    "requirementIds": ["REQ-AUTH-001"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 2 },
      { "requirementId": "REQ-AUTH-001", "criterionIndex": 6 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Covers mixed case and all-uppercase variants of an existing registered email."
  },
  {
    "id": "TC-AUTH-002-01",
    "title": "Successful login with valid credentials",
    "description": "A registered user provides their correct email and password. The system authenticates them and redirects to the dashboard.",
    "type": "functional",
    "requirementIds": ["REQ-AUTH-002"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 0 },
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 2 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Happy-path login covering required fields and post-login redirect."
  },
  {
    "id": "TC-AUTH-002-02",
    "title": "Login rejected with incorrect password",
    "description": "Providing a valid email but an incorrect password must not authenticate the user. The error message must not reveal whether the email exists.",
    "type": "negative",
    "requirementIds": ["REQ-AUTH-002"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 1 },
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 3 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Verifies generic error messaging — response must not say 'email found but password wrong'."
  },
  {
    "id": "TC-AUTH-002-03",
    "title": "Login rejected with unknown email address",
    "description": "Providing an email address that does not exist in the system must not authenticate the user. The error message must be identical to the invalid-password message.",
    "type": "security",
    "requirementIds": ["REQ-AUTH-002"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 1 },
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 3 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Security check: error message for unknown email must be indistinguishable from wrong-password error to prevent email enumeration."
  },
  {
    "id": "TC-AUTH-002-04",
    "title": "Login email is trimmed before authentication",
    "description": "An email with leading or trailing whitespace (e.g., ' user@example.com ') must be trimmed before authentication. Login must succeed if the trimmed email matches a registered account.",
    "type": "edge",
    "requirementIds": ["REQ-AUTH-002"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 4 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Mirrors the registration trimming requirement to ensure consistent behaviour."
  },
  {
    "id": "TC-AUTH-002-05",
    "title": "Login email is case-insensitive",
    "description": "A user registered as 'user@example.com' must be able to log in as 'USER@EXAMPLE.COM' or 'User@Example.Com'.",
    "type": "edge",
    "requirementIds": ["REQ-AUTH-002"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 5 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Tests multiple mixed-case variants of the email at login."
  },
  {
    "id": "TC-AUTH-002-06",
    "title": "Login password is case-sensitive",
    "description": "Providing the correct email but a password that differs only in case (e.g., 'Password1' vs 'password1') must be rejected.",
    "type": "security",
    "requirementIds": ["REQ-AUTH-002"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-002", "criterionIndex": 6 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Ensures the system does not normalise password case, which would weaken security."
  },
  {
    "id": "TC-AUTH-003-01",
    "title": "Account locks after 5 consecutive failed login attempts",
    "description": "After 5 consecutive failed login attempts for the same account, the account must be temporarily locked. A 6th attempt must be rejected with a lockout message.",
    "type": "functional",
    "requirementIds": ["REQ-AUTH-003"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 0 },
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 3 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Drives exactly 5 failed attempts and asserts the lock activates on attempt 5, then verifies the error message on attempt 6."
  },
  {
    "id": "TC-AUTH-003-02",
    "title": "Account lockout lasts 15 minutes",
    "description": "A locked account must remain inaccessible for 15 minutes. Login attempts before 15 minutes must be rejected; a login attempt after 15 minutes must succeed with valid credentials.",
    "type": "boundary",
    "requirementIds": ["REQ-AUTH-003"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 1 }
    ],
    "status": "not_run",
    "automated": false,
    "origin": "seeded",
    "notes": "Boundary: 14m 59s still locked; 15m 01s should unlock. Manual or time-controlled test due to real-time dependency."
  },
  {
    "id": "TC-AUTH-003-03",
    "title": "Successful login resets the failed-attempt counter",
    "description": "After a failed login attempt, a subsequent successful login must reset the failed-attempt counter to zero. A fresh sequence of 5 failures should then be required to trigger another lockout.",
    "type": "functional",
    "requirementIds": ["REQ-AUTH-003"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 2 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Verifies counter reset to prevent cumulative lockout across separate sessions."
  },
  {
    "id": "TC-AUTH-003-04",
    "title": "Lockout message does not expose sensitive account information",
    "description": "The lockout response message must be generic and must not disclose the account owner's name, email, lock duration countdown, or any internal state.",
    "type": "security",
    "requirementIds": ["REQ-AUTH-003"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 3 },
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 4 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Security check: inspects the response body and headers to confirm no sensitive data leaks."
  },
  {
    "id": "TC-AUTH-003-05",
    "title": "Boundary — 4 failed attempts do not trigger lockout",
    "description": "Exactly 4 consecutive failed login attempts must not lock the account. The 5th attempt must still be permitted to authenticate.",
    "type": "boundary",
    "requirementIds": ["REQ-AUTH-003"],
    "acceptanceCriteriaRefs": [
      { "requirementId": "REQ-AUTH-003", "criterionIndex": 0 }
    ],
    "status": "pass",
    "automated": true,
    "origin": "seeded",
    "notes": "Lower boundary of the lockout threshold: 4 failures must not trigger lock (5 must)."
  }
]


### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[x] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[x] Create data/requirements/authentication.md (copy with criticality metadata)
[x] Create data/tests/auth-tests.json with seeded test set
[-] Create data/traceability/auth-traceability.json
[ ] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: write_file



> 🔧 **write_file** — [
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-01",
    "coverageType": "full",
    "notes": "Happy-path registration covers required fields, email format, password length, and redirect."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-02",
    "coverageType": "partial",
    "notes": "Covers missing-email validation. Does not exercise uniqueness or password rules."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-03",
    "coverageType": "partial",
    "notes": "Covers missing-password validation. Does not exercise email rules."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-04",
    "coverageType": "partial",
    "notes": "Covers invalid email format rejection. Does not exercise password or uniqueness rules."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-05",
    "coverageType": "partial",
    "notes": "Covers duplicate email rejection. Does not exercise password length rules."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-06",
    "coverageType": "partial",
    "notes": "Covers the lower boundary of the password length requirement (exactly 8 chars accepted)."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-07",
    "coverageType": "partial",
    "notes": "Covers the rejection boundary for password length (7 chars rejected)."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-08",
    "coverageType": "full",
    "notes": "Covers the email trimming requirement end-to-end including whitespace-only edge case."
  },
  {
    "requirementId": "REQ-AUTH-001",
    "testCaseId": "TC-AUTH-001-09",
    "coverageType": "full",
    "notes": "Covers case-insensitive uniqueness check for duplicate email detection."
  },
  {
    "requirementId": "REQ-AUTH-002",
    "testCaseId": "TC-AUTH-002-01",
    "coverageType": "full",
    "notes": "Happy-path login covering required fields and post-login redirect."
  },
  {
    "requirementId": "REQ-AUTH-002",
    "testCaseId": "TC-AUTH-002-02",
    "coverageType": "partial",
    "notes": "Covers invalid credentials rejection and generic error messaging (wrong password path)."
  },
  {
    "requirementId": "REQ-AUTH-002",
    "testCaseId": "TC-AUTH-002-03",
    "coverageType": "partial",
    "notes": "Covers invalid credentials rejection and email enumeration prevention (unknown email path)."
  },
  {
    "requirementId": "REQ-AUTH-002",
    "testCaseId": "TC-AUTH-002-04",
    "coverageType": "full",
    "notes": "Covers email trimming at login, consistent with registration trimming behaviour."
  },
  {
    "requirementId": "REQ-AUTH-002",
    "testCaseId": "TC-AUTH-002-05",
    "coverageType": "full",
    "notes": "Covers case-insensitive email authentication."
  },
  {
    "requirementId": "REQ-AUTH-002",
    "testCaseId": "TC-AUTH-002-06",
    "coverageType": "full",
    "notes": "Covers case-sensitive password enforcement."
  },
  {
    "requirementId": "REQ-AUTH-003",
    "testCaseId": "TC-AUTH-003-01",
    "coverageType": "full",
    "notes": "Covers lockout trigger after 5 consecutive failures and generic lockout message."
  },
  {
    "requirementId": "REQ-AUTH-003",
    "testCaseId": "TC-AUTH-003-02",
    "coverageType": "partial",
    "notes": "Covers lockout duration boundary (15 minutes). Marked not_run due to time dependency."
  },
  {
    "requirementId": "REQ-AUTH-003",
    "testCaseId": "TC-AUTH-003-03",
    "coverageType": "full",
    "notes": "Covers counter reset on successful authentication."
  },
  {
    "requirementId": "REQ-AUTH-003",
    "testCaseId": "TC-AUTH-003-04",
    "coverageType": "full",
    "notes": "Covers generic lockout message and no sensitive data exposure in lockout response."
  },
  {
    "requirementId": "REQ-AUTH-003",
    "testCaseId": "TC-AUTH-003-05",
    "coverageType": "full",
    "notes": "Covers lower threshold boundary: 4 failures must not trigger lockout."
  }
]


### 🤖 Assistant

> 🔧 called: update_todo_list

Now run npm install, then typecheck:

> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[x] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[x] Create data/requirements/authentication.md (copy with criticality metadata)
[x] Create data/tests/auth-tests.json with seeded test set
[x] Create data/traceability/auth-traceability.json
[-] Run npm install
[ ] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm install 2>&1

### 🤖 Assistant

> 🔧 called: update_todo_list

npm install succeeded. The vulnerabilities are from transitive dependencies in test/dev tools (Playwright, Vitest) and are not blocking. Now run typecheck:

> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[x] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[x] Create data/requirements/authentication.md (copy with criticality metadata)
[x] Create data/tests/auth-tests.json with seeded test set
[x] Create data/traceability/auth-traceability.json
[x] Run npm install
[-] Run typecheck and validate JSON files
[ ] Fix any errors


### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run typecheck 2>&1

### 🤖 Assistant

> 🔧 called: apply_diff

Need to add `baseUrl` to enable path aliases:

> 🔧 **apply_diff** — tsconfig.json

### 🤖 Assistant

> 🔧 called: execute_command



> 🔧 **execute_command** — npm run typecheck 2>&1

### 🤖 Assistant

> 🔧 called: execute_command

Typecheck passes with no errors. Now validate the JSON files:

> 🔧 **execute_command** — node -e "
const fs = require('fs');
const files = [
  'data/tests/auth-tests.json',
  'data/traceability/auth-traceability.json'
];
let allOk = true;
for (const f of files) {
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'));
    console.log('✓', f);
  } catch (e) {
    console.error('✗', f, e.message);
    allOk = false;
  }
}
process.exit(allOk ? 0 : 1);
"

### 🤖 Assistant

> 🔧 called: execute_command

Now verify the package.json scripts are all defined:

> 🔧 **execute_command** — node -e "
const pkg = require('./package.json');
const required = ['dev','dev:frontend','dev:backend','build','typecheck','test','test:e2e'];
const missing = required.filter(s => !pkg.scripts[s]);
if (missing.length) { console.error('Missing scripts:', missing); process.exit(1); }
else { console.log('All required scripts present:', required.join(', ')); }
"

### 🤖 Assistant

> 🔧 called: update_todo_list



> 🔧 **update_todo_list** — 
[x] Read spec2ship-plan.md and inspect repository structure
[x] Read sample_data/requirements/authentication.md
[x] Create root package.json with approved stack
[x] Create tsconfig.json
[x] Create vite.config.ts
[x] Create src/backend/types/models.ts with all data models
[x] Update sample_data/requirements/authentication.md with YAML front-matter criticality
[x] Create data/requirements/authentication.md (copy with criticality metadata)
[x] Create data/tests/auth-tests.json with seeded test set
[x] Create data/traceability/auth-traceability.json
[x] Run npm install
[x] Run typecheck and validate JSON files
[x] Fix any errors


### 🤖 Assistant

All tasks complete. Here is the full report.

---

## Task 02 — Final Report

### Files Created

| File | Purpose |
|------|---------|
| [`package.json`](package.json) | Root project config — approved stack, all required scripts |
| [`tsconfig.json`](tsconfig.json) | TypeScript: strict mode, ES2022, React JSX, path aliases `@backend`/`@frontend` |
| [`tsconfig.node.json`](tsconfig.node.json) | Companion TypeScript config for backend-only build |
| [`vite.config.ts`](vite.config.ts) | Vite: React plugin, `/api` proxy to `localhost:3001` |
| [`src/backend/types/models.ts`](src/backend/types/models.ts) | All 11 TypeScript interfaces from the plan |
| [`data/requirements/authentication.md`](data/requirements/authentication.md) | Runtime requirement data (copy of updated sample) |
| [`data/tests/auth-tests.json`](data/tests/auth-tests.json) | 19 seeded test cases across all 3 requirements |
| [`data/traceability/auth-traceability.json`](data/traceability/auth-traceability.json) | 20 traceability links |

### Files Modified

| File | Change |
|------|--------|
| [`sample_data/requirements/authentication.md`](sample_data/requirements/authentication.md) | Added YAML front-matter block with explicit criticality: REQ-AUTH-001=high, REQ-AUTH-002=high, REQ-AUTH-003=critical |

### Packages Installed

279 packages installed via `npm install`. Key runtime packages: `express@4`, `cors@2`, `react@18`, `react-dom@18`, `react-router-dom@6`. Key dev packages: `typescript@5`, `vite@5`, `vitest@1`, `tsx@4`, `concurrently@8`, `@playwright/test@1`, `supertest@7`, all `@types/*` packages.

### Validation Commands Executed

```
npm run typecheck   →  exit 0 (no errors)
node JSON.parse()   →  ✓ data/tests/auth-tests.json
                       ✓ data/traceability/auth-traceability.json
node scripts check  →  All 7 required scripts present
```

### Architecture Decisions

1. **YAML front-matter at file level (not per-section)**: Standard Markdown has one front-matter block per document. Embedding per-section YAML blocks would produce malformed/non-standard Markdown. The file-level front-matter maps each requirement ID to its criticality explicitly — no keyword inference. The `requirementParser.ts` (Phase 2) will read `criticality[reqId]` from this block.

2. **`tsx` for backend runtime**: Chosen as a lightweight TypeScript runner for `dev:backend` (`tsx watch`), avoiding a separate `ts-node` config. Zero config, works with ESM.

3. **`tsconfig.node.json`**: Separated backend-only build config from the root `tsconfig.json` so `vite build` compiles backend independently. The root `tsconfig.json` handles `tsc --noEmit` typecheck across the full project.

4. **19 seeded test cases**: Sufficient to demonstrate all 5 test types (functional, negative, boundary, security, edge) across all 3 requirements without being an unnecessarily large dataset. One test (`TC-AUTH-003-02`) is deliberately `status: "not_run"` to create a realistic non-trivial traceability scenario for the coverage/risk services in Phase 2.

### Confirmation — Later-Phase Functionality NOT Implemented

- ✅ No Express routes or server code
- ✅ No backend service logic (parser, suggester, coverage, impact, risk, report)
- ✅ No frontend pages, components, or hooks
- ✅ No Playwright test implementations
- ✅ `bob_sessions/` untouched
- ✅ No git commit or push performed