export type AIIntent =
  | "PROFILE_OVERVIEW"
  | "RESUME_ANALYSIS"
  | "RESUME_IMPROVEMENT"
  | "SKILL_GAP_ANALYSIS"
  | "EMPLOYABILITY_ANALYSIS"
  | "JOB_MATCHING"
  | "CAREER_READINESS"
  | "CAREER_PLAN"
  | "GENERAL_CAREER_GUIDANCE"
  | "UNKNOWN";

export interface AIOrchestrationRequest {
  message: string;
  targetRole?: string;
  conversationContext?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

export interface AIOrchestrationContext {
  userId: string;
  userRole?: string;
  requestId?: string;
  signal?: AbortSignal;
}

export interface AIOrchestratorTelemetry {
  requestId: string;
  userId: string;
  intent: AIIntent;
  targetRole?: string;
  toolCount: number;
  toolsUsed: string[];
  totalDurationMs: number;
  modelProvider: string;
  success: boolean;
  failureType?: string;
  timestamp: string;
}

import type { AIOrchestrationResult } from "./response/response-types";

export interface IAIOrchestrator {
  orchestrate(
    request: AIOrchestrationRequest,
    context: AIOrchestrationContext
  ): Promise<AIOrchestrationResult>;
  getTelemetry(): AIOrchestratorTelemetry[];
}
