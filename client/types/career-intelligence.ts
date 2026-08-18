import { ExtendedUserProfile } from './profile';
import {
  ResumeAnalysisData,
  ATSCompatibilityItem,
  KeywordMatchItem,
  MissingSkillItem,
  AIResumeRecommendation,
} from './resume';

// Module 21 — Skill Gap Analysis Types
export interface CompetencyItem {
  id: string;
  skill: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'System Design';
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  requiredLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  currentNumeric: number; // 0-100
  requiredNumeric: number; // 0-100
  gap: number; // level difference
  priority: 'High' | 'Medium' | 'Low';
  status: 'Matched' | 'Gap';
}

export interface SkillRadarCategory {
  category: string;
  currentScore: number;
  requiredScore: number;
}

export interface SkillGapAnalysisData {
  targetRole: string;
  availableRoles: string[];
  overallMatchScore: number;
  skillsAcquiredCount: number;
  skillsRequiredCount: number;
  skillsMissingCount: number;
  radarCategories: SkillRadarCategory[];
  competencies: CompetencyItem[];
  priorityRecommendations: {
    skill: string;
    currentLevel: string;
    requiredLevel: string;
    priority: 'High' | 'Medium' | 'Low';
    reason: string;
    suggestedAction: string;
  }[];
}

// Module 22 — Employability Index Types
export interface EmployabilityMetric {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface EmployabilityIndexData {
  overallScore: number; // e.g. 78/100
  tierStatus: 'Top 5%' | 'Top 15%' | 'Top 30%' | 'Developing';
  targetTier: 'Top 5%';
  metrics: {
    technicalReadiness: number;
    resumeStrength: number;
    projectStrength: number;
    skillAlignment: number;
    recruiterVisibility: number;
  };
  strengths: string[];
  improvementAreas: string[];
  actionList: {
    id: string;
    action: string;
    priority: 'High' | 'Medium' | 'Low';
    estimatedImpact: string;
  }[];
}

// Module 23 — Career GPS Roadmap Types
export interface RoadmapStage {
  id: string;
  stageNumber: number;
  title: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Locked';
  completionPercentage: number;
  description: string;
  actionText: string;
}

export interface SalaryProgressionItem {
  level: 'Current' | 'Next Target' | 'Target Role';
  label: string;
  salaryText: string; // e.g. ₹6 LPA
  numericSalary: number;
}

export interface CareerGPSData {
  targetRole: string;
  targetSalary: string;
  targetTimeline: string; // e.g. "6 Months"
  currentMilestone: {
    focusTitle: string;
    progressPercentage: number;
    nextAction: string;
  };
  salaryProgression: SalaryProgressionItem[];
  stages: RoadmapStage[];
}

// Unified Master Career Intelligence Data Layer
export interface MasterCareerIntelligence {
  studentProfile: ExtendedUserProfile;
  resumeAnalysis: ResumeAnalysisData;
  skillGapAnalysis: SkillGapAnalysisData;
  employabilityIndex: EmployabilityIndexData;
  careerRoadmap: CareerGPSData;
}
