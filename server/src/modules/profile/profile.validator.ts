import { z } from "zod";
import { objectIdSchema } from "@/core/validators/common.validators";
import { SkillSource, EmploymentType } from "@/core/constants/enums";

export const profileSkillSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required"),
  category: z.string().trim().optional().default("Technical"),
  level: z.number().int().min(1).max(5).optional().default(4),
  proficiency: z.string().trim().optional().default("Advanced"),
  score: z.number().min(0).max(100).optional().default(85),
  source: z.nativeEnum(SkillSource).optional().default(SkillSource.PROFILE),
  verified: z.boolean().optional().default(false),
});

export const profileEducationSchema = z.object({
  institution: z.string().trim().min(1, "Institution name is required"),
  degree: z.string().trim().nullable().optional(),
  fieldOfStudy: z.string().trim().nullable().optional(),
  startYear: z.number().int().min(1900).max(2100).nullable().optional(),
  endYear: z.number().int().min(1900).max(2100).nullable().optional(),
});

export const profileExperienceSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required"),
  jobTitle: z.string().trim().min(1, "Job title is required"),
  employmentType: z.nativeEnum(EmploymentType).nullable().optional(),
  startDate: z.coerce.date().nullable().optional(),
  endDate: z.coerce.date().nullable().optional(),
  isCurrent: z.boolean().optional().default(false),
  description: z.string().trim().nullable().optional(),
});

export const profileLinksSchema = z.object({
  github: z.string().trim().url("Invalid GitHub URL").nullable().optional().or(z.literal("")),
  linkedin: z.string().trim().url("Invalid LinkedIn URL").nullable().optional().or(z.literal("")),
  portfolio: z.string().trim().url("Invalid Portfolio URL").nullable().optional().or(z.literal("")),
});

export const profileLocationSchema = z.object({
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
});

export const createProfileValidator = z.object({
  headline: z.string().trim().max(300).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  targetRole: z.string().trim().max(100).nullable().optional(),
  targetRoleId: objectIdSchema.nullable().optional(),
  bio: z.string().trim().max(2000, "Bio cannot exceed 2000 characters").nullable().optional(),
  skills: z.array(profileSkillSchema).optional().default([]),
  education: z.array(profileEducationSchema).optional().default([]),
  experience: z.array(profileExperienceSchema).optional().default([]),
  links: profileLinksSchema.nullable().optional(),
  location: profileLocationSchema.nullable().optional(),
});

export const updateProfileValidator = createProfileValidator.partial();

export const addSkillValidator = profileSkillSchema;

export const updateSkillsValidator = z.object({
  skills: z.array(profileSkillSchema),
});

export const updateEducationValidator = z.object({
  education: z.array(profileEducationSchema),
});

export const updateExperienceValidator = z.object({
  experience: z.array(profileExperienceSchema),
});

export const updateLinksValidator = z.object({
  links: profileLinksSchema,
});

export const updateTargetRoleValidator = z.object({
  targetRoleId: objectIdSchema.nullable(),
});
