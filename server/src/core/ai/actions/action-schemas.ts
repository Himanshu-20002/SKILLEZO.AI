import { z } from "zod";
import { ActionTypeEnum, ActionStatusEnum } from "./action-types";

// Anti-injection helper: recursively checks for MongoDB query/update operators
function hasMongoOperator(obj: unknown): boolean {
  if (!obj || typeof obj !== "object") return false;
  if (Array.isArray(obj)) {
    return obj.some(hasMongoOperator);
  }
  for (const key of Object.keys(obj as Record<string, any>)) {
    if (key.startsWith("$")) return true;
    if (hasMongoOperator((obj as Record<string, any>)[key])) return true;
  }
  return false;
}

export const ActionTypeSchema = z.enum([
  ActionTypeEnum.RESUME_UPDATE,
  ActionTypeEnum.PROFILE_UPDATE,
  ActionTypeEnum.CAREER_PLAN_CREATE,
]);

export const ActionStatusSchema = z.enum([
  ActionStatusEnum.PROPOSED,
  ActionStatusEnum.APPROVED,
  ActionStatusEnum.EXECUTING,
  ActionStatusEnum.COMPLETED,
  ActionStatusEnum.FAILED,
  ActionStatusEnum.REJECTED,
  ActionStatusEnum.EXPIRED,
  ActionStatusEnum.STALE,
]);

export const TargetEntitySchema = z
  .object({
    type: z.enum(["resume", "profile", "career_plan"]),
    id: z.string().min(1, "Target entity ID is required"),
    version: z.number().int().positive().optional(),
  })
  .strict();

export const ActionPreviewSchema = z
  .object({
    before: z.any(),
    after: z.any(),
    diffSummary: z.string().optional(),
  })
  .strict();

// 1. Specific Payload Schemas
export const ResumeUpdatePayloadSchema = z
  .object({
    resumeId: z.string().min(1),
    sectionId: z.enum([
      "contact",
      "summary",
      "skills",
      "experience",
      "projects",
      "education",
      "achievements",
    ]),
    proposed: z.any(),
    baseDocumentVersion: z.number().int().min(1),
  })
  .strict()
  .refine((data) => !hasMongoOperator(data), {
    message: "Raw MongoDB operators are strictly prohibited in action payload",
  });

export const ProfileSkillItemSchema = z
  .object({
    name: z.string().min(1).max(100),
    category: z.string().max(100).optional(),
    level: z.number().min(1).max(5).optional(),
    proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
    score: z.number().min(0).max(100).optional(),
  })
  .strict();

export const ProfileUpdatePayloadSchema = z
  .object({
    changes: z
      .object({
        headline: z.string().max(200).optional(),
        targetRole: z.string().max(100).optional(),
        bio: z.string().max(2000).optional(),
        skills: z.array(ProfileSkillItemSchema).optional(),
        location: z.string().max(100).optional(),
      })
      .strict(),
  })
  .strict()
  .refine((data) => !hasMongoOperator(data), {
    message: "Raw MongoDB operators are strictly prohibited in action payload",
  });

export const CareerPlanCreatePayloadSchema = z
  .object({
    targetRole: z.string().min(1).max(100),
    readinessScore: z.number().min(0).max(100),
    gapsData: z.record(z.string(), z.any()),
  })
  .strict()
  .refine((data) => !hasMongoOperator(data), {
    message: "Raw MongoDB operators are strictly prohibited in action payload",
  });

// 2. Proposal Creation Request Schema
export const CreateActionProposalSchema = z
  .object({
    actionType: ActionTypeSchema,
    title: z.string().min(3).max(200),
    description: z.string().min(5).max(1000),
    rationale: z.string().min(5).max(1000),
    evidenceIds: z.array(z.string()).default([]),
    targetEntity: TargetEntitySchema,
    preview: ActionPreviewSchema,
    payload: z.record(z.string(), z.any()),
    idempotencyKey: z.string().max(128).optional(),
  })
  .strict()
  .refine((data) => !hasMongoOperator(data), {
    message: "Raw MongoDB operators are strictly prohibited in proposal request",
  });

// 3. Proposal Approval Request Schema
export const ApproveActionProposalSchema = z
  .object({
    idempotencyKey: z.string().max(128).optional(),
  })
  .strict();

// 4. Proposal Rejection Request Schema
export const RejectActionProposalSchema = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();
