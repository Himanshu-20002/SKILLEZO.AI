import { AITool, AIToolContext } from "../types";
import {
  GetSkillGapsInput,
  GetSkillGapsInputSchema,
  GetSkillGapsOutput,
  GetSkillGapsOutputSchema,
} from "../schemas/skill-tool.schemas";
import { SkillGapService } from "@/modules/career-plan/skill-gap.service";
import { AIToolOwnershipError, AIToolExecutionError } from "../tool-errors";

export class GetSkillGapsTool
  implements AITool<GetSkillGapsInput, GetSkillGapsOutput>
{
  public readonly name = "getSkillGaps";
  public readonly description =
    "Retrieve deterministic 6-axis skill-gap analysis, missing competencies, and priority recommendations for the authenticated candidate against a target role.";
  public readonly inputSchema = GetSkillGapsInputSchema;
  public readonly outputSchema = GetSkillGapsOutputSchema;

  public async execute(
    params: GetSkillGapsInput,
    context: AIToolContext
  ): Promise<GetSkillGapsOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to analyze skill gaps.");
    }

    try {
      const result = await SkillGapService.getCandidateSkillGap(
        context.userId,
        params.targetRole
      );

      const missing = (result.competencies || [])
        .filter((c) => c.status === "Gap")
        .map((c) => c.skill);

      const strengths = (result.competencies || [])
        .filter((c) => c.status === "Matched")
        .map((c) => c.skill);

      return {
        targetRole: result.targetRole,
        overallMatchScore: Math.min(100, Math.max(0, Math.round(result.overallMatchScore))),
        skillsAcquiredCount: result.skillsAcquiredCount,
        skillsRequiredCount: result.skillsRequiredCount,
        skillsMissingCount: result.skillsMissingCount,
        missingSkills: missing,
        strengths,
        priorityRecommendations: (result.priorityRecommendations || []).map((p) => ({
          skill: p.skill,
          currentLevel: p.currentLevel,
          requiredLevel: p.requiredLevel,
          priority: p.priority,
          reason: p.reason,
          suggestedAction: p.suggestedAction,
        })),
      };
    } catch (err: any) {
      throw new AIToolExecutionError(
        "getSkillGaps",
        err?.message || "Failed to analyze candidate skill gaps"
      );
    }
  }
}
