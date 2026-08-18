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

export interface ResumeExtractedData {
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skillsExtracted: string[];
  experienceCount: number;
  educationCount: number;
}

export interface ResumeAnalysisData {
  overallScore: number;
  atsScore: number;
  impactScore: number;
  brevityScore: number;
  extractedData: ResumeExtractedData;
  atsCompatibility: ATSCompatibilityItem[];
  keywords: KeywordMatchItem[];
  missingSkills: MissingSkillItem[];
  recommendations: AIResumeRecommendation[];
}
