/**
 * SKILLEZO RESUME STUDIO — CANONICAL DATA ARCHITECTURE
 * Phase 0 Architecture Freeze: Single Source of Truth Contract
 */

export type ResumeEvidenceSource = "USER" | "PARSED" | "IMPORTED" | "CONFIRMED";

export type ResumeEvidenceType =
  | "SKILL"
  | "METRIC"
  | "EMPLOYER"
  | "TITLE"
  | "DEGREE"
  | "INSTITUTION"
  | "DATE"
  | "CERTIFICATION"
  | "LINK"
  | "PROJECT_CLAIM";

export interface ResumeEvidence {
  id: string;
  type: ResumeEvidenceType;
  source: ResumeEvidenceSource;
  value: string;
  confidence: number;
  verified: boolean;
  sectionId?: string;
  itemId?: string;
  createdAt: string;
}

export interface ResumeLink {
  label: "LinkedIn" | "GitHub" | "Portfolio" | "Website" | "Twitter" | "Other";
  url: string;
}

export interface ResumeContact {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  links: ResumeLink[];
}

export interface ResumeSummary {
  text: string;
  targetRole?: string;
  yearsOfExperience?: number;
}

export interface ResumeSkillItem {
  id: string;
  name: string;
  category: "FRONTEND" | "BACKEND" | "DATABASE" | "CLOUD" | "DEVOPS" | "LANGUAGE" | "TESTING" | "MOBILE" | "AI_ML" | "TOOLS" | "OTHER";
  proficiency?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  evidenceIds: string[];
}

export interface ResumeExperienceBullet {
  id: string;
  text: string;
  verbs?: string[];
  metrics?: string[];
  evidenceIds: string[];
}

export interface ResumeExperienceItem {
  id: string;
  companyName: string;
  jobTitle: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  bullets: ResumeExperienceBullet[];
  technologiesUsed?: string[];
}

export interface ResumeProjectItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  technologies: string[];
  link?: string;
  repoUrl?: string;
  bullets: string[];
}

export interface ResumeEducationItem {
  id: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gradeOrGpa?: string;
  honors?: string[];
}

export interface ResumeAchievementItem {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  url?: string;
}

export type ResumeTemplateId = "classic" | "modern" | "minimal" | "engineering" | "executive";

export interface ResumeTemplateConfig {
  templateId: ResumeTemplateId;
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: "compact" | "regular" | "spacious";
  margins?: "narrow" | "normal" | "wide";
}

export interface ResumeSectionScore {
  score: number; // 0 - 100
  status: "OPTIMIZED" | "NEEDS_REVIEW" | "INCOMPLETE";
  strengths: string[];
  weaknesses: string[];
  suggestionsCount: number;
}

export interface ResumeSectionScores {
  contact: ResumeSectionScore;
  summary: ResumeSectionScore;
  skills: ResumeSectionScore;
  experience: ResumeSectionScore;
  projects: ResumeSectionScore;
  education: ResumeSectionScore;
  achievements: ResumeSectionScore;
}

export interface ResumeOverallScore {
  overallScore: number;
  atsReadiness: number;
  jobMatch: number;
  contentQuality: number;
  impactScore: number;
  calculatedAt: string;
}

export interface ResumeVersionMetadata {
  versionId: string;
  versionNumber: number;
  name: string;
  parentVersionId?: string;
  createdAt: string;
  changeSummary?: string;
}

/**
 * CANONICAL RESUME DOCUMENT
 * Single Source of Truth for Skillezo Resume Studio
 */
export interface ResumeDocument {
  id: string;
  userId: string;
  title: string;

  // 7 Canonical Sections
  contact: ResumeContact;
  summary: ResumeSummary;
  skills: ResumeSkillItem[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  education: ResumeEducationItem[];
  achievements: ResumeAchievementItem[];

  // Fact & Provenance Ledger
  evidence: ResumeEvidence[];

  // Target Context
  targetRole?: string;
  targetJobDescription?: string;

  // Visual Configuration
  templateConfig: ResumeTemplateConfig;

  // Deterministic Scores
  scores?: {
    overall: ResumeOverallScore;
    sections: ResumeSectionScores;
  };

  // Version Control
  currentVersion: ResumeVersionMetadata;
  versions?: ResumeVersionMetadata[];

  // System Metadata
  schemaVersion: string; // "1.0.0"
  isMaster: boolean;
  createdAt: string;
  updatedAt: string;
}
