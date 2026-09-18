import {
  ActionTypeEnum,
  ActionStatusEnum,
  ActionType,
  ActionStatus,
  IActionTargetEntity,
  IActionPreview,
} from "@/database/models/ActionProposal.model";

export { ActionTypeEnum, ActionStatusEnum };
export type { ActionType, ActionStatus, IActionTargetEntity, IActionPreview };

export interface ActionProposalDTO {
  proposalId: string;
  ownerId: string;
  actionType: ActionType;
  status: ActionStatus;
  title: string;
  description: string;
  rationale: string;
  evidenceIds: string[];
  targetEntity: IActionTargetEntity;
  preview: IActionPreview;
  payload: Record<string, any>;
  result?: ActionResultDTO | null;
  error?: string | null;
  idempotencyKey?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionResultDTO {
  proposalId: string;
  status: "COMPLETED" | "FAILED";
  summary: string;
  affectedEntity: {
    type: "resume" | "profile" | "career_plan";
    id: string;
  };
  verification: {
    verified: boolean;
    metrics?: Array<{
      metric: string;
      value: number;
      delta?: number;
    }>;
    scoreDelta?: number;
    newVersion?: number;
  };
  executedAt: string;
}

export interface ActionExecutionAudit {
  proposalId: string;
  ownerId: string;
  actionType: ActionType;
  status: ActionStatus;
  timestamp: string;
  details?: Record<string, any>;
}

export interface ActionExecutionContext {
  userId: string;
  proposalId: string;
  idempotencyKey?: string;
  ip?: string;
  userAgent?: string;
}

export interface ActionExecutorInterface<TPayload = any, TResult = any> {
  actionType: ActionType;
  checkStale(proposal: ActionProposalDTO): Promise<{ isStale: boolean; reason?: string }>;
  execute(payload: TPayload, context: ActionExecutionContext): Promise<TResult>;
  verify(result: TResult, context: ActionExecutionContext): Promise<{ verified: boolean; metrics?: any[] }>;
}
