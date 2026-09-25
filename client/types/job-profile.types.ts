export type JobRequirementCategory =
  | "SKILL"
  | "TECHNOLOGY"
  | "TOOL"
  | "DOMAIN"
  | "QUALIFICATION"
  | "EDUCATION"
  | "EXPERIENCE";

export type JobRequirementImportance = "REQUIRED" | "PREFERRED" | "UNKNOWN";

export type JobSeniority =
  | "INTERN"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "PRINCIPAL"
  | "EXECUTIVE"
  | "UNKNOWN";

export type JobAnalysisStatus = "PENDING" | "ANALYZED" | "FAILED";

export interface JobRequirementItem {
  name: string;
  normalizedName: string;
  category: JobRequirementCategory;
  importance: JobRequirementImportance;
  evidence: {
    text: string;
    section?: string | null;
  };
  confidence: number;
}

export interface JobProfileAnalysis {
  normalizedRoleTitle?: string | null;
  seniority: JobSeniority;
  responsibilities: string[];
  requirements: JobRequirementItem[];
  experienceRequirements: string[];
  educationRequirements: string[];
  domain?: string | null;
  location?: string | null;
  employmentType?: string | null;
  keywords: string[];
}

export interface JobProfileAnalysisMetadata {
  source: "AI" | "MOCK" | "DETERMINISTIC";
  provider: string;
  model?: string | null;
  analyzedAt: string;
}

export interface JobProfileAnalysisError {
  code: string;
  occurredAt: string;
}

export interface JobProfile {
  id: string;
  userId: string;
  displayName: string;
  jobTitle: string;
  company?: string | null;
  jobUrl?: string | null;
  rawDescription: string;
  normalizedDescription: string;
  sourceHash: string;
  jobFingerprint: string;
  analysis?: JobProfileAnalysis | null;
  analysisStatus: JobAnalysisStatus;
  analysisVersion: number;
  analysisMetadata?: JobProfileAnalysisMetadata | null;
  analysisError?: JobProfileAnalysisError | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobProfileDTO {
  jobTitle: string;
  company?: string | null;
  jobUrl?: string | null;
  rawDescription: string;
}
