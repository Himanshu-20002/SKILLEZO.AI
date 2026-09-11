export interface ResumePersonalInfo {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface ResumeSkill {
  name: string;
  category?: string | null;
}

export interface ResumeEducation {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface ResumeExperience {
  companyName: string;
  jobTitle: string;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string | null;
}

export interface ResumeProject {
  title: string;
  description?: string | null;
  technologies?: string[];
  link?: string | null;
}

export interface ResumeCertification {
  name: string;
  issuer?: string | null;
  issueDate?: string | null;
}

export interface ResumeExtractedData {
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string | null;
  skillsExtracted?: string[];
  skills?: ResumeSkill[];
  educationCount?: number;
  education?: ResumeEducation[];
  experienceCount?: number;
  experience?: ResumeExperience[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  totalExperienceYears?: number | null;
  personalInfo?: ResumePersonalInfo | null;
  parserVersion?: string | null;
}

export interface ATSCompatibilityItem {
  system: 'Workday' | 'Taleo' | 'Greenhouse' | 'Lever' | 'Generic ATS';
  compatibilityScore: number;
  status: 'High Match' | 'Moderate Match' | 'Needs Optimization';
}

export interface KeywordMatchItem {
  keyword: string;
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Database' | 'Soft Skill';
  matched: boolean;
  frequency: number;
  importance: 'Required' | 'Preferred' | 'Optional';
}

export interface MissingSkillItem {
  skill: string;
  category: string;
  impactLevel: 'High' | 'Medium' | 'Low';
  recommendation: string;
}

export interface AIResumeRecommendation {
  id: string;
  title: string;
  category?: 'Formatting' | 'Keywords' | 'Impact Statements' | 'Brevity' | 'ATS' | 'SKILLS' | 'EXPERIENCE' | 'IMPACT' | 'SUMMARY' | 'STRUCTURE' | 'MATCH' | 'EVIDENCE' | string;
  summary?: string;
  problem?: string;
  whyItMatters?: string;
  description?: string;
  impactScoreBoost?: number;
  actionText?: string;
  suggestedAction?: string;
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore?: number;
  actionability?: 'FIX_NOW' | 'STRENGTHEN_EVIDENCE' | 'REQUIRES_NEW_EVIDENCE' | 'INFORMATIONAL';
  targetSection?: string;
  bulletId?: string;
  skillIds?: string[];
  requirementIds?: string[];
  evidenceIds?: string[];
}

export interface WordDiff {
  value: string;
  type: 'UNCHANGED' | 'ADDED' | 'REMOVED';
}

export interface OptimizationValidationError {
  code: string;
  message: string;
  unsupportedValue?: string;
}

export interface OptimizationValidationResult {
  valid: boolean;
  safetyLevel: 'SAFE' | 'REVIEW' | 'BLOCKED';
  safetyScore: number;
  errors: OptimizationValidationError[];
  warnings: Array<{ code: string; message: string }>;
  unsupportedClaims: string[];
  changedMetrics: string[];
  addedSkills: string[];
  changedOwnershipClaims: string[];
  meaningPreserved: boolean;
}

export interface ResumeScoreSnapshot {
  atsScore: number;
  matchScore?: number;
  contentScore?: number;
  timestamp: string;
}

export interface OptimizationScoreComparison {
  before: ResumeScoreSnapshot;
  after: ResumeScoreSnapshot;
  delta: {
    ats: number;
    match?: number;
    content?: number;
  };
  improved: boolean;
  regressed: boolean;
}

export interface TargetOption {
  bulletId: string;
  section: string;
  roleOrProject?: string;
  sourceText: string;
}

export interface ResumeOptimizationDraft {
  draftId: string;
  resumeId: string;
  baseResumeVersionId: string;
  recommendationId: string;
  target: {
    recommendationId: string;
    type: string;
    section: string;
    bulletId?: string;
    sourceText: string;
    sourceEvidenceIds: string[];
    isRewritable: boolean;
    nonRewritableReason?: string;
  };
  availableTargets?: TargetOption[];
  originalText: string;
  proposedText: string;
  validation: OptimizationValidationResult;
  beforeScores: ResumeScoreSnapshot;
  afterScores?: ResumeScoreSnapshot;
  scoreComparison?: OptimizationScoreComparison;
  decision?: 'IMPROVED' | 'ACCEPTABLE' | 'REGRESSED' | 'REJECTED';
  status: 'PROPOSED' | 'VALIDATED' | 'REJECTED' | 'ACCEPTED' | 'DISCARDED';
  createdAt: string;
}

export interface ResumeAuditPillars {
  formatting: {
    score: number;
    status: 'Passed' | 'Needs Attention' | 'Incomplete';
    summary: string;
    details: string[];
  };
  keywordAlignment: {
    score: number;
    matchedCount: number;
    totalTargetCount: number;
    status: 'High Alignment' | 'Moderate Alignment' | 'Low Alignment';
    topMatched: string[];
    missingCritical: string[];
  };
  measurableImpact: {
    score: number;
    metricsCount: number;
    status: 'Strong Impact' | 'Needs Metrics' | 'Lacks Quantifiable Results';
    summary: string;
    tip: string;
  };
  sectionStructure: {
    score: number;
    detectedSections: string[];
    missingSections: string[];
    wordCount: number;
    wordCountStatus: 'Optimal (1 Page)' | 'Slightly Long' | 'Needs Content';
  };
}

export interface ResumeAtsAnalysis {
  resumeId?: string;
  resumeVersion?: number;
  fileName?: string;
  overallScore: number;
  atsScore: number;
  matchScore?: number;
  contentScore?: number;
  impactScore: number;
  brevityScore: number;
  level?: "EXCELLENT" | "GOOD" | "AVERAGE" | "NEEDS_IMPROVEMENT" | string;
  breakdown?: {
    keywordMatch: number;
    structure: number;
    brevity: number;
    impact: number;
    readability: number;
  };
  categories?: Record<string, {
    score: number;
    matched: number;
    total: number;
    matchedSkills: string[];
  }>;
  auditPillars?: ResumeAuditPillars;
  atsCompatibility?: ATSCompatibilityItem[];
  keywords: KeywordMatchItem[];
  missingKeywords?: MissingSkillItem[];
  missingSkills?: MissingSkillItem[];
  recommendations: AIResumeRecommendation[];
  topAction?: AIResumeRecommendation;
  recommendationSummary?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  contentResult?: any;
  skillsProfile?: any;
  roleProfile?: any;
  extractedData?: ResumeExtractedData;
}

export type ResumeAnalysisData = ResumeAtsAnalysis;

export interface ResumeRecord {
  _id: string;
  id?: string;
  userId: string;
  title: string;
  originalFileName?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  fileUrl?: string;
  isDefault: boolean;
  version?: number;
  status: "pending" | "processing" | "completed" | "failed" | "uploaded";
  extractedData?: ResumeExtractedData;
  resumeDocument?: import("./resume-document").ResumeDocument | null;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

