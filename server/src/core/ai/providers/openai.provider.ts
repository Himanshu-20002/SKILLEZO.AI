import { env } from "@/core/config/env";
import { AIProvider } from "./provider.interface";

export class OpenAIProvider implements AIProvider {
  public readonly name = "OpenAI";

  public isAvailable(): boolean {
    const key = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    return Boolean(key && key.trim().length > 0);
  }

  public async generateStructured<T>(prompt: string, _schemaDescription: string): Promise<T | null> {
    const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const url = "https://api.openai.com/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
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

  public async generateText(prompt: string): Promise<string | null> {
    const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const url = "https://api.openai.com/v1/chat/completions";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  }
}
