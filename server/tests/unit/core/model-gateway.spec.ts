import { describe, it, expect, vi } from "vitest";
import { ModelGateway } from "@/core/ai/gateway/model-gateway";
import { AIProvider } from "@/core/ai/providers/provider.interface";
import { z } from "zod";

class MockProvider implements AIProvider {
  constructor(
    public readonly name: string,
    private available = true,
    private shouldFail = false,
    private responseText = "Mock response"
  ) {}

  public isAvailable(): boolean {
    return this.available;
  }

  public async generateText(): Promise<string | null> {
    if (this.shouldFail) {
      throw new Error(`Provider ${this.name} failed with 503`);
    }
    return this.responseText;
  }

  public async generateStructured<T>(): Promise<T | null> {
    if (this.shouldFail) {
      throw new Error(`Provider ${this.name} structured failed`);
    }
    return { result: this.responseText } as T;
  }

  public async *streamText(): AsyncIterable<string> {
    if (this.shouldFail) {
      throw new Error(`Provider ${this.name} stream failed`);
    }
    yield "Hello ";
    yield "World!";
  }
}

describe("Phase 1: Model Gateway & Provider Abstraction", () => {
  it("routes request to primary available provider", async () => {
    const primary = new MockProvider("PrimaryMock", true, false, "Primary answer");
    const secondary = new MockProvider("SecondaryMock", true, false, "Secondary answer");

    const gateway = new ModelGateway([primary, secondary]);
    const res = await gateway.generateText({ prompt: "Hello" });

    expect(res.text).toBe("Primary answer");
    expect(res.provider).toBe("PrimaryMock");
    expect(res.fallbackUsed).toBe(false);
    expect(res.correlationId).toBeDefined();
  });

  it("automatically fails over to secondary provider when primary fails", async () => {
    const failingPrimary = new MockProvider("FailingGemini", true, true);
    const healthySecondary = new MockProvider("HealthyOpenAI", true, false, "Fallback answer");

    const gateway = new ModelGateway([failingPrimary, healthySecondary]);
    const res = await gateway.generateText({ prompt: "Give me advice" });

    expect(res.text).toBe("Fallback answer");
    expect(res.provider).toBe("HealthyOpenAI");
    expect(res.fallbackUsed).toBe(true);
  });

  it("trips circuit breaker to OPEN after repeated failures", async () => {
    const failingProvider = new MockProvider("FlakyProvider", true, true);
    const backupProvider = new MockProvider("BackupProvider", true, false, "Backup answer");

    const gateway = new ModelGateway([failingProvider, backupProvider]);

    // Trigger 3 failures to trip the circuit breaker
    await gateway.generateText({ prompt: "1" });
    await gateway.generateText({ prompt: "2" });
    await gateway.generateText({ prompt: "3" });

    const circuits = gateway.getCircuitStates();
    expect(circuits["FlakyProvider"]).toBeDefined();
    expect(circuits["FlakyProvider"].failureCount).toBe(3);
    expect(circuits["FlakyProvider"].state).toBe("OPEN");

    // 4th request should bypass FlakyProvider directly and use BackupProvider
    const res = await gateway.generateText({ prompt: "4" });
    expect(res.provider).toBe("BackupProvider");
  });

  it("validates structured output with Zod schema", async () => {
    const provider = new MockProvider("StructuredProvider", true, false, "Valid data");
    const gateway = new ModelGateway([provider]);

    const testSchema = z.object({
      result: z.string(),
    });

    const res = await gateway.generateStructured(
      { prompt: "Analyze" },
      "Test Schema",
      testSchema
    );

    expect(res.data.result).toBe("Valid data");
    expect(res.provider).toBe("StructuredProvider");
    expect(res.fallbackUsed).toBe(false);
  });

  it("streams text chunks asynchronously through AsyncIterable", async () => {
    const streamingProvider = new MockProvider("Streamer", true, false);
    const gateway = new ModelGateway([streamingProvider]);

    const chunks: string[] = [];
    for await (const chunk of gateway.streamText({ prompt: "Stream this" })) {
      chunks.push(chunk);
    }

    expect(chunks.join("")).toBe("Hello World!");
  });

  it("records telemetry for executed requests", async () => {
    const provider = new MockProvider("TelemetryMock", true, false, "Logged response");
    const gateway = new ModelGateway([provider]);

    await gateway.generateText({ prompt: "Test telemetry", correlationId: "req_test_01" });

    const telemetryLog = gateway.getTelemetryLog();
    expect(telemetryLog.length).toBeGreaterThan(0);
    const entry = telemetryLog.find((t) => t.correlationId === "req_test_01");
    expect(entry).toBeDefined();
    expect(entry?.status).toBe("SUCCESS");
    expect(entry?.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
