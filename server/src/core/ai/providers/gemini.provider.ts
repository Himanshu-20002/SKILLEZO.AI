import { env } from "@/core/config/env";
import { AIProvider, AIProviderRequestOptions } from "./provider.interface";

export class GeminiProvider implements AIProvider {
  public readonly name = "Google Gemini";
  private static readonly STABLE_FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
  ];

  public isAvailable(): boolean {
    const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  public async generateStructured<T>(
    prompt: string,
    _schemaDescription: string,
    options?: AIProviderRequestOptions
  ): Promise<T | null> {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const primaryModel = env.AI_MODEL || "gemini-flash-lite-latest";
    const modelsToTry = Array.from(new Set([primaryModel, ...GeminiProvider.STABLE_FALLBACK_MODELS]));

    const bodyPayload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        responseMimeType: "application/json",
        ...(options?.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
      },
    };

    if (options?.systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    let lastError: Error | null = null;
    for (const model of modelsToTry) {
      if (options?.signal?.aborted) return null;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const timeoutSignal = AbortSignal.timeout(10000);
        const effectiveSignal = options?.signal
          ? anySignal([options.signal, timeoutSignal])
          : timeoutSignal;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: effectiveSignal,
          body: JSON.stringify(bodyPayload),
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
        if (err.name === "AbortError" && options?.signal?.aborted) {
          return null;
        }
        lastError = err;
      }
    }

    if (lastError) throw lastError;
    return null;
  }

  public async generateText(
    prompt: string,
    options?: AIProviderRequestOptions
  ): Promise<string | null> {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const primaryModel = env.AI_MODEL || "gemini-flash-lite-latest";
    const modelsToTry = Array.from(new Set([primaryModel, ...GeminiProvider.STABLE_FALLBACK_MODELS]));

    const bodyPayload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        ...(options?.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
      },
    };

    if (options?.systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    for (const model of modelsToTry) {
      if (options?.signal?.aborted) return null;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const timeoutSignal = AbortSignal.timeout(12000);
        const effectiveSignal = options?.signal
          ? anySignal([options.signal, timeoutSignal])
          : timeoutSignal;

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: effectiveSignal,
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) return rawText;
        }
      } catch (err: any) {
        if (err.name === "AbortError" && options?.signal?.aborted) {
          return null;
        }
        continue;
      }
    }

    return null;
  }

  public async *streamText(
    prompt: string,
    options?: AIProviderRequestOptions
  ): AsyncIterable<string> {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return;

    const primaryModel = env.AI_MODEL || "gemini-flash-lite-latest";
    const modelsToTry = Array.from(new Set([primaryModel, ...GeminiProvider.STABLE_FALLBACK_MODELS]));

    const bodyPayload: any = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.3,
        ...(options?.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
      },
    };

    if (options?.systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    for (const model of modelsToTry) {
      if (options?.signal?.aborted) return;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: options?.signal,
          body: JSON.stringify(bodyPayload),
        });

        if (!res.ok) {
          if (res.status === 404 || res.status === 503 || res.status === 429) {
            continue; // Try next fallback model
          }
          throw new Error(`Gemini streaming error [${res.status}]: ${await res.text()}`);
        }

        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          if (options?.signal?.aborted) break;
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data:")) {
              const dataStr = trimmed.slice(5).trim();
              if (!dataStr || dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
              } catch {
                // Ignore partial JSON chunks until full line arrives
              }
            }
          }
        }
        return; // Successfully completed stream
      } catch (err: any) {
        if (err.name === "AbortError" || options?.signal?.aborted) {
          return;
        }
        continue;
      }
    }
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort();
      return controller.signal;
    }
    sig.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}
