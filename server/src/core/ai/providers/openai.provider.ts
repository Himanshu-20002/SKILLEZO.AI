import { env } from "@/core/config/env";
import { AIProvider, AIProviderRequestOptions } from "./provider.interface";

export class OpenAIProvider implements AIProvider {
  public readonly name = "OpenAI";

  public isAvailable(): boolean {
    const key = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  public async generateStructured<T>(
    prompt: string,
    _schemaDescription: string,
    options?: AIProviderRequestOptions
  ): Promise<T | null> {
    const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const timeoutSignal = AbortSignal.timeout(12000);
    const effectiveSignal = options?.signal
      ? anySignal([options.signal, timeoutSignal])
      : timeoutSignal;

    const url = "https://api.openai.com/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: effectiveSignal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: options?.temperature ?? 0.2,
        ...(options?.maxOutputTokens ? { max_tokens: options.maxOutputTokens } : {}),
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error [${res.status}]: ${await res.text()}`);
    }

    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) return null;

    return JSON.parse(rawText) as T;
  }

  public async generateText(
    prompt: string,
    options?: AIProviderRequestOptions
  ): Promise<string | null> {
    const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    const timeoutSignal = AbortSignal.timeout(12000);
    const effectiveSignal = options?.signal
      ? anySignal([options.signal, timeoutSignal])
      : timeoutSignal;

    const url = "https://api.openai.com/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: effectiveSignal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: options?.temperature ?? 0.3,
        ...(options?.maxOutputTokens ? { max_tokens: options.maxOutputTokens } : {}),
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  }

  public async *streamText(
    prompt: string,
    options?: AIProviderRequestOptions
  ): AsyncIterable<string> {
    const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return;

    const messages: any[] = [];
    if (options?.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    messages.push({ role: "user", content: prompt });

    try {
      const url = "https://api.openai.com/v1/chat/completions";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: options?.signal,
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages,
          temperature: options?.temperature ?? 0.3,
          ...(options?.maxOutputTokens ? { max_tokens: options.maxOutputTokens } : {}),
          stream: true,
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI streaming error [${res.status}]: ${await res.text()}`);
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
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) yield delta;
            } catch {
              // ignore partial chunk
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError" || options?.signal?.aborted) {
        return;
      }
      throw err;
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
