import { z } from "zod";

export const GetCandidateProfileInputSchema = z.object({}).strict();

export type GetCandidateProfileInput = z.infer<typeof GetCandidateProfileInputSchema>;

export const ProfileSkillItemSchema = z.object({
  name: z.string(),
  category: z.string().nullable().optional(),
  level: z.number().optional(),
  proficiency: z.string().nullable().optional(),
  verified: z.boolean().default(false),
});

export const ProfileProjectItemSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  techStack: z.array(z.string()).optional(),
  link: z.string().nullable().optional(),
});

export const ProfileEducationItemSchema = z.object({
  institution: z.string(),
  degree: z.string().nullable().optional(),
  fieldOfStudy: z.string().nullable().optional(),
  startYear: z.number().nullable().optional(),
  endYear: z.number().nullable().optional(),
});

export const ProfileExperienceItemSchema = z.object({
  companyName: z.string(),
  jobTitle: z.string(),
  description: z.string().nullable().optional(),
  isCurrent: z.boolean().optional(),
});

export const GetCandidateProfileOutputSchema = z.object({
  candidateId: z.string(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  targetRole: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(ProfileSkillItemSchema),
  projects: z.array(ProfileProjectItemSchema),
  education: z.array(ProfileEducationItemSchema),
  experience: z.array(ProfileExperienceItemSchema),
  completionPercentage: z.number().min(0).max(100),
});

export type GetCandidateProfileOutput = z.infer<typeof GetCandidateProfileOutputSchema>;
