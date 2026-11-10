import { z } from "zod";
import mongoose from "mongoose";
import {
  InterviewMode,
  InterviewType,
  InterviewDifficulty,
  InterviewSessionStatus,
  VALID_EXPERIENCE_LEVELS,
} from "../domain/interview.enums";

export const objectIdParamSchema = z
  .string()
  .trim()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format: must be a valid 24-character hexadecimal ObjectId.",
  });

export const sessionParamSchema = z.object({
  sessionId: objectIdParamSchema,
});

export const listSessionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .nativeEnum(InterviewSessionStatus)
    .optional(),
});

export const createSessionInputSchema = z.object({
  role: z
    .string()
    .trim()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be at most 100 characters"),
  experienceLevel: z
    .string()
    .trim()
    .min(2, "Experience level is required")
    .max(50, "Experience level must not exceed 50 characters")
    .refine(
      (val) =>
        (VALID_EXPERIENCE_LEVELS as readonly string[]).includes(val.toLowerCase()) ||
        val.length >= 2,
      {
        message: "Experience level must be a valid career tier (e.g. entry, junior, mid, senior, lead).",
      }
    ),
  interviewType: z.nativeEnum(InterviewType, {
    message: "Interview type must be one of: technical, hr, behavioral, managerial.",
  }),
  difficulty: z.nativeEnum(InterviewDifficulty, {
    message: "Difficulty must be one of: easy, medium, hard.",
  }),
  mode: z.nativeEnum(InterviewMode, {
    message: "Mode must be either 'text' or 'voice'.",
  }),
  durationMinutes: z
    .number()
    .int("Duration must be an integer")
    .min(10, "Minimum session duration is 10 minutes")
    .max(90, "Maximum session duration is 90 minutes")
    .default(30),
  totalQuestions: z
    .number()
    .int("Total questions must be an integer")
    .min(3, "Session must contain at least 3 questions")
    .max(20, "Session cannot exceed 20 questions")
    .default(5),
  templateId: z
    .string()
    .trim()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Template ID must be a valid ObjectId",
    })
    .optional(),
  resumeId: z
    .string()
    .trim()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Resume ID must be a valid ObjectId",
    })
    .optional(),
  jobId: z
    .string()
    .trim()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: "Job ID must be a valid ObjectId",
    })
    .optional(),
});

export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type ListSessionsQuery = z.infer<typeof listSessionsQuerySchema>;
