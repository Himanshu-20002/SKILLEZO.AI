export const ATS_ENGINE_VERSION = "1.1.0";
export const AI_ENGINE_VERSION = "1.0.0";
export const SKILL_ENGINE_VERSION = "1.0.0";
export const ROLE_ENGINE_VERSION = "1.0.0";
export const JD_ENGINE_VERSION = "1.0.0";
export const MATCH_ENGINE_VERSION = "1.0.0";
export const CONTENT_ENGINE_VERSION = "1.0.0";
export const RECOMMENDATION_ENGINE_VERSION = "1.0.0";
export const OPTIMIZATION_ENGINE_VERSION = "1.0.0";

export interface CandidateContext {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface SkillContext {
  name: string;
  category?: string;
  source?: string;
}

export interface ExperienceContext {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface ProjectContext {
  title: string;
  description?: string;
  technologies?: string[];
  link?: string;
}

export interface EducationContext {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
}

export interface CertificationContext {
  name: string;
  issuer?: string;
  issueDate?: string;
}

export interface ResumeEvidence {
  id: string;
  section: "summary" | "experience" | "projects" | "skills" | "education" | "certifications";
  text: string;
  sourceIndex?: number;
  detectedSkills?: string[];
  detectedMetrics?: string[];
  confidence?: number;
}

export interface ResumeAIContext {
  resumeId?: string;
  version?: number;
  resume: {
    candidate: CandidateContext;
    summary?: string;
    skills: SkillContext[];
    experience: ExperienceContext[];
    projects: ProjectContext[];
    education: EducationContext[];
    certifications: CertificationContext[];
  };
  evidence: ResumeEvidence[];
  targetRole?: string;
  roleProfile?: {
    roleId: string;
    title: string;
    seniority: { level: string; minYears?: number; maxYears?: number };
    requiredSkills: Array<{ skillId: string; canonicalName: string; importance: string }>;
    preferredSkills: Array<{ skillId: string; canonicalName: string; importance: string }>;
    keywords: string[];
  };
  jobRequirements?: {
    jobId: string;
    title?: string;
    seniority?: { level: string; minYears?: number; maxYears?: number };
    requiredSkills: Array<{ skillId: string; canonicalName: string; requirementType: string }>;
    preferredSkills: Array<{ skillId: string; canonicalName: string; requirementType: string }>;
    domains: string[];
    keywords: string[];
  };
  matchResult?: {
    overallMatchScore: number;
    requiredCoverage: number;
    preferredCoverage: number;
    experienceMatch: number;
    matchStrengthLabel: string;
    gaps: Array<{ skillName: string; priority: string; status: string }>;
  };
  contentResult?: {
    contentScore: number;
    label: string;
    sections: {
      experience: { score: number; bulletCount: number; strongBulletsCount: number; weakBulletsCount: number };
      projects: { score: number; bulletCount: number; strongBulletsCount: number; weakBulletsCount: number };
      summary: { score: number; bulletCount: number; strongBulletsCount: number; weakBulletsCount: number };
    };
    impactSummary: {
      bulletsAnalyzed: number;
      impactBullets: number;
      metricBackedBullets: number;
      responsibilityFocusedBullets: number;
      vagueBullets: number;
      highEvidenceBullets: number;
    };
    opportunities: Array<{
      type: string;
      bulletIds: string[];
      requirementIds: string[];
    }>;
  };
  recommendationResult?: {
    engineVersion: string;
    summary: { critical: number; high: number; medium: number; low: number };
    topAction?: any;
    recommendations: Array<{
      id: string;
      category: string;
      title: string;
      summary: string;
      priority: string;
      impact: string;
      actionability: string;
      suggestedAction?: string;
    }>;
  };
  skillsProfile?: {
    detected: Array<{
      skillId: string;
      canonicalName: string;
      displayName?: string;
      category: string;
      frequency: number;
      confidence: number;
      evidenceIds: string[];
    }>;
    categories: Array<{
      category: string;
      count: number;
      skills: string[];
    }>;
    matchedTargetSkills: string[];
    notDetectedTargetSkills: string[];
  };
  diagnostics: {
    atsScore: number;
    keywordMatchScore: number;
    impactScore: number;
    structureScore: number;
    brevityScore: number;
    readabilityScore: number;
    missingSkills: string[];
    detectedMetrics: string[];
    weakAreas: string[];
  };
  jobDescription?: {
    rawText: string;
  };
}

export interface AIRecommendation {
  id: string;
  category: "ATS" | "SKILLS" | "EXPERIENCE" | "IMPACT" | "SUMMARY" | "STRUCTURE" | "GENERAL";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  problem: string;
  whyItMatters: string;
  recommendation: string;
  evidenceIds: string[];
  requiresUserInput: boolean;
  suggestedAction?: string;
  impactScoreBoost?: number;
  potentialImpact?: "HIGH" | "MEDIUM" | "LOW";
}

export interface AIBulletRewriteRequest {
  bullet: ResumeEvidence;
  targetRole?: string;
  relevantSkills?: string[];
  diagnostics?: {
    impactScore?: number;
    missingMetrics?: boolean;
  };
}

export interface AIBulletRewriteResponse {
  original: string;
  rewritten: string;
  improvements: string[];
  preservedFacts: string[];
  missingInformation: string[];
  powerVerbs: string[];
  requiresUserVerification: boolean;
}

export interface AIAnalysisOutput {
  engineVersion: string;
  targetRole: string;
  targetRoleFitScore: number;
  executiveSummaryCritique: string;
  recommendations: AIRecommendation[];
  bulletCritiques: AIBulletRewriteResponse[];
  missingSkillsNiche: Array<{
    skill: string;
    category: string;
    priority: "High" | "Medium";
    impactLevel: "High" | "Medium";
    recommendation: string;
  }>;
  createdAt: string;
}
