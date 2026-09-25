import { z } from "zod";
import {
  IJobProfile,
  IJobRequirementItem,
  IJobProfileAnalysis,
  JobRequirementCategory,
  JobRequirementImportance,
  JobSeniority,
  JobAnalysisStatus,
} from "@/database/models/JobProfile.model";

export const JobRequirementCategorySchema = z.preprocess((val: any) => {
  if (typeof val === "string") {
    const upper = val.trim().toUpperCase();
    const valid = [
      "SKILL",
      "TECHNOLOGY",
      "TOOL",
      "DOMAIN",
      "QUALIFICATION",
      "EDUCATION",
      "EXPERIENCE",
    ];
    if (valid.includes(upper)) return upper;
  }
  return "SKILL";
}, z.enum([
  "SKILL",
  "TECHNOLOGY",
  "TOOL",
  "DOMAIN",
  "QUALIFICATION",
  "EDUCATION",
  "EXPERIENCE",
]));

export const JobRequirementImportanceSchema = z.preprocess((val: any) => {
  if (typeof val === "string") {
    const upper = val.trim().toUpperCase();
    if (["REQUIRED", "PREFERRED", "UNKNOWN"].includes(upper)) return upper;
    if (upper.includes("PREFER") || upper.includes("NICE") || upper.includes("BONUS") || upper.includes("PLUS")) return "PREFERRED";
    if (upper.includes("REQ") || upper.includes("MUST")) return "REQUIRED";
  }
  return "REQUIRED";
}, z.enum([
  "REQUIRED",
  "PREFERRED",
  "UNKNOWN",
]));

export const JobSenioritySchema = z.preprocess((val: any) => {
  if (typeof val === "string") {
    const upper = val.trim().toUpperCase();
    if (
      [
        "INTERN",
        "JUNIOR",
        "MID",
        "SENIOR",
        "LEAD",
        "PRINCIPAL",
        "EXECUTIVE",
        "UNKNOWN",
      ].includes(upper)
    ) {
      return upper;
    }
    if (upper.includes("INTERN") || upper.includes("TRAINEE")) return "INTERN";
    if (
      upper.includes("JUNIOR") ||
      upper.includes("ENTRY") ||
      upper.includes("FRESHER") ||
      upper.includes("ASSOCIATE")
    )
      return "JUNIOR";
    if (upper.includes("PRINCIPAL") || upper.includes("ARCHITECT")) return "PRINCIPAL";
    if (upper.includes("LEAD") || upper.includes("STAFF") || upper.includes("HEAD")) return "LEAD";
    if (
      upper.includes("EXEC") ||
      upper.includes("DIRECTOR") ||
      upper.includes("VP") ||
      upper.includes("CHIEF")
    )
      return "EXECUTIVE";
    if (upper.includes("SENIOR") || upper.includes("SR")) return "SENIOR";
    if (upper.includes("MID")) return "MID";
  }
  return "UNKNOWN";
}, z.enum([
  "INTERN",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
  "PRINCIPAL",
  "EXECUTIVE",
  "UNKNOWN",
]));

export const JobRequirementItemSchema = z.preprocess((val: any) => {
  if (typeof val === "string") {
    return { name: val, evidence: { text: val } };
  }
  if (val && typeof val === "object") {
    const name =
      val.name ||
      val.skill ||
      val.requirement ||
      val.title ||
      val.item ||
      val.technology ||
      val.tool ||
      val.description ||
      "Requirement";
    return {
      ...val,
      name,
      evidence: val.evidence || { text: typeof val.description === "string" ? val.description : name },
    };
  }
  return val;
}, z.object({
  name: z.string().default("Requirement"),
  normalizedName: z.string().optional().nullable().default(""),
  category: JobRequirementCategorySchema.default("SKILL"),
  importance: JobRequirementImportanceSchema.default("REQUIRED"),
  evidence: z.union([
    z.object({
      text: z.string().default(""),
      section: z.string().optional().nullable().default(null),
    }),
    z.string().transform((text) => ({ text, section: null })),
  ]).default({ text: "", section: null }),
  confidence: z.number().min(0).max(1).default(1.0),
}));

export const JobAnalysisOutputSchema = z.object({
  normalizedRoleTitle: z.string().optional().nullable(),
  seniority: JobSenioritySchema.default("UNKNOWN"),
  responsibilities: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(z.string())).default([]),
  requirements: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(JobRequirementItemSchema)).default([]),
  experienceRequirements: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(z.string())).default([]),
  educationRequirements: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(z.string())).default([]),
  domain: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  employmentType: z.string().optional().nullable(),
  keywords: z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(z.string())).default([]),
});

export const JobIntakeInputSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(120, "Job title cannot exceed 120 characters"),
  company: z
    .string()
    .trim()
    .max(120, "Company name cannot exceed 120 characters")
    .optional()
    .nullable(),
  jobUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
  rawDescription: z
    .string()
    .trim()
    .min(50, "Job description must be at least 50 characters")
    .max(50000, "Job description cannot exceed 50,000 characters"),
});

export type JobIntakeInput = z.infer<typeof JobIntakeInputSchema>;
export type JobAnalysisOutput = z.infer<typeof JobAnalysisOutputSchema>;

export interface JobProfileDTO {
  id: string;
  userId: string;
  displayName: string;
  jobTitle: string;
  company?: string | null;
  jobUrl?: string | null;
  rawDescription: string;
  normalizedDescription: string;
  sourceHash: string;
  jobFingerprint: string;
  analysis?: IJobProfileAnalysis | null;
  analysisStatus: JobAnalysisStatus;
  analysisVersion: number;
  analysisMetadata?: {
    source: "AI" | "MOCK" | "DETERMINISTIC";
    provider: string;
    model?: string | null;
    analyzedAt: string;
  } | null;
  analysisError?: {
    code: string;
    occurredAt: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function toJobProfileDTO(profile: IJobProfile): JobProfileDTO {
  return {
    id: profile._id.toString(),
    userId: profile.userId,
    displayName: profile.displayName,
    jobTitle: profile.jobTitle,
    company: profile.company || null,
    jobUrl: profile.jobUrl || null,
    rawDescription: profile.rawDescription,
    normalizedDescription: profile.normalizedDescription,
    sourceHash: profile.sourceHash,
    jobFingerprint: profile.jobFingerprint,
    analysis: profile.analysis || null,
    analysisStatus: profile.analysisStatus,
    analysisVersion: profile.analysisVersion,
    analysisMetadata: profile.analysisMetadata
      ? {
          source: profile.analysisMetadata.source,
          provider: profile.analysisMetadata.provider,
          model: profile.analysisMetadata.model || null,
          analyzedAt: profile.analysisMetadata.analyzedAt.toISOString(),
        }
      : null,
    analysisError: profile.analysisError
      ? {
          code: profile.analysisError.code,
          occurredAt: profile.analysisError.occurredAt.toISOString(),
        }
      : null,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}
