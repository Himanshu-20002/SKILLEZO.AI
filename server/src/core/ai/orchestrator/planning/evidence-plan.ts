import { AIIntent } from "../intent/intent-types";

export interface ToolExecutionDescriptor {
  toolName: string;
  params: Record<string, unknown>;
  stage: 1 | 3 | 4;
  isCritical: boolean;
}

export interface EvidencePlan {
  intent: AIIntent;
  targetRole?: string;
  stage1Tools: ToolExecutionDescriptor[]; // Prerequisites (e.g. profile, active resume)
  stage3Tools: ToolExecutionDescriptor[]; // Independent analytics (e.g. gaps, employability, jobs, ATS)
  stage4Tools: ToolExecutionDescriptor[]; // Synthesis tools (e.g. proposeCareerPlan)
  requiredToolNames: string[];
}
