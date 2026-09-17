import { AIIntent } from "../types";

export { AIIntent };

export interface IntentClassificationResult {
  intent: AIIntent;
  confidence: number;
  detectedRole?: string;
  matchedRule?: string;
}
