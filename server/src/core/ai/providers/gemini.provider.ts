import { env } from "@/core/config/env";
import { AIProvider } from "./provider.interface";

export class GeminiProvider implements AIProvider {
  public readonly name = "Google Gemini";
  private static readonly STABLE_FALLBACK_MODELS = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
  ];

  public isAvailable(): boolean {
    const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  public async generateStructured<T>(prompt: string, _schemaDescription: string): Promise<T | null> {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const primaryModel = env.AI_MODEL || "gemini-flash-latest";
    const modelsToTry = Array.from(new Set([primaryModel, ...GeminiProvider.STABLE_FALLBACK_MODELS]));

    let lastError: Error | null = null;
    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return JSON.parse(rawText) as T;
          }
        } else if (res.status === 404 || res.status === 503 || res.status === 429) {
          lastError = new Error(`Gemini API issue [${res.status}] with ${model}`);
          continue; // Try next available model in cascade
        } else {
          lastError = new Error(`Gemini API error [${res.status}]: ${await res.text()}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    if (lastError) throw lastError;
    return null;
  }

  public async generateText(prompt: string): Promise<string | null> {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const primaryModel = env.AI_MODEL || "gemini-flash-latest";
    const modelsToTry = Array.from(new Set([primaryModel, ...GeminiProvider.STABLE_FALLBACK_MODELS]));

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) return rawText;
        }
      } catch {
        continue;
      }
    }

    return null;
  }
}
