import { env } from "@/core/config/env";
import { AIProvider } from "../providers/provider.interface";
import { GeminiProvider } from "../providers/gemini.provider";
import { OpenAIProvider } from "../providers/openai.provider";
import {
  ModelGatewayRequest,
  ModelGatewayResponse,
  StructuredGatewayResponse,
  ProviderCircuitInfo,
  ModelGatewayTelemetry,
} from "./model-gateway.types";
import { z } from "zod";

export class ModelGateway {
  private static instance: ModelGateway;
  private providers: AIProvider[] = [];
  private circuitStates = new Map<string, ProviderCircuitInfo>();

  private readonly FAILURE_THRESHOLD = 3;
  private readonly CIRCUIT_RESET_TIMEOUT_MS = 30_000; // 30 seconds

  // In-memory telemetry log buffer (last 100 requests)
  private telemetryBuffer: ModelGatewayTelemetry[] = [];
  private readonly MAX_TELEMETRY_ENTRIES = 100;

  constructor(customProviders?: AIProvider[]) {
    this.providers = customProviders || [new GeminiProvider(), new OpenAIProvider()];
  }

  public static getInstance(): ModelGateway {
    if (!ModelGateway.instance) {
      ModelGateway.instance = new ModelGateway();
    }
    return ModelGateway.instance;
  }

  /**
   * Generates text with automatic provider failover, timeout guards, and latency telemetry.
   */
  public async generateText(request: ModelGatewayRequest): Promise<ModelGatewayResponse> {
    const correlationId = request.correlationId || this.generateCorrelationId();
    const candidateProviders = this.getPrioritizedProviders(request.preferredProvider);

    if (candidateProviders.length === 0) {
      throw new Error("[ModelGateway] No AI providers are configured or available.");
    }

    let fallbackUsed = false;
    let lastError: Error | null = null;

    for (let i = 0; i < candidateProviders.length; i++) {
      const provider = candidateProviders[i];
      if (!this.canAttemptProvider(provider.name)) {
        continue;
      }

      const startTime = Date.now();
      try {
        const text = await provider.generateText(request.prompt, {
          temperature: request.temperature,
          maxOutputTokens: request.maxOutputTokens,
          signal: request.signal,
          systemInstruction: request.systemInstruction,
        });

        if (text !== null) {
          const latencyMs = Date.now() - startTime;
          this.recordSuccess(provider.name);

          const telemetry: ModelGatewayTelemetry = {
            correlationId,
            provider: provider.name,
            model: env.AI_MODEL || "default",
            latencyMs,
            status: fallbackUsed ? "FALLBACK" : "SUCCESS",
            fallbackUsed,
            timestamp: new Date().toISOString(),
          };
          this.logTelemetry(telemetry);

          return {
            text,
            provider: provider.name,
            model: env.AI_MODEL || "default",
            latencyMs,
            fallbackUsed,
            correlationId,
          };
        }
      } catch (err: any) {
        lastError = err;
        this.recordFailure(provider.name);
        fallbackUsed = true;
        console.warn(
          `[ModelGateway] Provider "${provider.name}" failed for request ${correlationId}: ${err?.message || err}. Attempting failover.`
        );
      }
    }

    const telemetry: ModelGatewayTelemetry = {
      correlationId,
      provider: "ALL_FAILED",
      model: "none",
      latencyMs: 0,
      status: "ERROR",
      fallbackUsed: true,
      error: lastError?.message || "All providers exhausted",
      timestamp: new Date().toISOString(),
    };
    this.logTelemetry(telemetry);

    throw new Error(
      `[ModelGateway] All AI providers failed. Last error: ${lastError?.message || "No responses generated."}`
    );
  }

  /**
   * Generates structured output with strict Zod validation and provider failover.
   */
  public async generateStructured<T>(
    request: ModelGatewayRequest,
    schemaDescription: string,
    schema?: z.ZodSchema<T>
  ): Promise<StructuredGatewayResponse<T>> {
    const correlationId = request.correlationId || this.generateCorrelationId();
    const candidateProviders = this.getPrioritizedProviders(request.preferredProvider);

    if (candidateProviders.length === 0) {
      throw new Error("[ModelGateway] No AI providers are configured or available.");
    }

    let fallbackUsed = false;
    let lastError: Error | null = null;

    for (let i = 0; i < candidateProviders.length; i++) {
      const provider = candidateProviders[i];
      if (!this.canAttemptProvider(provider.name)) {
        continue;
      }

      const startTime = Date.now();
      try {
        const rawResult = await provider.generateStructured<any>(
          request.prompt,
          schemaDescription,
          {
            temperature: request.temperature,
            maxOutputTokens: request.maxOutputTokens,
            signal: request.signal,
            systemInstruction: request.systemInstruction,
          }
        );

        if (rawResult !== null) {
          let validatedData: T = rawResult;
          if (schema) {
            const parsed = schema.safeParse(rawResult);
            if (!parsed.success) {
              throw new Error(`Schema validation failed: ${JSON.stringify(parsed.error.format())}`);
            }
            validatedData = parsed.data;
          }

          const latencyMs = Date.now() - startTime;
          this.recordSuccess(provider.name);

          const telemetry: ModelGatewayTelemetry = {
            correlationId,
            provider: provider.name,
            model: env.AI_MODEL || "default",
            latencyMs,
            status: fallbackUsed ? "FALLBACK" : "SUCCESS",
            fallbackUsed,
            timestamp: new Date().toISOString(),
          };
          this.logTelemetry(telemetry);

          return {
            data: validatedData,
            provider: provider.name,
            model: env.AI_MODEL || "default",
            latencyMs,
            fallbackUsed,
            correlationId,
          };
        }
      } catch (err: any) {
        lastError = err;
        this.recordFailure(provider.name);
        fallbackUsed = true;
        console.warn(
          `[ModelGateway] Structured generation failed with "${provider.name}": ${err?.message || err}. Attempting failover.`
        );
      }
    }

    throw new Error(
      `[ModelGateway] Structured generation failed across all providers. Last error: ${lastError?.message}`
    );
  }

