import { z } from "zod";

export const ingestJobsValidator = z.object({
  provider: z.string().trim().optional().default("jooble"),
  keywords: z.string().trim().optional().default("software engineer"),
  location: z.string().trim().optional().default("Delhi"),
  radius: z.string().trim().optional().default("40"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
