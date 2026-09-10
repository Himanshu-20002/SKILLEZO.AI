export interface AIProvider {
  name: string;
  isAvailable(): boolean;
  generateStructured<T>(prompt: string, schemaDescription: string): Promise<T | null>;
  generateText(prompt: string): Promise<string | null>;
}
