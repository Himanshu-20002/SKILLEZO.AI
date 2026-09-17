import { performance } from "perf_hooks";
import {
  AITool,
  AIToolContext,
  AIToolDefinition,
  AIToolExecutionTelemetry,
} from "./types";
import {
  AIToolNotFoundError,
  AIToolValidationError,
  AIToolOwnershipError,
  AIToolOutputValidationError,
  AIToolTimeoutError,
  AIToolRegistryError,
} from "./tool-errors";

export class ToolRegistry {
  private readonly tools = new Map<string, AITool>();
  private static readonly MAX_TELEMETRY_ENTRIES = 100;
  private readonly telemetryRingBuffer: AIToolExecutionTelemetry[] = [];

  /**
   * Registers a strongly-typed tool in the allowlisted registry.
   * Rejects duplicate registrations to guarantee a single authoritative tool definition.
   */
  public register(tool: AITool): void {
    if (!tool || !tool.name || typeof tool.name !== "string") {
      throw new AIToolRegistryError("Tool must have a valid non-empty name.");
    }

    if (this.tools.has(tool.name)) {
      throw new AIToolRegistryError(`Tool "${tool.name}" is already registered. Duplicate registration rejected.`);
    }

    this.tools.set(tool.name, tool);
  }

  /**
   * Retrieves an allowlisted tool by name.
   */
  public getTool(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  /**
   * Checks if a tool name is currently registered.
   */
  public hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Returns model-facing definitions for all registered allowlisted tools.
   * Internal identifiers (like userId) are NEVER exposed through model definitions.
   */
  public getDefinitions(): AIToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: this.convertZodToJsonSchema(tool.inputSchema),
    }));
  }

  /**
   * Authoritative execution pipeline:
   * 1. Allowlist Lookup
   * 2. Context & Identity Verification
   * 3. Input Validation via Zod Schema
   * 4. Cancellation Check
   * 5. Execution
   * 6. Output Validation via Zod Schema
   * 7. Bounded Telemetry Recording
   */
  public async execute<TInput = unknown, TOutput = unknown>(
    toolName: string,
    params: TInput,
    context: AIToolContext
  ): Promise<TOutput> {
    const startedAt = new Date();
    const startTime = performance.now();

    // 1. Allowlist Check
    const tool = this.tools.get(toolName);
    if (!tool) {
      this.recordTelemetry({
        toolName,
        requestId: context?.requestId,
        userId: context?.userId || "unknown",
        startedAt,
        durationMs: Math.round(performance.now() - startTime),
        success: false,
        failureType: "AIToolNotFoundError",
      });
      throw new AIToolNotFoundError(toolName);
    }

    // 2. Identity & Context Verification (Candidate identity MUST be present)
    if (!context?.userId || typeof context.userId !== "string" || context.userId.trim().length === 0) {
      this.recordTelemetry({
        toolName,
        requestId: context?.requestId,
        userId: "unauthenticated",
        startedAt,
        durationMs: Math.round(performance.now() - startTime),
        success: false,
        failureType: "AIToolOwnershipError",
      });
      throw new AIToolOwnershipError("Authenticated candidate context is required. Missing or empty userId.");
    }

    // 3. Input Validation via Zod
    const parsedInput = tool.inputSchema.safeParse(params);
    if (!parsedInput.success) {
      const errorMsg = parsedInput.error.issues
        .map((e) => `${e.path.map(String).join(".")}: ${e.message}`)
        .join("; ");
      this.recordTelemetry({
        toolName,
        requestId: context.requestId,
        userId: context.userId,
        startedAt,
        durationMs: Math.round(performance.now() - startTime),
        success: false,
        failureType: "AIToolValidationError",
      });
      throw new AIToolValidationError(errorMsg, parsedInput.error.format());
    }

    // 4. Cancellation Check
    if (context.signal?.aborted) {
      this.recordTelemetry({
        toolName,
        requestId: context.requestId,
        userId: context.userId,
        startedAt,
        durationMs: Math.round(performance.now() - startTime),
        success: false,
        failureType: "AIToolTimeoutError",
      });
      throw new AIToolTimeoutError(toolName);
    }

    // 5. Execution
    let rawOutput: unknown;
    try {
      rawOutput = await tool.execute(parsedInput.data, context);
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      this.recordTelemetry({
        toolName,
        requestId: context.requestId,
        userId: context.userId,
        startedAt,
        durationMs,
        success: false,
        failureType: err?.name || "AIToolExecutionError",
      });
      throw err;
    }

    // 6. Output Validation via Zod
    const parsedOutput = tool.outputSchema.safeParse(rawOutput);
    if (!parsedOutput.success) {
      const errorMsg = parsedOutput.error.issues
        .map((e) => `${e.path.map(String).join(".")}: ${e.message}`)
        .join("; ");
      this.recordTelemetry({
        toolName,
        requestId: context.requestId,
        userId: context.userId,
        startedAt,
        durationMs: Math.round(performance.now() - startTime),
        success: false,
        failureType: "AIToolOutputValidationError",
      });
      throw new AIToolOutputValidationError(toolName, errorMsg, parsedOutput.error.format());
    }

    // 7. Successful Telemetry
    const durationMs = Math.round(performance.now() - startTime);
    this.recordTelemetry({
      toolName,
      requestId: context.requestId,
      userId: context.userId,
      startedAt,
      durationMs,
      success: true,
    });

    return parsedOutput.data as TOutput;
  }

  /**
   * Records telemetry in a bounded ring-buffer (max 100 entries) to prevent memory leaks.
   */
  private recordTelemetry(entry: AIToolExecutionTelemetry): void {
    if (this.telemetryRingBuffer.length >= ToolRegistry.MAX_TELEMETRY_ENTRIES) {
      this.telemetryRingBuffer.shift(); // Evict oldest entry
    }
    this.telemetryRingBuffer.push(entry);
  }

  /**
   * Retrieves recent execution telemetry records.
   */
  public getTelemetry(): AIToolExecutionTelemetry[] {
    return [...this.telemetryRingBuffer];
  }

  /**
   * Clears telemetry buffer (useful for unit tests).
   */
  public clearTelemetry(): void {
    this.telemetryRingBuffer.length = 0;
  }

  /**
   * Converts Zod Object Schema into model-facing JSON Schema dictionary.
   */
  private convertZodToJsonSchema(schema: any): Record<string, unknown> {
    try {
      if (schema?._def?.typeName === "ZodObject") {
        const shape = schema._def.shape();
        const properties: Record<string, unknown> = {};
        const required: string[] = [];

        for (const [key, val] of Object.entries(shape)) {
          const fieldDef = (val as any)._def;
          const isOptional =
            fieldDef.typeName === "ZodOptional" || fieldDef.typeName === "ZodDefault";
          if (!isOptional) {
            required.push(key);
          }
          properties[key] = {
            type: this.mapZodType(fieldDef),
            description: (val as any).description || undefined,
          };
        }

        return {
          type: "object",
          properties,
          required: required.length > 0 ? required : undefined,
        };
      }
    } catch {
      // Fallback safe dictionary
    }
    return { type: "object", properties: {} };
  }

  private mapZodType(def: any): string {
    const typeName = def?.typeName;
    if (typeName === "ZodString") return "string";
    if (typeName === "ZodNumber") return "number";
    if (typeName === "ZodBoolean") return "boolean";
    if (typeName === "ZodArray") return "array";
    if (typeName === "ZodObject") return "object";
    if (typeName === "ZodOptional" || typeName === "ZodDefault") {
      return this.mapZodType(def?.innerType?._def);
    }
    return "string";
  }
}
