import { AITool, AIToolContext } from "../types";
import {
  ProposeCareerPlanInput,
  ProposeCareerPlanInputSchema,
  ProposeCareerPlanOutput,
  ProposeCareerPlanOutputSchema,
} from "../schemas/career-plan-tool.schemas";
import { SkillGapService } from "@/modules/career-plan/skill-gap.service";
import { EmployabilityService } from "@/modules/career-plan/employability.service";
import { AIToolOwnershipError, AIToolExecutionError } from "../tool-errors";

export class ProposeCareerPlanTool
  implements AITool<ProposeCareerPlanInput, ProposeCareerPlanOutput>
{
  public readonly name = "proposeCareerPlan";
  public readonly description =
    "Synthesizes verified skill gaps, employability dimensions, and role benchmarks to construct a structured milestone roadmap proposal. Strictly non-mutating and proposal-only; does not persist or modify database state.";
  public readonly inputSchema = ProposeCareerPlanInputSchema;
  public readonly outputSchema = ProposeCareerPlanOutputSchema;

  public async execute(
    params: ProposeCareerPlanInput,
    context: AIToolContext
  ): Promise<ProposeCareerPlanOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to propose a career plan.");
    }

    try {
      // 1. Gather deterministic skill gaps (reusing SkillGapService)
      const skillGap = await SkillGapService.getCandidateSkillGap(
        context.userId,
        params.targetRole
      );

      // 2. Gather deterministic employability (reusing EmployabilityService)
      const employability = await EmployabilityService.getCandidateEmployability(
        context.userId,
        params.targetRole
      );

      // 3. Build deterministic milestone proposals based on identified gaps
      const milestones: Array<{
        id: string;
        title: string;
        description: string;
        category: string;
        priority: "High" | "Medium" | "Low";
        estimatedWeeks: number;
        targetSkills: string[];
      }> = [];

      const gaps = (skillGap.competencies || []).filter((c) => c.status === "Gap");

      if (gaps.length > 0) {
        gaps.slice(0, 4).forEach((gap, index) => {
          const estimatedWeeks = gap.priority === "High" ? 3 : gap.priority === "Medium" ? 2 : 1;
          milestones.push({
            id: `prop_m_${index + 1}_${gap.skill.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
            title: `Master ${gap.skill} for ${params.targetRole}`,
            description: `Close current competency deficit (${gap.currentNumeric} ➔ ${gap.requiredNumeric} pts) required for industry role benchmark.`,
            category: gap.category || "Technical Skill",
            priority: gap.priority as "High" | "Medium" | "Low",
            estimatedWeeks,
            targetSkills: [gap.skill],
          });
        });
      } else {
        // Candidate has high coverage, propose portfolio & interview mastery milestones
        milestones.push({
          id: "prop_m_1_advanced_architecture",
          title: `Advanced System Architecture for ${params.targetRole}`,
          description: "Elevate technical leadership and scalable production architectural patterns.",
          category: "System Design",
          priority: "High",
          estimatedWeeks: 3,
          targetSkills: ["System Architecture", "Scalability"],
        });
        milestones.push({
          id: "prop_m_2_production_portfolio",
          title: "Enterprise Portfolio Polish",
          description: "Align portfolio projects with live enterprise engineering standards and test coverage.",
          category: "Portfolio",
          priority: "Medium",
          estimatedWeeks: 2,
          targetSkills: ["Production Deployments", "E2E Testing"],
        });
      }

      // If focusAreas were specified, add focus milestone
      if (Array.isArray(params.focusAreas) && params.focusAreas.length > 0) {
        milestones.push({
          id: "prop_m_custom_focus",
          title: `Specialized Focus: ${params.focusAreas.join(", ")}`,
          description: `Targeted deep-dive into candidate-prioritized competency domains.`,
          category: "Specialization",
          priority: "Medium",
          estimatedWeeks: 2,
          targetSkills: params.focusAreas,
        });
      }

      const totalEstimatedWeeks = milestones.reduce((acc, m) => acc + m.estimatedWeeks, 0);
      const currentOverallScore = Math.min(100, Math.max(0, Math.round(skillGap.overallMatchScore)));
      const projectedTargetScore = Math.min(100, Math.max(currentOverallScore + 20, 85));

      return {
        targetRole: params.targetRole,
        currentOverallScore,
        projectedTargetScore,
        estimatedDurationWeeks: Math.max(1, totalEstimatedWeeks),
        milestones,
        disclaimer:
          "Proposal only. Requires candidate review and explicit approval before activation.",
        isProposal: true,
      };
    } catch (err: any) {
      throw new AIToolExecutionError(
        "proposeCareerPlan",
        err?.message || "Failed to generate career plan proposal"
      );
    }
  }
}
