export const MATCH_ENGINE_VERSION = "1.0.0";

export type SkillMatchStatus = "MATCHED" | "PARTIAL" | "RELATED" | "NOT_DETECTED";

export type RequirementCategory =
  | "SKILL"
  | "EXPERIENCE"
  | "EDUCATION"
  | "CERTIFICATION"
  | "KEYWORD"
  | "RESPONSIBILITY";

export type MatchSource = "ROLE_BENCHMARK" | "JOB_DESCRIPTION" | "BOTH";

export interface RequirementMatchResult {
  requirementId: string;
  canonicalName: string;
  category: RequirementCategory;
  requirementType: "REQUIRED" | "PREFERRED";
  source: MatchSource;
  status: SkillMatchStatus;
  confidence: number;
  candidateEvidenceIds: string[];
  requirementEvidenceIds: string[];
  rationaleCode: string;
  candidateSkillId?: string;
  relatedSkillName?: string;
}

export interface JobMatchSkillGap {
  skillId: string;
  skillName: string;
  requirementType: "REQUIRED" | "PREFERRED";
  source: MatchSource;
  status: "MISSING" | "PARTIAL" | "RELATED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  requirementIds: string[];
  evidenceIds: string[];
  recommendation?: string;
}

export type MatchSkillGap = JobMatchSkillGap;

export type MatchStrengthLabel =
  | "Excellent Match"
  | "Strong Match"
  | "Moderate Match"
  | "Weak Match"
  | "Low Match";

export interface ResumeJobMatchResult {
  overallMatchScore: number;
  requiredCoverage: number;
  preferredCoverage: number;
  experienceMatch: number;
  educationCoverage: number;
  certificationCoverage: number;
  matchStrengthLabel: MatchStrengthLabel;
  skillMatches: RequirementMatchResult[];
  experienceMatches: RequirementMatchResult[];
  educationMatches: RequirementMatchResult[];
  certificationMatches: RequirementMatchResult[];
  keywordMatches: RequirementMatchResult[];
  gaps: JobMatchSkillGap[];
  summary: {
    totalRequirements: number;
    matched: number;
    partial: number;
    related: number;
    notDetected: number;
  };
  engineVersion: string;
}
