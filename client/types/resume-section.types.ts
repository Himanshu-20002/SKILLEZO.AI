/**
 * SKILLEZO RESUME STUDIO — CLIENT DATA ARCHITECTURE
 * Phase 2: Resume Section Engine Types
 */

import {
  ResumeSkillItem,
} from "./resume-document";

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
  isShort: boolean;
  isLong: boolean;
  isOptimalLength: boolean;
}

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
  shortBulletsCount: number;
  longBulletsCount: number;
  hasCurrentRole: boolean;
  averageBulletsPerRole: number;
}

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
  overallCompletenessAverage: number;
  totalStrengthsCount: number;
  totalWeaknessesCount: number;
  totalMissingFieldsCount: number;
  totalWarningsCount: number;
  totalEvidenceTracked: number;
}

export interface ResumeSectionAnalysisResult {
  resumeId: string;
  analyzedAt: string;
  engineVersion: string;
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
