export type ActionType =
  | "RESUME_UPDATE"
  | "PROFILE_UPDATE"
  | "CAREER_PLAN_CREATE";

export type ActionStatus =
  | "PROPOSED"
  | "APPROVED"
  | "EXECUTING"
  | "COMPLETED"
  | "FAILED"
  | "REJECTED"
  | "EXPIRED"
  | "STALE";

export interface ActionTargetEntity {
  type: "resume" | "profile" | "career_plan";
  id: string;
  version?: number;
}

export interface ActionPreview {
  before: any;
  after: any;
  diffSummary?: string;
}

export interface ActionProposal {
  proposalId: string;
  ownerId: string;
  actionType: ActionType;
  status: ActionStatus;
  title: string;
  description: string;
  rationale: string;
  evidenceIds: string[];
  targetEntity: ActionTargetEntity;
  preview: ActionPreview;
  payload: Record<string, any>;
  result?: ActionResult | null;
  error?: string | null;
  idempotencyKey?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionResult {
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

export interface CreateProposalDTO {
  actionType: ActionType;
  title: string;
  description: string;
  rationale: string;
  evidenceIds?: string[];
  targetEntity: ActionTargetEntity;
  preview: ActionPreview;
  payload: Record<string, any>;
  idempotencyKey?: string;
}

export class ActionService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = "/api/ai/actions") {
    this.baseUrl = baseUrl;
  }

  public async createProposal(data: CreateProposalDTO): Promise<ActionProposal> {
    const res = await fetch(`${this.baseUrl}/proposals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || json.error || "Failed to create action proposal");
    }

    return json.data as ActionProposal;
  }

  public async getProposal(proposalId: string): Promise<ActionProposal> {
    const res = await fetch(`${this.baseUrl}/${encodeURIComponent(proposalId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || json.error || "Failed to retrieve action proposal");
    }

    return json.data as ActionProposal;
  }

  public async listProposals(status?: ActionStatus): Promise<ActionProposal[]> {
    const url = status
      ? `${this.baseUrl}/proposals?status=${encodeURIComponent(status)}`
      : `${this.baseUrl}/proposals`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || json.error || "Failed to list action proposals");
    }

    return json.data as ActionProposal[];
  }

  public async approveProposal(
    proposalId: string,
    idempotencyKey?: string
  ): Promise<ActionResult> {
    const res = await fetch(`${this.baseUrl}/${encodeURIComponent(proposalId)}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ idempotencyKey }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || json.error || "Failed to approve and execute action");
    }

    return json.data as ActionResult;
  }

  public async rejectProposal(
    proposalId: string,
    reason?: string
  ): Promise<ActionProposal> {
    const res = await fetch(`${this.baseUrl}/${encodeURIComponent(proposalId)}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ reason }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || json.error || "Failed to reject action proposal");
    }

    return json.data as ActionProposal;
  }
}

export const actionService = new ActionService();
