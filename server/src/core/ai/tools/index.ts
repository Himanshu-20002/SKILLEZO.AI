import { ToolRegistry } from "./tool-registry";
import { GetCandidateProfileTool } from "./profile/get-candidate-profile.tool";
import { GetActiveResumeTool } from "./resume/get-active-resume.tool";
import { GetResumeIntelligenceTool } from "./resume/get-resume-intelligence.tool";
import { GetSkillGapsTool } from "./skills/get-skill-gaps.tool";
import { GetEmployabilityMetricsTool } from "./employability/get-employability-metrics.tool";
import { GetMatchingJobsTool } from "./jobs/get-matching-jobs.tool";
import { ProposeCareerPlanTool } from "./career-plan/propose-career-plan.tool";

export * from "./types";
export * from "./tool-errors";
export * from "./tool-registry";

// Export concrete tool classes
export * from "./profile/get-candidate-profile.tool";
export * from "./resume/get-active-resume.tool";
export * from "./resume/get-resume-intelligence.tool";
export * from "./skills/get-skill-gaps.tool";
export * from "./employability/get-employability-metrics.tool";
export * from "./jobs/get-matching-jobs.tool";
export * from "./career-plan/propose-career-plan.tool";

// Export schemas
export * from "./schemas/profile-tool.schemas";
export * from "./schemas/resume-tool.schemas";
export * from "./schemas/skill-tool.schemas";
export * from "./schemas/employability-tool.schemas";
export * from "./schemas/job-tool.schemas";
export * from "./schemas/career-plan-tool.schemas";

/**
 * Single authoritative Tool Registry instance initialized with all seven allowlisted tools.
 */
function initializeToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  registry.register(new GetCandidateProfileTool());
  registry.register(new GetActiveResumeTool());
  registry.register(new GetResumeIntelligenceTool());
  registry.register(new GetSkillGapsTool());
  registry.register(new GetEmployabilityMetricsTool());
  registry.register(new GetMatchingJobsTool());
  registry.register(new ProposeCareerPlanTool());

  return registry;
}

export const toolRegistry = initializeToolRegistry();
