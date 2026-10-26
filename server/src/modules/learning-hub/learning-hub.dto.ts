import { z } from "zod";
import { ResourceType } from "@/database/models/LearningResource.model";
import { LearningDifficultyType } from "@/database/models/LearningTrack.model";

export const CatalogQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  search: z.string().optional(),
});

export type CatalogQueryDTO = z.infer<typeof CatalogQuerySchema>;

export interface ResourceSummaryDTO {
  id: string;
  title: string;
  slug: string;
  type: ResourceType;
  category: string;
  skills: string[];
  difficulty: LearningDifficultyType;
  estimatedMinutes: number;
  provider?: string;
  externalUrl?: string;
  completed: boolean;
}

export interface TrackModuleDTO {
  id: string;
  title: string;
  description?: string;
  order: number;
  resources: ResourceSummaryDTO[];
}

export interface TrackCatalogItemDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  targetRoles: string[];
  targetSkills: string[];
  difficulty: string;
  estimatedMinutes: number;
  iconName: string;
  accentColor: string;
  totalModules: number;
  totalResources: number;
  enrollmentCount: number;
  enrolled: boolean;
  progressPercent: number;
  completedResourcesCount: number;
  finalAssessmentTopicId?: string | null;
}

export interface TrackDetailDTO extends TrackCatalogItemDTO {
  modules: TrackModuleDTO[];
}

export interface PersonalizedTrackRecommendationDTO {
  targetRole: string;
  missingSkillsCovered: string[];
  recommendedTracks: TrackCatalogItemDTO[];
}

export interface UserLearningStatsDTO {
  enrolledTracksCount: number;
  completedResourcesCount: number;
  totalLearningMinutes: number;
  inProgressTrack?: TrackCatalogItemDTO | null;
}

export const GenerateDrillSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
  category: z.string().optional().default("Technical"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
});

export type GenerateDrillDTO = z.infer<typeof GenerateDrillSchema>;

export const UploadPdfMetadataSchema = z.object({
  title: z.string().min(2, "Title is required"),
  category: z.string().min(2, "Category is required"),
  skills: z.union([z.string(), z.array(z.string())]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
});

