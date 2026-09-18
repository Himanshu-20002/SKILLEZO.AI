import { z } from "zod";
import { AIOrchestrationResultSchema } from "../orchestrator/response/response-types";

/**
 * Strict schema for individual conversation context message.
 * Untrusted conversation history is contextual only and never authoritative evidence.
 */
export const ConversationMessageSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z
      .string()
      .trim()
      .min(1, "Message content cannot be empty")
      .max(4000, "Message content cannot exceed 4000 characters"),
  })
  .strict();

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

/**
 * Strict request schema for Career Coach Chat endpoint.
 * Any client-injected identity, evidence, metrics, or unrecognized fields are rejected.
 */
export const CareerCoachRequestSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(4000, "Message cannot exceed 4000 characters"),
    targetRole: z
      .string()
      .trim()
      .min(1, "Target role cannot be empty")
      .max(200, "Target role cannot exceed 200 characters")
      .optional(),
    conversationContext: z
      .array(ConversationMessageSchema)
      .max(20, "Conversation context cannot exceed 20 messages")
      .default([]),
    stream: z.boolean().optional().default(false),
  })
  .strict();

export type CareerCoachRequestBody = z.infer<typeof CareerCoachRequestSchema>;

/**
 * Stable API response envelope schema for Career Coach.
 */
export const CareerCoachResponseEnvelopeSchema = z.object({
  success: z.literal(true),
  requestId: z.string(),
  data: AIOrchestrationResultSchema,
});

export type CareerCoachResponseEnvelope = z.infer<
  typeof CareerCoachResponseEnvelopeSchema
>;
