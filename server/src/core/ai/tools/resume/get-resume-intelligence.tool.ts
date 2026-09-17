import { AITool, AIToolContext } from "../types";
import {
  GetResumeIntelligenceInput,
  GetResumeIntelligenceInputSchema,
  GetResumeIntelligenceOutput,
  GetResumeIntelligenceOutputSchema,
} from "../schemas/resume-tool.schemas";
import { ResumeService } from "@/modules/resume/resume.service";
import { AIToolOwnershipError, AIToolExecutionError } from "../tool-errors";

export class GetResumeIntelligenceTool
  implements AITool<GetResumeIntelligenceInput, GetResumeIntelligenceOutput>
{
  public readonly name = "getResumeIntelligence";
  public readonly description =
    "Retrieve authoritative deterministic ATS scores, section breakdowns, and audit pillar diagnostics for the candidate's resume. Identity is strictly derived from server context.";
  public readonly inputSchema = GetResumeIntelligenceInputSchema;
  public readonly outputSchema = GetResumeIntelligenceOutputSchema;

  constructor(private readonly resumeService: ResumeService = new ResumeService()) {}

  public async execute(
    params: GetResumeIntelligenceInput,
    context: AIToolContext
  ): Promise<GetResumeIntelligenceOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to access resume intelligence.");
    }

    try {
      const atsResult = await this.resumeService.getResumeAtsScore(
        context.userId,
        params.resumeId,
        params.targetRole || "Full-Stack Engineer"
      );

      return {
        resumeId: atsResult.resumeId,
        targetRole: params.targetRole || "Full-Stack Engineer",
        overallScore: Math.min(100, Math.max(0, Math.round(atsResult.overallScore))),
        breakdown: {
          keywordMatch: Math.min(100, Math.max(0, Math.round(atsResult.breakdown.keywordMatch))),
          structure: Math.min(100, Math.max(0, Math.round(atsResult.breakdown.structure))),
          brevity: Math.min(100, Math.max(0, Math.round(atsResult.breakdown.brevity))),
          impact: Math.min(100, Math.max(0, Math.round(atsResult.breakdown.impact))),
          readability: Math.min(100, Math.max(0, Math.round(atsResult.breakdown.readability))),
        },
        auditPillars: (atsResult.auditPillars as Record<string, unknown>) || undefined,
        recommendations: (atsResult.recommendations || []).map((r) =>
          typeof r === "string" ? r : (r as any).message || String(r)
        ),
        extractedSkillsCount: (atsResult.keywords || []).length,
      };
    } catch (err: any) {
      if (err?.statusCode === 403 || err?.code === "FORBIDDEN") {
        throw new AIToolOwnershipError(
          `Candidate ${context.userId} is not authorized to access resume intelligence for ${params.resumeId}`
        );
      }
      throw new AIToolExecutionError(
        "getResumeIntelligence",
        err?.message || "Failed to calculate resume intelligence"
      );
    }
  }
}
