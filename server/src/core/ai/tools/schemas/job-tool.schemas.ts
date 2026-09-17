import { z } from "zod";

export const GetMatchingJobsInputSchema = z
  .object({
    targetRole: z.string().trim().max(200).optional(),
    location: z.string().trim().max(200).optional(),
    limit: z.number().int().min(1).max(20).default(5),
  })
  .strict();

export type GetMatchingJobsInput = z.infer<typeof GetMatchingJobsInputSchema>;

export const MatchingJobItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  companyName: z.string(),
  location: z.string().optional(),
  workplaceType: z.string().optional(),
  type: z.string().optional(),
  requiredSkills: z.array(z.string()),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  sourceUrl: z.string().optional(),
});

export const GetMatchingJobsOutputSchema = z.object({
  totalMatches: z.number().min(0),
  limit: z.number().min(1).max(20),
  jobs: z.array(MatchingJobItemSchema),
});

export type GetMatchingJobsOutput = z.infer<typeof GetMatchingJobsOutputSchema>;
