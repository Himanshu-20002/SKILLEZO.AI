import { z } from "zod";

export const ResumeEvidenceSourceSchema = z.enum(["USER", "PARSED", "IMPORTED", "CONFIRMED"]);

export const ResumeEvidenceTypeSchema = z.enum([
  "SKILL",
  "METRIC",
  "EMPLOYER",
  "TITLE",
  "DEGREE",
  "INSTITUTION",
  "DATE",
  "CERTIFICATION",
  "LINK",
  "PROJECT_CLAIM",
]);

export const ResumeEvidenceSchema = z.object({
  id: z.string().min(1),
  type: ResumeEvidenceTypeSchema,
  source: ResumeEvidenceSourceSchema,
  value: z.string().min(1),
  confidence: z.number().min(0).max(1),
  verified: z.boolean(),
  sectionId: z.string().optional(),
  itemId: z.string().optional(),
  createdAt: z.string(),
});

export const ResumeLinkSchema = z.object({
  label: z.enum(["LinkedIn", "GitHub", "Portfolio", "Website", "Twitter", "Other"]),
  url: z.string().url("Valid URL required"),
});

export const ResumeContactSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  location: z.string().optional(),
  links: z.array(ResumeLinkSchema).default([]),
});

export const ResumeSummarySchema = z.object({
  text: z.string().default(""),
  targetRole: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

export const ResumeSkillItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    "FRONTEND",
    "BACKEND",
    "DATABASE",
    "CLOUD",
    "DEVOPS",
    "LANGUAGE",
    "TESTING",
    "MOBILE",
    "AI_ML",
    "TOOLS",
    "OTHER",
  ]),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional(),
  evidenceIds: z.array(z.string()).default([]),
});

export const ResumeExperienceBulletSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  verbs: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
  evidenceIds: z.array(z.string()).default([]),
});

export const ResumeExperienceItemSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().default(false),
  bullets: z.array(ResumeExperienceBulletSchema).default([]),
  technologiesUsed: z.array(z.string()).optional(),
});

export const ResumeProjectItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  link: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  bullets: z.array(z.string()).default([]),
});

export const ResumeEducationItemSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gradeOrGpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
});

export const ResumeAchievementItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
});

export const ResumeTemplateConfigSchema = z.object({
  templateId: z.enum(["classic", "modern", "minimal", "engineering", "executive"]).default("modern"),
  primaryColor: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.enum(["compact", "regular", "spacious"]).default("regular"),
  margins: z.enum(["narrow", "normal", "wide"]).default("normal"),
});

export const ResumeSectionScoreSchema = z.object({
  score: z.number().min(0).max(100),
  status: z.enum(["OPTIMIZED", "NEEDS_REVIEW", "INCOMPLETE"]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  suggestionsCount: z.number().default(0),
});

export const ResumeSectionScoresSchema = z.object({
  contact: ResumeSectionScoreSchema,
  summary: ResumeSectionScoreSchema,
  skills: ResumeSectionScoreSchema,
  experience: ResumeSectionScoreSchema,
  projects: ResumeSectionScoreSchema,
  education: ResumeSectionScoreSchema,
  achievements: ResumeSectionScoreSchema,
});

export const ResumeOverallScoreSchema = z.object({
  overallScore: z.number().min(0).max(100),
  atsReadiness: z.number().min(0).max(100),
  jobMatch: z.number().min(0).max(100),
  contentQuality: z.number().min(0).max(100),
  impactScore: z.number().min(0).max(100),
  calculatedAt: z.string(),
});

export const ResumeVersionMetadataSchema = z.object({
  versionId: z.string().min(1),
  versionNumber: z.number().min(1),
  name: z.string().min(1),
  parentVersionId: z.string().optional(),
  createdAt: z.string(),
  changeSummary: z.string().optional(),
});

export const ResumeDocumentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),

  contact: ResumeContactSchema,
  summary: ResumeSummarySchema,
  skills: z.array(ResumeSkillItemSchema).default([]),
  experience: z.array(ResumeExperienceItemSchema).default([]),
  projects: z.array(ResumeProjectItemSchema).default([]),
  education: z.array(ResumeEducationItemSchema).default([]),
  achievements: z.array(ResumeAchievementItemSchema).default([]),

  evidence: z.array(ResumeEvidenceSchema).default([]),

  targetRole: z.string().optional(),
  targetJobDescription: z.string().optional(),

  templateConfig: ResumeTemplateConfigSchema.default({
    templateId: "modern",
    fontSize: "regular",
    margins: "normal",
  }),

  scores: z
    .object({
      overall: ResumeOverallScoreSchema,
      sections: ResumeSectionScoresSchema,
    })
    .optional(),

  currentVersion: ResumeVersionMetadataSchema,
  versions: z.array(ResumeVersionMetadataSchema).default([]),

  schemaVersion: z.string().default("1.0.0"),
  isMaster: z.boolean().default(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ValidatedResumeDocument = z.infer<typeof ResumeDocumentSchema>;
