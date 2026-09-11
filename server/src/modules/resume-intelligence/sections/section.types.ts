/**
 * SKILLEZO RESUME STUDIO — PHASE 2 SECTION INTELLIGENCE
 * Canonical Section Analysis Contract
 */

import {
  ResumeContact,
  ResumeSummary,
  ResumeSkillItem,
  ResumeExperienceItem,
  ResumeProjectItem,
  ResumeEducationItem,
  ResumeAchievementItem,
} from "../document/resume-document.types";

export type SectionId =
  | "contact"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "achievements";

export type SectionStatus = "COMPLETE" | "PARTIAL" | "MISSING" | "INVALID";

export interface BaseSectionAnalysis<TSignals = Record<string, any>> {
  sectionId: SectionId;
  title: string;
  status: SectionStatus;
  completeness: number; // 0.0 to 1.0 ratio
  itemCount: number;
  strengths: string[];
  weaknesses: string[];
  missing: string[];
  warnings: string[];
  evidenceIds: string[];
  signals: TSignals;
}

// 1. Contact Signals
export interface ContactSignals {
  hasFullName: boolean;
  hasEmail: boolean;
  hasValidEmail: boolean;
  hasPhone: boolean;
  hasLocation: boolean;
  hasLinkedIn: boolean;
  hasGitHub: boolean;
  hasPortfolio: boolean;
  hasTwitter: boolean;
  hasProfessionalLinks: boolean;
  linksCount: number;
  duplicateLinksCount: number;
  isMinimal: boolean;
}

// 2. Summary Signals
export interface SummarySignals {
  hasSummary: boolean;
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  hasYearsOfExperience: boolean;
  yearsOfExperience?: number;
  hasTargetRole: boolean;
  targetRole?: string;
  containsFirstPersonLanguage: boolean;
  firstPersonPronouns: string[];
  isShort: boolean; // < 20 words
  isLong: boolean;  // > 120 words
  isOptimalLength: boolean; // 25-100 words
}

// 3. Skills Signals
export interface SkillsSignals {
  hasSkills: boolean;
  skillCount: number;
  categoryDistribution: Record<ResumeSkillItem["category"], number>;
  categoryCount: number;
  categorizedCount: number;
  uncategorizedCount: number;
  duplicateCount: number;
  topCategories: Array<{ category: ResumeSkillItem["category"]; count: number }>;
}

// 4. Experience Signals
export interface ExperienceSignals {
  experienceCount: number;
  totalBulletsCount: number;
  entriesWithCompany: number;
  entriesWithTitle: number;
  entriesWithDates: number;
  entriesWithBullets: number;
  entriesWithMetrics: number;
  totalMetricsCount: number;
  totalVerbsCount: number;
  entriesMissingDates: number;
  entriesMissingCompany: number;
  entriesMissingTitle: number;
  entriesWithoutBullets: number;
  shortBulletsCount: number; // < 6 words
  longBulletsCount: number;  // > 45 words
  hasCurrentRole: boolean;
  averageBulletsPerRole: number;
}

// 5. Projects Signals
export interface ProjectsSignals {
  projectCount: number;
  projectsWithDescription: number;
  projectsWithTechnologies: number;
  projectsWithBullets: number;
  projectsWithLink: number;
  projectsWithRepoUrl: number;
  totalTechnologiesCount: number;
  uniqueTechnologiesCount: number;
  projectsMissingTitle: number;
  projectsMissingDescription: number;
  projectsMissingTechnologies: number;
  totalBulletsCount: number;
}

// 6. Education Signals
export interface EducationSignals {
  educationCount: number;
  entriesWithDegree: number;
  entriesWithInstitution: number;
  entriesWithField: number;
  entriesWithDates: number;
  entriesWithGPA: number;
  gpaPresent: boolean;
  entriesWithHonors: number;
  missingInstitutionCount: number;
  missingDegreeCount: number;
  missingDatesCount: number;
}

// 7. Achievements Signals
export interface AchievementsSignals {
  achievementCount: number;
  entriesWithIssuer: number;
  entriesWithDate: number;
  entriesWithDescription: number;
  entriesWithUrl: number;
  emptyEntriesCount: number;
}

export type ContactSectionAnalysis = BaseSectionAnalysis<ContactSignals>;
export type SummarySectionAnalysis = BaseSectionAnalysis<SummarySignals>;
export type SkillsSectionAnalysis = BaseSectionAnalysis<SkillsSignals>;
export type ExperienceSectionAnalysis = BaseSectionAnalysis<ExperienceSignals>;
export type ProjectsSectionAnalysis = BaseSectionAnalysis<ProjectsSignals>;
export type EducationSectionAnalysis = BaseSectionAnalysis<EducationSignals>;
export type AchievementsSectionAnalysis = BaseSectionAnalysis<AchievementsSignals>;

export interface SectionAnalysisSummaryStats {
  totalSectionsAnalyzed: number;
  completeSectionsCount: number;
  partialSectionsCount: number;
  missingSectionsCount: number;
  invalidSectionsCount: number;
  overallCompletenessAverage: number; // 0.0 to 1.0
  totalStrengthsCount: number;
  totalWeaknessesCount: number;
  totalMissingFieldsCount: number;
  totalWarningsCount: number;
  totalEvidenceTracked: number;
}

/**
 * Master Section Analysis Output Contract
 * Immutable derived evaluation of ResumeDocument
 */
export interface ResumeSectionAnalysisResult {
  resumeId: string;
  analyzedAt: string;
  engineVersion: string; // "section-engine-v1"
  sections: {
    contact: ContactSectionAnalysis;
    summary: SummarySectionAnalysis;
    skills: SkillsSectionAnalysis;
    experience: ExperienceSectionAnalysis;
    projects: ProjectsSectionAnalysis;
    education: EducationSectionAnalysis;
    achievements: AchievementsSectionAnalysis;
  };
  summaryStats: SectionAnalysisSummaryStats;
}
