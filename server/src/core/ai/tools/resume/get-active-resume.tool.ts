import { AITool, AIToolContext } from "../types";
import {
  GetActiveResumeInput,
  GetActiveResumeInputSchema,
  GetActiveResumeOutput,
  GetActiveResumeOutputSchema,
} from "../schemas/resume-tool.schemas";
import { ResumeService } from "@/modules/resume/resume.service";
import { AIToolOwnershipError, AIToolExecutionError } from "../tool-errors";

export class GetActiveResumeTool
  implements AITool<GetActiveResumeInput, GetActiveResumeOutput>
{
  public readonly name = "getActiveResume";
  public readonly description =
    "Retrieve the candidate's active or default resume, including extracted skills, title, and ATS score. If a resumeId is provided, ownership is verified against the authenticated candidate.";
  public readonly inputSchema = GetActiveResumeInputSchema;
  public readonly outputSchema = GetActiveResumeOutputSchema;

  constructor(private readonly resumeService: ResumeService = new ResumeService()) {}

  public async execute(
    params: GetActiveResumeInput,
    context: AIToolContext
  ): Promise<GetActiveResumeOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to access resumes.");
    }

    let resume: any = null;

    if (params.resumeId) {
      try {
        resume = await this.resumeService.getResumeById(context.userId, params.resumeId);
      } catch (err: any) {
        if (err?.statusCode === 403 || err?.code === "FORBIDDEN") {
          throw new AIToolOwnershipError(
            `Candidate ${context.userId} is not authorized to access resume ${params.resumeId}`
          );
        }
        throw new AIToolExecutionError("getActiveResume", err?.message || "Failed to fetch resume");
      }

      if (resume && resume.userId !== context.userId) {
        throw new AIToolOwnershipError(
          `Candidate ${context.userId} is not authorized to access resume ${params.resumeId}`
        );
      }
    } else {
      const userResumes = await this.resumeService.getUserResumes(context.userId);
      if (!userResumes || userResumes.length === 0) {
        throw new AIToolExecutionError(
          "getActiveResume",
          "No resume found for candidate. Please upload a resume first."
        );
      }
      resume = userResumes.find((r) => r.isDefault) || userResumes[0];
    }

    const extracted = resume.extractedData || {};
    const extractedSkills = Array.isArray(extracted.skills)
      ? extracted.skills
          .map((s: any) => (typeof s === "string" ? s.trim() : (s?.name || "").trim()))
          .filter(Boolean)
      : [];

    return {
      resumeId: resume._id ? resume._id.toString() : resume.id,
      title: resume.title || "Default Resume",
      isDefault: !!resume.isDefault,
      atsScore: typeof resume.atsScore === "number" ? resume.atsScore : null,
      extractedSkills,
      originalFileName: resume.originalFileName || undefined,
      updatedAt: resume.updatedAt ? new Date(resume.updatedAt).toISOString() : undefined,
    };
  }
}
