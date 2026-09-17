import { z } from "zod";

export interface AIToolContext {
  userId: string;
  userRole?: string;
  requestId?: string;
  signal?: AbortSignal;
}

export interface AIToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AIToolExecutionTelemetry {
  toolName: string;
  requestId?: string;
  userId: string;
  startedAt: Date;
  durationMs: number;
  success: boolean;
  failureType?: string;
}

export interface AITool<TInput = unknown, TOutput = unknown> {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: z.ZodType<TInput>;
  readonly outputSchema: z.ZodType<TOutput>;

  execute(params: TInput, context: AIToolContext): Promise<TOutput>;
}
