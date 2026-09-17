import { ModelGateway } from "../../gateway/model-gateway";
import { OrchestrationContext } from "../context/orchestration-context";
import { OrchestrationContextComposer } from "../context/orchestration-context-composer";
import { ORCHESTRATOR_SYSTEM_INSTRUCTION } from "./reasoning-prompt";
import {
  AIOrchestrationResult,
  AIOrchestrationResultSchema,
} from "../response/response-types";

export interface ReasoningOptions {
  requestId?: string;
  signal?: AbortSignal;
}

export class ReasoningService {
  /**
   * Delegates reasoning to Phase 1 Model Gateway with automatic failover, circuit breaker,
   * and strict Zod validation.
   */
  public static async reason(
    context: OrchestrationContext,
    options?: ReasoningOptions
  ): Promise<{ result: AIOrchestrationResult; provider: string; model: string }> {
    const prompt = OrchestrationContextComposer.compose(context);
    const correlationId = options?.requestId || `orch_${Date.now()}`;

    const gateway = ModelGateway.getInstance();

    const response = await gateway.generateStructured<AIOrchestrationResult>(
      {
        prompt,
        systemInstruction: ORCHESTRATOR_SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for high factual alignment
        maxOutputTokens: 2048,
        correlationId,
        signal: options?.signal,
      },
      "AIOrchestrationResultSchema",
      AIOrchestrationResultSchema
    );

    return {
      result: response.data,
      provider: response.provider,
      model: response.model,
    };
  }
}
