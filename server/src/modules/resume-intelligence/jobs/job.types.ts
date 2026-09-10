import {
  SeniorityProfile,
  ExperienceRequirement,
  EducationRequirement,
  CertificationRequirement,
} from "../roles/role.types";

export const JD_ENGINE_VERSION = "1.0.0";
export const MAX_JD_LENGTH = 50000;

export type RequirementSource = "ROLE_BENCHMARK" | "JOB_DESCRIPTION";

export interface JobRequirementEvidence {
  evidenceId: string;
  sourceSection:
    | "TITLE"
    | "SUMMARY"
    | "REQUIREMENTS"
    | "RESPONSIBILITIES"
    | "QUALIFICATIONS"
    | "PREFERRED"
    | "OTHER";
  sourceText: string;
  extractionMethod: "EXACT" | "ALIAS" | "SEMANTIC" | "PATTERN";
  confidence: number;
  requirementType: "REQUIRED" | "PREFERRED" | "INFORMATIONAL";
}

export interface JobSkillRequirement {
  skillId: string;
  canonicalName: string;
  requirementType: "REQUIRED" | "PREFERRED";
  confidence: number;
  evidenceIds: string[];
  sources: RequirementSource[];
  category?: string;
}

export interface JobResponsibility {
  text: string;
  evidenceId: string;
  confidence: number;
}

export interface JobRequirementProfile {
  jobId: string;
  title?: string;
  seniority?: SeniorityProfile;
  requiredSkills: JobSkillRequirement[];
  preferredSkills: JobSkillRequirement[];
  responsibilities: JobResponsibility[];
  experienceRequirements: ExperienceRequirement[];
  educationRequirements: EducationRequirement[];
  certificationRequirements: CertificationRequirement[];
  domains: string[];
  keywords: string[];
  evidence: JobRequirementEvidence[];
  sourceHash: string;
  parserVersion: string;
  extractionConfidence: number;
  rawExcerpt?: string;
}
