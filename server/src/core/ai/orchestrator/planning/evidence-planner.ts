import { AIIntent } from "../intent/intent-types";
import { EvidencePlan, ToolExecutionDescriptor } from "./evidence-plan";
import { ToolSelectionGuard } from "./tool-selection";

export class EvidencePlanner {
  /**
   * Plans the staged execution of allowlisted tools based on the candidate's intent.
   * Enforces dependency boundaries: prerequisite tools run in Stage 1, independent analytical
   * tools run in Stage 3, and synthesis tools run in Stage 4.
   */
  public static createPlan(intent: AIIntent, targetRole?: string): EvidencePlan {
    const stage1Tools: ToolExecutionDescriptor[] = [];
    const stage3Tools: ToolExecutionDescriptor[] = [];
    const stage4Tools: ToolExecutionDescriptor[] = [];
    const requiredToolNames: string[] = [];

    const addDescriptor = (
      stage: 1 | 3 | 4,
      toolName: string,
      params: Record<string, unknown> = {},
      isCritical = true
    ) => {
      ToolSelectionGuard.validateToolName(toolName);
      const desc: ToolExecutionDescriptor = { toolName, params, stage, isCritical };
      if (stage === 1) stage1Tools.push(desc);
      else if (stage === 3) stage3Tools.push(desc);
      else if (stage === 4) stage4Tools.push(desc);

      if (isCritical) {
        requiredToolNames.push(toolName);
      }
    };

    switch (intent) {
      case "PROFILE_OVERVIEW":
        addDescriptor(1, "getCandidateProfile", {}, true);
        addDescriptor(1, "getActiveResume", {}, false);
        break;

      case "RESUME_ANALYSIS":
        addDescriptor(1, "getActiveResume", {}, true);
        addDescriptor(3, "getResumeIntelligence", {}, true);
        addDescriptor(1, "getCandidateProfile", {}, false);
        break;

      case "RESUME_IMPROVEMENT":
        addDescriptor(1, "getActiveResume", {}, true);
        addDescriptor(3, "getResumeIntelligence", {}, true);
        if (targetRole) {
          addDescriptor(3, "getSkillGaps", { targetRole }, false);
        }
        break;

      case "SKILL_GAP_ANALYSIS":
        addDescriptor(1, "getCandidateProfile", {}, true);
        addDescriptor(3, "getSkillGaps", targetRole ? { targetRole } : {}, true);
        addDescriptor(3, "getEmployabilityMetrics", targetRole ? { targetRole } : {}, false);
        break;

      case "EMPLOYABILITY_ANALYSIS":
        addDescriptor(1, "getCandidateProfile", {}, true);
        addDescriptor(3, "getEmployabilityMetrics", targetRole ? { targetRole } : {}, true);
        if (targetRole) {
          addDescriptor(3, "getSkillGaps", { targetRole }, false);
        }
        break;

      case "JOB_MATCHING":
        addDescriptor(1, "getCandidateProfile", {}, true);
        addDescriptor(
          3,
          "getMatchingJobs",
          targetRole ? { query: targetRole, limit: 5 } : { limit: 5 },
          true
        );
        if (targetRole) {
          addDescriptor(3, "getSkillGaps", { targetRole }, false);
        }
        break;

      case "CAREER_READINESS":
        addDescriptor(1, "getCandidateProfile", {}, true);
        addDescriptor(1, "getActiveResume", {}, true);
        addDescriptor(3, "getResumeIntelligence", {}, true);
        addDescriptor(3, "getSkillGaps", targetRole ? { targetRole } : {}, true);
        addDescriptor(3, "getEmployabilityMetrics", targetRole ? { targetRole } : {}, true);
        addDescriptor(
          3,
          "getMatchingJobs",
          targetRole ? { query: targetRole, limit: 5 } : { limit: 5 },
          false
        );
        break;

      case "CAREER_PLAN":
        // CAREER_PLAN requires getActiveResume to evaluate existing resume readiness (per review correction #6)
        addDescriptor(1, "getCandidateProfile", {}, true);
        addDescriptor(1, "getActiveResume", {}, true);
        addDescriptor(3, "getSkillGaps", targetRole ? { targetRole } : {}, true);
        addDescriptor(3, "getEmployabilityMetrics", targetRole ? { targetRole } : {}, true);
        addDescriptor(4, "proposeCareerPlan", targetRole ? { targetRole } : {}, true);
        break;

      case "GENERAL_CAREER_GUIDANCE":
        addDescriptor(1, "getCandidateProfile", {}, false);
        addDescriptor(1, "getActiveResume", {}, false);
        break;

      case "UNKNOWN":
      default:
        // No tools for out of scope queries
        break;
    }

    return {
      intent,
      targetRole,
      stage1Tools,
      stage3Tools,
      stage4Tools,
      requiredToolNames,
    };
  }
}
