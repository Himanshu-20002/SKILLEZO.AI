export const CONTENT_ENGINE_VERSION = "1.0.0";

export type BulletClassification =
  | "ACHIEVEMENT"
  | "RESPONSIBILITY"
  | "IMPACT"
  | "TECHNICAL"
  | "METRIC"
  | "OWNERSHIP"
  | "GENERIC"
  | "VAGUE";

export type MetricType =
  | "PERCENTAGE"
  | "COUNT"
  | "CURRENCY"
  | "MULTIPLIER"
  | "TIME"
  | "RATE"
  | "SCALE"
  | "OTHER";

export type ImpactLevel = "HIGH" | "MEDIUM" | "LOW" | "NONE";

export interface MetricEvidence {
  metricId: string;
  rawValue: string;
  metricType: MetricType;
  sourceText: string;
  evidenceId: string;
  confidence: number;
}

export interface ScopeEvidence {
  value: string;
  unit?: string;
  sourceText: string;
  confidence: number;
}

export interface ContentSignal {
  signalId: string;
  type:
    | "WEAK_ACTION"
    | "VAGUE_OUTCOME"
    | "NO_METRIC"
    | "STRONG_METRIC"
    | "STRONG_SCOPE"
    | "RESPONSIBILITY_HEAVY"
    | "GENERIC_LANGUAGE"
    | "REPETITION"
    | "POSSIBLE_DUPLICATE"
    | "KEYWORD_STUFFING"
    | "LONG_BULLET"
    | "SHORT_BULLET"
    | "STRONG_IMPACT";
  severity: "LOW" | "MEDIUM" | "HIGH";
  evidenceIds: string[];
  explanationCode: string;
  detail?: string;
}

export interface ResumeBullet {
  bulletId: string;
  section: "EXPERIENCE" | "PROJECTS" | "SUMMARY" | "OTHER";
  sourceText: string;
  normalizedText: string;
  order: number;
  evidenceIds: string[];
  roleTitle?: string;
  companyName?: string;
}

export interface BulletContentAnalysis {
  bulletId: string;
  actionScore: number;
  ownershipScore: number;
  specificityScore: number;
  outcomeScore: number;
  measurableImpactScore: number;
  technicalDepthScore: number;
  relevanceScore: number;
  evidenceStrengthScore: number;
  qualityScore: number;
  classification: BulletClassification[];
  signals: ContentSignal[];
  metricEvidence: MetricEvidence[];
  scopeEvidence: ScopeEvidence[];
  requirementLinks: string[];
  engineVersion: string;
}

export interface SectionContentScore {
  section: "EXPERIENCE" | "PROJECTS" | "SUMMARY";
  score: number;
  bulletCount: number;
  averageEvidenceStrength: number;
  strongBulletsCount: number;
  weakBulletsCount: number;
}

export interface ContentOpportunity {
  opportunityId: string;
  type:
    | "ADD_MEASURABLE_IMPACT"
    | "STRENGTHEN_OUTCOME"
    | "INCREASE_SPECIFICITY"
    | "SHOW_OWNERSHIP"
    | "REDUCE_GENERIC_LANGUAGE"
    | "REDUCE_REPETITION"
    | "STRENGTHEN_TECHNICAL_DEPTH";
  priorityFactors: {
    roleRelevance: number;
    matchImportance: number;
    evidenceStrength: number;
    contentQuality: number;
  };
  bulletIds: string[];
  requirementIds: string[];
  signalIds: string[];
}

export interface ImpactSummary {
  bulletsAnalyzed: number;
  impactBullets: number;
  metricBackedBullets: number;
  responsibilityFocusedBullets: number;
  vagueBullets: number;
  highEvidenceBullets: number;
}

export interface ResumeContentAnalysisResult {
  contentScore: number;
  label: string;
  sections: {
    experience: SectionContentScore;
    projects: SectionContentScore;
    summary: SectionContentScore;
  };
  bullets: BulletContentAnalysis[];
  signals: ContentSignal[];
  metrics: MetricEvidence[];
  scopes: ScopeEvidence[];
  impactSummary: ImpactSummary;
  opportunities: ContentOpportunity[];
  engineVersion: string;
}
