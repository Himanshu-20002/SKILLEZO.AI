import { AITool, AIToolContext } from "../types";
import {
  GetEmployabilityMetricsInput,
  GetEmployabilityMetricsInputSchema,
  GetEmployabilityMetricsOutput,
  GetEmployabilityMetricsOutputSchema,
} from "../schemas/employability-tool.schemas";
import { EmployabilityService } from "@/modules/career-plan/employability.service";
import { AIToolOwnershipError, AIToolExecutionError } from "../tool-errors";

export class GetEmployabilityMetricsTool
  implements AITool<GetEmployabilityMetricsInput, GetEmployabilityMetricsOutput>
{
  public readonly name = "getEmployabilityMetrics";
  public readonly description =
    "Retrieve the candidate's multi-factor employability index (technical readiness, resume strength, project strength, skill alignment, and recruiter visibility) for their active or optional target role.";
  public readonly inputSchema = GetEmployabilityMetricsInputSchema;
  public readonly outputSchema = GetEmployabilityMetricsOutputSchema;

  public async execute(
    params: GetEmployabilityMetricsInput,
    context: AIToolContext
  ): Promise<GetEmployabilityMetricsOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to evaluate employability.");
    }

    try {
      const result = await EmployabilityService.getCandidateEmployability(
        context.userId,
        params.targetRole
      );

      return {
        targetRole: result.targetRole,
        overallScore: Math.min(100, Math.max(0, Math.round(result.overallScore))),
        tierStatus: result.tierStatus,
        targetTier: result.targetTier,
        metrics: {
          technicalReadiness: Math.min(100, Math.max(0, Math.round(result.metrics.technicalReadiness))),
          resumeStrength: Math.min(100, Math.max(0, Math.round(result.metrics.resumeStrength))),
          projectStrength: Math.min(100, Math.max(0, Math.round(result.metrics.projectStrength))),
          skillAlignment: Math.min(100, Math.max(0, Math.round(result.metrics.skillAlignment))),
          recruiterVisibility: Math.min(100, Math.max(0, Math.round(result.metrics.recruiterVisibility))),
        },
        strengths: result.strengths || [],
        improvementAreas: result.improvementAreas || [],
        careerGpsReady: !!result.careerGps?.ready,
        milestonesCount: (result.careerGps?.milestones || []).length,
      };
    } catch (err: any) {
      throw new AIToolExecutionError(
        "getEmployabilityMetrics",
        err?.message || "Failed to calculate candidate employability metrics"
      );
    }
  }
}
