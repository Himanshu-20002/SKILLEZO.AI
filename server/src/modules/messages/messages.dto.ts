import { z } from "zod";

export const sendMessageValidator = z.object({
  content: z.string().trim().min(1, "Message content cannot be empty").max(5000, "Message exceeds 5,000 characters"),
  type: z.enum(["text", "interview_invite", "status_change", "system"]).default("text"),
  interviewDetails: z
    .object({
      roundTitle: z.string().trim().min(1, "Round title is required"),
      scheduledAt: z.string().datetime({ message: "Invalid scheduledAt ISO datetime string" }),
      durationMinutes: z.number().int().min(15).max(240).default(45),
      timezone: z.string().optional().default("Asia/Kolkata (IST)"),
      meetingPlatform: z.enum(["google_meet", "zoom", "teams", "phone", "other"]).default("google_meet"),
      meetingLink: z.string().trim().min(1, "Meeting URL or instructions required"),
      interviewerName: z.string().trim().min(1, "Interviewer name is required"),
      instructions: z.string().trim().optional(),
    })
    .optional(),
});

export const scheduleInterviewValidator = z.object({
  roundTitle: z.string().trim().min(2, "Interview round title must be at least 2 characters"),
  scheduledAt: z.string().datetime({ message: "Invalid ISO date format for scheduledAt" }),
  durationMinutes: z.number().int().min(15).max(240).default(45),
  timezone: z.string().optional().default("Asia/Kolkata (IST)"),
  meetingPlatform: z.enum(["google_meet", "zoom", "teams", "phone", "other"]).default("google_meet"),
  meetingLink: z.string().trim().min(5, "Valid meeting link required"),
  interviewerName: z.string().trim().min(2, "Interviewer name required"),
  instructions: z.string().trim().optional(),
  message: z.string().trim().optional(),
});

export const getConversationsQueryValidator = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(50)),
});

export const getMessagesQueryValidator = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50))
    .pipe(z.number().int().positive().max(100)),
});

export type SendMessageDTO = z.infer<typeof sendMessageValidator>;
export type ScheduleInterviewDTO = z.infer<typeof scheduleInterviewValidator>;
export type GetConversationsQueryDTO = z.infer<typeof getConversationsQueryValidator>;
export type GetMessagesQueryDTO = z.infer<typeof getMessagesQueryValidator>;
