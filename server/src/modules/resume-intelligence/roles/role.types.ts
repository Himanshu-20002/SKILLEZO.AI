export const ROLE_ENGINE_VERSION = "1.0.0";

export type SeniorityLevel =
  | "INTERN"
  | "ENTRY"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "STAFF"
  | "PRINCIPAL"
  | "MANAGER";

export interface SeniorityProfile {
  level: SeniorityLevel;
  minYears?: number;
  maxYears?: number;
}

export interface RoleSkillRequirement {
  skillId: string;
  canonicalName: string;
  importance: "REQUIRED" | "PREFERRED";
  category?: string;
}

export interface ExperienceRequirement {
  minYears?: number;
  maxYears?: number;
  category?: string;
  requirementType: "REQUIRED" | "PREFERRED";
  evidenceIds?: string[];
}

export interface EducationRequirement {
  degreeLevel?: "BACHELORS" | "MASTERS" | "DOCTORATE" | "ASSOCIATES" | "ANY_DEGREE";
  fieldOfStudy?: string;
  requirementType: "REQUIRED" | "PREFERRED";
}

export interface CertificationRequirement {
  name: string;
  canonicalId?: string;
  requirementType: "REQUIRED" | "PREFERRED";
}

export interface RoleProfile {
  roleId: string;
  title: string;
  aliases: string[];
  seniority: SeniorityProfile;
  requiredSkills: RoleSkillRequirement[];
  preferredSkills: RoleSkillRequirement[];
  responsibilities: string[];
  experienceRequirements: ExperienceRequirement[];
  education?: EducationRequirement[];
  certifications?: CertificationRequirement[];
  domains?: string[];
  keywords: string[];
  version: string;
}

export interface NormalizedRole {
  roleId: string;
  canonicalTitle: string;
  seniority: SeniorityProfile;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  isFallback: boolean;
}
