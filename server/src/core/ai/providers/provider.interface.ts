export interface AIProviderRequestOptions {
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
  systemInstruction?: string;
}

export interface AIProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateStructured<T>(
    prompt: string,
    schemaDescription: string,
    options?: AIProviderRequestOptions
  ): Promise<T | null>;
  generateText(prompt: string, options?: AIProviderRequestOptions): Promise<string | null>;
  streamText(prompt: string, options?: AIProviderRequestOptions): AsyncIterable<string>;
}
