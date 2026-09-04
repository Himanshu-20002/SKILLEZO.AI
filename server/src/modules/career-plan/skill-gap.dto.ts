export interface CompetencyDTO {
  id: string;
  skill: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'System Design';
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  requiredLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  currentNumeric: number; // 0-100
  requiredNumeric: number; // 0-100
  gap: number; // Numeric gap (0 if matched)
  priority: 'High' | 'Medium' | 'Low';
  status: 'Matched' | 'Gap';
}

export interface SkillRadarCategoryDTO {
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'DevOps' | 'System Design';
  currentScore: number;
  requiredScore: number;
}

export interface PriorityRecommendationDTO {
  skill: string;
  currentLevel: string;
  requiredLevel: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  suggestedAction: string;
}

export interface SkillGapAnalysisResponseDTO {
  targetRole: string;
  availableRoles: string[];
  overallMatchScore: number;
  skillsAcquiredCount: number;
  skillsRequiredCount: number;
  skillsMissingCount: number;
  radarCategories: SkillRadarCategoryDTO[];
  competencies: CompetencyDTO[];
  priorityRecommendations: PriorityRecommendationDTO[];
}
