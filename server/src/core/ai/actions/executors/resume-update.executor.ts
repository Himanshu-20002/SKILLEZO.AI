import {
  ActionExecutorInterface,
  ActionProposalDTO,
  ActionExecutionContext,
  ActionTypeEnum,
} from "../action-types";
import { ResumeService } from "@/modules/resume/resume.service";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class ResumeUpdateExecutor implements ActionExecutorInterface {
  public readonly actionType = ActionTypeEnum.RESUME_UPDATE;

  constructor(
    private readonly resumeService: ResumeService = new ResumeService(),
    private readonly resumeRepository: ResumeRepository = new ResumeRepository()
  ) {}

  public async checkStale(
    proposal: ActionProposalDTO
  ): Promise<{ isStale: boolean; reason?: string }> {
    const resumeId = proposal.targetEntity?.id || proposal.payload?.resumeId;
    if (!resumeId) {
      return { isStale: true, reason: "Missing target resume identifier" };
    }

    const resume = await this.resumeRepository.findById(resumeId);
    if (!resume) {
      return { isStale: true, reason: "Target resume no longer exists" };
    }

    if (resume.userId !== proposal.ownerId) {
      return { isStale: true, reason: "Resume ownership mismatch" };
    }

    const currentVersion = resume.version || 1;
    const baseVersion =
      proposal.targetEntity?.version ?? proposal.payload?.baseDocumentVersion;

    if (baseVersion !== undefined && baseVersion !== null && currentVersion !== baseVersion) {
      return {
        isStale: true,
        reason: `Resume has been modified since proposal was created (Current version: ${currentVersion}, Proposal base version: ${baseVersion})`,
      };
    }

    return { isStale: false };
  }

  public async execute(
    payload: {
      resumeId: string;
      sectionId: any;
      proposed: any;
      baseDocumentVersion: number;
    },
    context: ActionExecutionContext
  ): Promise<any> {
    const { resumeId, sectionId, proposed, baseDocumentVersion } = payload;

    // Verify resume exists and belongs to context.userId
    const resume = await this.resumeRepository.findById(resumeId);
    if (!resume) {
      throw new AppError(
        "Resume not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESUME_NOT_FOUND
      );
    }

    if (resume.userId !== context.userId) {
      throw new AppError(
        "Candidate does not own this resume",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACTION_FORBIDDEN
      );
    }

    // Execute deterministic section mutation via ResumeService
    const result = await this.resumeService.applySectionImprovement(
      context.userId,
      resumeId,
      sectionId,
      {
        suggestionId: (payload as any).suggestionId || context.proposalId,
        proposed,
        baseDocumentVersion,
      }
    );

    return result;
  }

  public async verify(
    result: any,
    _context: ActionExecutionContext
  ): Promise<{ verified: boolean; metrics?: any[] }> {
    if (!result || !result.resumeDocument) {
      return { verified: false };
    }

    const metrics = [
      {
        metric: `Section Score (${result.sectionId})`,
        value: result.newScore,
        delta: result.scoreDelta,
      },
    ];

    return {
      verified: true,
      metrics,
    };
  }
}
