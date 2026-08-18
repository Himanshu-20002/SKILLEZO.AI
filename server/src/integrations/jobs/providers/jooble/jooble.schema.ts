import { z } from "zod";

export const joobleJobSchema = z.object({
  title: z.string().default("Untitled Job"),
  location: z.string().nullable().optional().default(""),
  snippet: z.string().nullable().optional().default(""),
  salary: z.union([z.string(), z.number()]).nullable().optional().default(""),
  source: z.string().nullable().optional().default("Jooble"),
  type: z.string().nullable().optional().default("Full-time"),
  link: z.string().nullable().optional().default(""),
  company: z.string().nullable().optional().default("Unknown Company"),
  updated: z.string().nullable().optional().default(""),
  id: z.union([z.string(), z.number()]).transform((val) => String(val)),
});

export const joobleResponseSchema = z.object({
  totalCount: z.number().default(0),
  jobs: z.array(joobleJobSchema).nullable().optional().default([]),
});

export type ValidatedJoobleJob = z.infer<typeof joobleJobSchema>;
export type ValidatedJoobleResponse = z.infer<typeof joobleResponseSchema>;
