import { AIEvidencePlanningError } from "../orchestrator-errors";

export const ALLOWLISTED_ORCHESTRATOR_TOOLS = [
  "getCandidateProfile",
  "getActiveResume",
  "getResumeIntelligence",
  "getSkillGaps",
  "getEmployabilityMetrics",
  "getMatchingJobs",
  "proposeCareerPlan",
] as const;

export type AllowlistedToolName = (typeof ALLOWLISTED_ORCHESTRATOR_TOOLS)[number];

export class ToolSelectionGuard {
  private static readonly allowlistSet = new Set<string>(ALLOWLISTED_ORCHESTRATOR_TOOLS);

  /**
   * Verifies that a requested tool is within the strict Phase 3 allowlist.
   */
  public static validateToolName(toolName: string): AllowlistedToolName {
    if (!this.allowlistSet.has(toolName)) {
      throw new AIEvidencePlanningError(
        `Tool "${toolName}" is not allowlisted for Orchestrator execution. Only registered Phase 3 tools are permitted.`
      );
    }
    return toolName as AllowlistedToolName;
  }

  public static isAllowlisted(toolName: string): boolean {
    return this.allowlistSet.has(toolName);
  }
}
