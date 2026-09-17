import { AIIntent } from "../intent/intent-types";
import { CandidateContextSnapshot } from "../../context/candidate-context.types";

export interface ExecutedToolResult {
  toolName: string;
  params: Record<string, unknown>;
  output?: unknown;
  success: boolean;
  error?: string;
  durationMs: number;
}

export interface VerifiedEvidenceEntry {
  id: string;
  type: string;
  source: string;
  summary: string;
  metricName?: string;
  numericValue?: number;
}

export interface OrchestrationContext {
  intent: AIIntent;
  userMessage: string;
  targetRole?: string;
  candidateSnapshot?: CandidateContextSnapshot;
  toolResults: Map<string, ExecutedToolResult>;
  limitations: string[];
  verifiedEvidence: VerifiedEvidenceEntry[];
}
