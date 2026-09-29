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
  confidence: z.number().min(0).max(1).optional().nullable(),
  verified: z.boolean(),
  sectionId: z.string().optional(),
  itemId: z.string().optional(),
  sourceDocumentId: z.string().optional(),
  createdAt: z.string(),
});

export const ResumeLinkSchema = z.object({
  label: z.enum(["LinkedIn", "GitHub", "Portfolio", "Website", "Twitter", "Other"]),
  url: z.string().url("Valid URL required"),
});

export const ResumeContactSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  links: z.array(ResumeLinkSchema).default([]),
});

export const ResumeSummarySchema = z.object({
  text: z.string().default(""),
  targetRole: z.string().optional().nullable(),
  yearsOfExperience: z.number().min(0).optional().nullable(),
});

export const ResumeSkillCategorySchema = z.preprocess((val: any) => {
  if (typeof val === "string") {
    const upper = val.trim().toUpperCase().replace(/[\s-]+/g, "_");
    const valid = [
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
    ];
    if (valid.includes(upper)) return upper;
    if (upper === "TOOL" || upper === "TECHNOLOGY" || upper === "SKILL") return "TOOLS";
    if (upper.includes("FRONT") || upper.includes("REACT") || upper.includes("UI")) return "FRONTEND";
    if (upper.includes("BACK") || upper.includes("NODE") || upper.includes("API")) return "BACKEND";
    if (upper.includes("DATA") || upper.includes("SQL") || upper.includes("MONGO")) return "DATABASE";
    if (upper.includes("CLOUD") || upper.includes("AWS") || upper.includes("AZURE") || upper.includes("GCP")) return "CLOUD";
    if (upper.includes("DEV") || upper.includes("OPS") || upper.includes("CI") || upper.includes("DOCKER")) return "DEVOPS";
    if (upper.includes("LANG") || upper.includes("PROGRAMMING") || upper.includes("PYTHON") || upper.includes("JAVA")) return "LANGUAGE";
    if (upper.includes("TEST") || upper.includes("QA")) return "TESTING";
    if (upper.includes("MOBILE") || upper.includes("IOS") || upper.includes("ANDROID")) return "MOBILE";
    if (upper.includes("AI") || upper.includes("ML") || upper.includes("LEARN")) return "AI_ML";
    if (upper.includes("TOOL") || upper.includes("TECH")) return "TOOLS";
  }
  return "OTHER";
}, z.enum([
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
]));

export const ResumeSkillItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: ResumeSkillCategorySchema.default("OTHER"),
  proficiency: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]).optional().nullable(),
  evidenceIds: z.array(z.string()).default([]),
});

export const ResumeExperienceBulletSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  verbs: z.array(z.string()).optional().nullable().default([]),
  metrics: z.array(z.string()).optional().nullable().default([]),
  evidenceIds: z.array(z.string()).default([]),
});

export const ResumeExperienceItemSchema = z.object({
  id: z.string().min(1),
  companyName: z.string().optional().nullable(),
  jobTitle: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrent: z.boolean().default(false),
  bullets: z.array(ResumeExperienceBulletSchema).default([]),
  technologiesUsed: z.array(z.string()).optional().nullable().default([]),
});

export const ResumeProjectItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  technologies: z.array(z.string()).default([]),
  link: z.string().url().optional().nullable().or(z.literal("")),
  repoUrl: z.string().url().optional().nullable().or(z.literal("")),
  bullets: z.array(z.string()).default([]),
});

export const ResumeEducationItemSchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  degree: z.string().optional().nullable(),
  fieldOfStudy: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  gradeOrGpa: z.string().optional().nullable(),
  honors: z.array(z.string()).optional().nullable().default([]),
});

export const ResumeAchievementItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  issuer: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
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

  targetRole: z.string().optional().nullable(),
  targetJobDescription: z.string().optional().nullable(),

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
