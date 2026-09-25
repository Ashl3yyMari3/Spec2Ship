/**
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
