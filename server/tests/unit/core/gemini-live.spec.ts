import { describe, it, expect } from "vitest";
import { z } from "zod";
import { env } from "@/core/config/env";
import { GeminiProvider } from "@/core/ai/providers/gemini.provider";

const TestResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
});

describe("GEMINI LIVE CONNECTION TEST", () => {
  it("should verify live Gemini API connection, structured output, and schema validation", async () => {
    const provider = new GeminiProvider();

    // 1. GEMINI_API_KEY is loaded
    expect(provider.isAvailable()).toBe(true);

    // 2. AI_PROVIDER resolves to Gemini
    expect(env.AI_PROVIDER).toBe("gemini");

    // 3. AI_MODEL resolves to the configured model
    expect(env.AI_MODEL).toBeDefined();
    expect(env.AI_MODEL).toBe("gemini-flash-latest");

    // 4. GeminiProvider can make a real request
    const testPrompt = `Return ONLY a valid JSON object matching this exact schema:
{
  "status": "ok",
  "message": "Gemini connection successful"
}`;

    const rawResult = await provider.generateStructured<any>(testPrompt, "Live Connection Test");

    // 5. The response is received successfully
    expect(rawResult).not.toBeNull();
    expect(rawResult).toBeDefined();

    // 6. Structured JSON output works
    expect(typeof rawResult).toBe("object");

    // 7. The response passes the existing Zod schema
    const validation = TestResponseSchema.safeParse(rawResult);
    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.status).toBe("ok");
      expect(validation.data.message).toBe("Gemini connection successful");
    }
  }, 20000);
});
