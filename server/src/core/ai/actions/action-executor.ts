import { ActionRegistry } from "./action-registry";
import { ActionStateMachine } from "./action-state-machine";
import {
  ActionProposalDTO,
  ActionResultDTO,
  ActionStatusEnum,
  ActionExecutionContext,
} from "./action-types";
import { ActionProposalRepository } from "@/database/repositories/action/ActionProposalRepository";
import { IActionProposal } from "@/database/models/ActionProposal.model";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class ActionExecutor {
  private static instance: ActionExecutor | null = null;

  constructor(
    private readonly repository: ActionProposalRepository = new ActionProposalRepository(),
    private readonly registry: ActionRegistry = ActionRegistry.getInstance()
  ) {}

  public static getInstance(): ActionExecutor {
    if (!this.instance) {
      this.instance = new ActionExecutor();
    }
    return this.instance;
  }

  public async createProposal(
    userId: string,
    data: {
      actionType: string;
      title: string;
      description: string;
      rationale: string;
      evidenceIds: string[];
      targetEntity: { type: "resume" | "profile" | "career_plan"; id: string; version?: number };
      preview: { before: any; after: any; diffSummary?: string };
      payload: Record<string, any>;
      idempotencyKey?: string;
    }
  ): Promise<ActionProposalDTO> {
    // 1. Idempotency check: if key already exists for this candidate, return existing
    if (data.idempotencyKey) {
      const existing = await this.repository.findByIdempotencyKey(
        userId,
        data.idempotencyKey
      );
      if (existing) {
        return this.toDTO(existing);
      }
    }

    // 2. Allowlist & schema validation
    const registration = this.registry.get(data.actionType);
    const validatedPayload = registration.payloadSchema.parse(data.payload);

    // 3. Generate server-authoritative proposal ID & 24h expiration
    const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const doc = await this.repository.create({
      proposalId,
      ownerId: userId,
      actionType: registration.actionType,
      status: ActionStatusEnum.PROPOSED,
      title: data.title,
      description: data.description,
      rationale: data.rationale,
      evidenceIds: data.evidenceIds || [],
      targetEntity: data.targetEntity,
      preview: data.preview,
      payload: validatedPayload,
      idempotencyKey: data.idempotencyKey || null,
      expiresAt,
    });

    return this.toDTO(doc);
  }

  public async getProposal(
    userId: string,
    proposalId: string
  ): Promise<ActionProposalDTO> {
    const doc = await this.repository.findByProposalId(proposalId);
    if (!doc) {
      throw new AppError(
        `Action proposal '${proposalId}' not found`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ACTION_NOT_FOUND
      );
    }

    // Cross-user ownership protection
    if (doc.ownerId !== userId) {
      throw new AppError(
        "Candidate is not authorized to view this action proposal",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACTION_FORBIDDEN
      );
    }

    // Check expiration
    if (
      doc.status === ActionStatusEnum.PROPOSED &&
      new Date() > new Date(doc.expiresAt)
    ) {
      const updated = await this.repository.atomicTransitionStatus(
        proposalId,
        ActionStatusEnum.PROPOSED,
        ActionStatusEnum.EXPIRED,
        { error: "Proposal expired before user approval" }
      );
      if (updated) return this.toDTO(updated);
    }

    return this.toDTO(doc);
  }

  public async listProposals(
    userId: string,
    status?: any
  ): Promise<ActionProposalDTO[]> {
    const docs = await this.repository.findByOwnerId(userId, status);
    return docs.map((d) => this.toDTO(d));
  }

  public async rejectProposal(
    userId: string,
    proposalId: string,
    reason?: string
  ): Promise<ActionProposalDTO> {
    const doc = await this.repository.findByProposalId(proposalId);
    if (!doc) {
      throw new AppError(
        `Action proposal '${proposalId}' not found`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ACTION_NOT_FOUND
      );
    }

    if (doc.ownerId !== userId) {
      throw new AppError(
        "Candidate is not authorized to reject this action proposal",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACTION_FORBIDDEN
      );
    }

    ActionStateMachine.assertTransition(doc.status, ActionStatusEnum.REJECTED);

    const updated = await this.repository.atomicTransitionStatus(
      proposalId,
      ActionStatusEnum.PROPOSED,
      ActionStatusEnum.REJECTED,
      { error: reason || "User rejected action proposal" }
    );

    if (!updated) {
      throw new AppError(
        "Could not reject proposal: status has already changed",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.CONFLICT
      );
    }

    return this.toDTO(updated);
  }

  public async approveAndExecute(
    userId: string,
    proposalId: string,
    contextInfo?: { ip?: string; userAgent?: string; idempotencyKey?: string }
  ): Promise<ActionResultDTO> {
    const doc = await this.repository.findByProposalId(proposalId);
    if (!doc) {
      throw new AppError(
        `Action proposal '${proposalId}' not found`,
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.ACTION_NOT_FOUND
      );
    }

    // 1. Strict ownership authorization
    if (doc.ownerId !== userId) {
      throw new AppError(
        "Candidate is not authorized to approve this action proposal",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.ACTION_FORBIDDEN
      );
    }

    // 2. Idempotency check: already completed returns authoritative existing result
    if (doc.status === ActionStatusEnum.COMPLETED && doc.result) {
      return doc.result as ActionResultDTO;
    }

    // 3. Expiration check
    if (new Date() > new Date(doc.expiresAt)) {
      await this.repository.atomicTransitionStatus(
        proposalId,
        doc.status,
        ActionStatusEnum.EXPIRED,
        { error: "Proposal expired before approval" }
      );
      throw new AppError(
        "This proposal has expired. Please generate a fresh recommendation.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.ACTION_EXPIRED
      );
    }

    // 4. Stale check: source entity changes since creation
    const registration = this.registry.get(doc.actionType);
    const staleResult = await registration.executor.checkStale(this.toDTO(doc));
    if (staleResult.isStale) {
      await this.repository.atomicTransitionStatus(
        proposalId,
        doc.status,
        ActionStatusEnum.STALE,
        { error: staleResult.reason || "Target entity has changed since proposal creation" }
      );
      throw new AppError(
        staleResult.reason || "Target entity has changed. Please review the updated version.",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.ACTION_STALE
      );
    }

    // 5. State machine transition check: must be in PROPOSED status
    ActionStateMachine.assertTransition(doc.status, ActionStatusEnum.APPROVED);

    // 6. Concurrency / Double-execution protection: atomic lock to EXECUTING
    const executingDoc = await this.repository.atomicTransitionStatus(
      proposalId,
      ActionStatusEnum.PROPOSED,
      ActionStatusEnum.EXECUTING
    );

    if (!executingDoc) {
      // Another concurrent thread or process captured the proposal
      const freshDoc = await this.repository.findByProposalId(proposalId);
      if (freshDoc?.status === ActionStatusEnum.COMPLETED && freshDoc.result) {
        return freshDoc.result as ActionResultDTO;
      }
      throw new AppError(
        "Proposal is currently being executed or has already been processed.",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.ACTION_ALREADY_APPROVED
      );
    }

    // 7. Execute deterministic business service
    const executionContext: ActionExecutionContext = {
      userId,
      proposalId,
      idempotencyKey: contextInfo?.idempotencyKey,
      ip: contextInfo?.ip,
      userAgent: contextInfo?.userAgent,
    };

    let executionResult: any;
    try {
      executionResult = await registration.executor.execute(
        doc.payload,
        executionContext
      );
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Action execution encountered an unexpected error";
      await this.repository.atomicTransitionStatus(
        proposalId,
        ActionStatusEnum.EXECUTING,
        ActionStatusEnum.FAILED,
        { error: errMsg }
      );
      throw new AppError(
        `Action execution failed: ${errMsg}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.ACTION_EXECUTION_FAILED
      );
    }

    // 8. Read-back verification
    const verification = await registration.executor.verify(
      executionResult,
      executionContext
    );

    // 9. Construct final verified ActionResultDTO
    const actionResult: ActionResultDTO = {
      proposalId,
      status: "COMPLETED",
      summary: `Successfully executed ${doc.actionType} for candidate.`,
      affectedEntity: {
        type: doc.targetEntity.type,
        id: doc.targetEntity.id,
      },
      verification: {
        verified: verification.verified,
        metrics: verification.metrics,
        scoreDelta: executionResult?.scoreDelta,
        newVersion: executionResult?.newDocumentVersion || executionResult?.version,
      },
      executedAt: new Date().toISOString(),
    };

    // 10. Mark COMPLETED with persisted result
    await this.repository.atomicTransitionStatus(
      proposalId,
      ActionStatusEnum.EXECUTING,
      ActionStatusEnum.COMPLETED,
      { result: actionResult }
    );

    return actionResult;
  }

  private toDTO(doc: IActionProposal): ActionProposalDTO {
    return {
      proposalId: doc.proposalId,
      ownerId: doc.ownerId,
      actionType: doc.actionType,
      status: doc.status,
      title: doc.title,
      description: doc.description,
      rationale: doc.rationale,
      evidenceIds: doc.evidenceIds || [],
      targetEntity: doc.targetEntity,
      preview: doc.preview,
      payload: doc.payload,
      result: (doc.result as ActionResultDTO) || null,
      error: doc.error || null,
      idempotencyKey: doc.idempotencyKey || null,
      expiresAt: doc.expiresAt.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
