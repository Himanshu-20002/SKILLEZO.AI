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

export const SubmitQuizRequestSchema = z.object({
  selectedAnswers: z.record(z.string(), z.number()),
  timeSpentSeconds: z.number().optional().default(0),
});

export type SubmitQuizRequestDTO = z.infer<typeof SubmitQuizRequestSchema>;

export interface SubmitQuizResultItemDTO {
  questionId: string;
  question: string;
  codeSnippet?: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface SubmitQuizResponseDTO {
  resourceId: string;
  resourceTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  timeSpentSeconds?: number;
  attemptedAt: string;
  results: SubmitQuizResultItemDTO[];
}

export interface PracticeDrillSummaryDTO {
  id: string;
  title: string;
  slug: string;
  category: string;
  skills: string[];
  difficulty: LearningDifficultyType;
  estimatedMinutes: number;
  questionsCount: number;
  type: ResourceType;
  hasQuestions: boolean;
  userPassed?: boolean;
  bestScore?: number;
  source: string;
}

export const GenerateBlitzSchema = z.object({
  skill: z.string().min(1, "Skill name is required"),
  category: z.string().optional().default("Technical"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
});

export type GenerateBlitzDTO = z.infer<typeof GenerateBlitzSchema>;

export interface ClaimVerificationResponseDTO {
  success: boolean;
  skillName: string;
  category: string;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  score: number;
  credentialHash: string;
  issueDate: string;
  employabilityIndex?: {
    overallScore: number;
    technicalReadinessScore: number;
  } | null;
  message: string;
}

export interface LearningResourceDetailDTO {
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
  markdown?: string;
  completed: boolean;
  source: string;
  reviewStatus: string;
  updatedAt: string;
}

export const CreateTrackSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(2).optional(),
  category: z.enum(["Frontend", "Backend", "Database", "Cloud", "DevOps", "System Design", "AI/ML"]),
  description: z.string().min(5, "Description must be at least 5 characters"),
  targetRoles: z.array(z.string()).min(1, "At least one target role is required"),
  targetSkills: z.array(z.string()).min(1, "At least one target skill is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedMinutes: z.number().int().positive().default(60),
  iconName: z.string().default("BookOpen"),
  accentColor: z.string().default("#3D5AFE"),
  published: z.boolean().default(true),
  finalAssessmentTopicId: z.string().optional().nullable(),
});
export type CreateTrackDTO = z.infer<typeof CreateTrackSchema>;

export const UpdateTrackSchema = CreateTrackSchema.partial();
export type UpdateTrackDTO = z.infer<typeof UpdateTrackSchema>;

export const CreateModuleSchema = z.object({
  title: z.string().min(2, "Module title is required"),
  description: z.string().optional().default(""),
});
export type CreateModuleDTO = z.infer<typeof CreateModuleSchema>;

export const CreateResourceSchema = z.object({
  title: z.string().min(2, "Lesson title is required"),
  type: z.enum(["lesson", "external_doc", "external_video", "pdf_document", "quiz", "code_drill"]).default("lesson"),
  category: z.string().min(2, "Category is required"),
  skills: z.array(z.string()).default([]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  estimatedMinutes: z.number().int().positive().default(15),
  provider: z.string().optional().default("SKILLEZO Engineering"),
  markdown: z.string().optional().default(""),
  externalUrl: z.string().regex(/^https?:\/\/.+/, "External URL must be a valid http or https URL").optional().or(z.literal("")),
});
export type CreateResourceDTO = z.infer<typeof CreateResourceSchema>;

export const UpdateResourceSchema = CreateResourceSchema.partial();
export type UpdateResourceDTO = z.infer<typeof UpdateResourceSchema>;

