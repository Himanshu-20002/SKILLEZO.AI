export interface EmployabilityFactorItemDTO {
  name: string;
  score: number;
  weight: number;
  status: 'available' | 'estimated';
  description: string;
}

export interface EmployabilityActionDTO {
  id: string;
  title: string;
  impactScore: number;
  category: 'Skills' | 'Resume' | 'Projects' | 'Assessments' | 'Profile';
  effort: 'Low' | 'Medium' | 'High';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  actionUrl: string;
}

export interface CareerGpsMilestoneDTO {
  id: string;
  title: string;
  description: string;
  source: 'skill-gap' | 'resume' | 'project' | 'profile';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'not_started' | 'in_progress' | 'completed';
  relatedSkill?: string;
  relatedAxis?: string;
  estimatedWeeks: number;
}

export interface EmployabilityIndexResponseDTO {
  overallScore: number; // 0-100
  tierStatus: 'Top 5%' | 'Top 15%' | 'Top 30%' | 'Developing';
  targetTier: 'Top 5%';
  targetRole: string;
  metrics: {
    technicalReadiness: number;
    resumeStrength: number;
    projectStrength: number;
    skillAlignment: number;
    recruiterVisibility: number;
  };
  factors: {
    technicalReadiness: EmployabilityFactorItemDTO;
    resumeStrength: EmployabilityFactorItemDTO;
    projectStrength: EmployabilityFactorItemDTO;
    skillAlignment: EmployabilityFactorItemDTO;
    recruiterVisibility: EmployabilityFactorItemDTO;
  };
  strengths: string[];
  improvementAreas: string[];
  actionList: EmployabilityActionDTO[];
  careerGps: {
    ready: boolean;
    milestones: CareerGpsMilestoneDTO[];
  };
}

export interface CareerGpsResponseDTO {
  targetRole: string;
  overallScore: number;
  ready: boolean;
  totalEstimatedWeeks: number;
  milestones: CareerGpsMilestoneDTO[];
}
