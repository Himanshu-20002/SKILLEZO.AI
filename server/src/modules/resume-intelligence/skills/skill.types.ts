export const SKILL_ENGINE_VERSION = "1.0.0";

export type SkillCategory =
  | "FRONTEND"
  | "BACKEND"
  | "DATABASE"
  | "CLOUD"
  | "DEVOPS"
  | "LANGUAGE"
  | "TESTING"
  | "MOBILE"
  | "AI_ML"
  | "SECURITY"
  | "TOOLS"
  | "OTHER";

export interface SkillDefinition {
  id: string;
  canonicalName: string;
  displayName: string;
  aliases: string[];
  category: SkillCategory;
  parentSkillId?: string;
  relatedSkillIds: string[];
  detectionPatterns?: string[];
  active: boolean;
}

export type SkillDetectionMethod = "EXACT" | "ALIAS" | "PATTERN";

export interface SkillEvidence {
  skillId: string;
  canonicalName: string;
  evidenceId: string;
  sourceSection: "summary" | "skills" | "experience" | "projects" | "education" | "certifications";
  sourceText: string;
  sourceIndex?: number;
  detectionMethod: SkillDetectionMethod;
  confidence: number;
}

export interface ResumeSkill {
  skillId: string;
  canonicalName: string;
  displayName: string;
  category: SkillCategory;
  frequency: number;
  evidenceIds: string[];
  confidence: number;
  sections: string[];
  evidenceList: SkillEvidence[];
}

export interface SkillCategorySummary {
  category: SkillCategory;
  count: number;
  skills: string[];
}

export interface ResumeSkillProfile {
  resumeId?: string;
  skills: ResumeSkill[];
  categorySummary: SkillCategorySummary[];
  totalUniqueSkills: number;
  generatedAt: string;
  engineVersion: string;
}

export type SkillGapStatus = "MATCHED" | "NOT_DETECTED" | "PARTIAL";

export interface SkillGap {
  skillId: string;
  canonicalName: string;
  displayName: string;
  category: SkillCategory;
  status: SkillGapStatus;
  priority: "HIGH" | "MEDIUM" | "LOW";
  evidenceIds: string[];
  frequency?: number;
}
