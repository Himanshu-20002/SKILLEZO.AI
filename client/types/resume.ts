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
  category: 'Formatting' | 'Keywords' | 'Impact Statements' | 'Brevity';
  description: string;
  impactScoreBoost: number;
  actionText: string;
}

export interface ResumeAtsAnalysis {
  resumeId?: string;
  resumeVersion?: number;
  fileName?: string;
  overallScore: number;
  atsScore: number;
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
  atsCompatibility: ATSCompatibilityItem[];
  keywords: KeywordMatchItem[];
  missingKeywords?: MissingSkillItem[];
  missingSkills?: MissingSkillItem[];
  recommendations: AIResumeRecommendation[];
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
  status: "pending" | "processing" | "completed" | "failed" | "uploaded";
  extractedData?: ResumeExtractedData;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