  /**
   * Streams text chunks via SSE/AsyncIterable with client cancellation and fallback protection.
   */
  public async *streamText(request: ModelGatewayRequest): AsyncIterable<string> {
    const candidateProviders = this.getPrioritizedProviders(request.preferredProvider);

    if (candidateProviders.length === 0) {
      throw new Error("[ModelGateway] No AI providers available for streaming.");
    }

    for (const provider of candidateProviders) {
      if (!this.canAttemptProvider(provider.name)) {
        continue;
      }

      let emittedAnyChunk = false;
      try {
        const stream = provider.streamText(request.prompt, {
          temperature: request.temperature,
          maxOutputTokens: request.maxOutputTokens,
          signal: request.signal,
          systemInstruction: request.systemInstruction,
        });

        for await (const chunk of stream) {
          emittedAnyChunk = true;
          yield chunk;
        }

        if (emittedAnyChunk) {
          this.recordSuccess(provider.name);
          return; // Successfully completed
        }
      } catch (err: any) {
        this.recordFailure(provider.name);
        // If chunks were already yielded to the client, cannot transparently switch provider mid-stream
        if (emittedAnyChunk || request.signal?.aborted) {
          return;
        }
        console.warn(
          `[ModelGateway] Streaming failed on "${provider.name}", attempting fallback provider...`
        );
      }
    }
  }

  /**
   * Sorts available providers by user/system preference.
   */
  private getPrioritizedProviders(preferred?: "gemini" | "openai" | "auto"): AIProvider[] {
    const preference = preferred || env.AI_PROVIDER || "auto";

    const available = this.providers.filter((p) => p.isAvailable());

    if (preference === "gemini") {
      return available.sort((a, b) => (a.name.includes("Gemini") ? -1 : 1));
    }
    if (preference === "openai") {
      return available.sort((a, b) => (a.name.includes("OpenAI") ? -1 : 1));
    }

    // Default: Gemini first, OpenAI fallback
    return available.sort((a, b) => (a.name.includes("Gemini") ? -1 : 1));
  }

  /**
   * Circuit breaker checks.
   */
  private canAttemptProvider(providerName: string): boolean {
    const circuit = this.circuitStates.get(providerName);
    if (!circuit || circuit.state === "CLOSED") {
      return true;
    }

    if (circuit.state === "OPEN") {
      const now = Date.now();
      if (now - circuit.lastFailureTime > this.CIRCUIT_RESET_TIMEOUT_MS) {
        circuit.state = "HALF_OPEN";
        return true;
      }
      return false;
    }

    // HALF_OPEN allows single probe
    return true;
  }

  private recordSuccess(providerName: string): void {
    const circuit = this.circuitStates.get(providerName);
    if (circuit) {
      circuit.failureCount = 0;
      circuit.state = "CLOSED";
    }
  }

  private recordFailure(providerName: string): void {
    let circuit = this.circuitStates.get(providerName);
    if (!circuit) {
      circuit = { failureCount: 1, lastFailureTime: Date.now(), state: "CLOSED" };
      this.circuitStates.set(providerName, circuit);
    } else {
      circuit.failureCount++;
      circuit.lastFailureTime = Date.now();
      if (circuit.failureCount >= this.FAILURE_THRESHOLD) {
        circuit.state = "OPEN";
        console.warn(
          `[ModelGateway] Circuit breaker TRIPPED to OPEN for provider "${providerName}" after ${circuit.failureCount} failures.`
        );
      }
    }
  }

  private logTelemetry(telemetry: ModelGatewayTelemetry): void {
    this.telemetryBuffer.unshift(telemetry);
    if (this.telemetryBuffer.length > this.MAX_TELEMETRY_ENTRIES) {
      this.telemetryBuffer.pop();
    }
  }

  public getTelemetryLog(): ModelGatewayTelemetry[] {
    return [...this.telemetryBuffer];
  }

  public getCircuitStates(): Record<string, ProviderCircuitInfo> {
    const result: Record<string, ProviderCircuitInfo> = {};
    for (const [key, val] of this.circuitStates.entries()) {
      result[key] = { ...val };
    }
    return result;
  }

  private generateCorrelationId(): string {
    return `gw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const modelGateway = ModelGateway.getInstance();
