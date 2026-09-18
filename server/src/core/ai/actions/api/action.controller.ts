import { Request, Response } from "express";
import { ActionExecutor } from "../action-executor";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class ActionController {
  constructor(
    private readonly actionExecutor: ActionExecutor = ActionExecutor.getInstance()
  ) {}

  createProposal = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const proposal = await this.actionExecutor.createProposal(userId, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: proposal,
    });
  };

  getProposal = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const proposalId = Array.isArray(req.params.proposalId)
      ? req.params.proposalId[0]
      : req.params.proposalId;
    const proposal = await this.actionExecutor.getProposal(userId, proposalId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: proposal,
    });
  };

  listProposals = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const { status } = req.query;
    const proposals = await this.actionExecutor.listProposals(userId, status as string);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: proposals,
    });
  };

  approveProposal = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const proposalId = Array.isArray(req.params.proposalId)
      ? req.params.proposalId[0]
      : req.params.proposalId;
    const idempotencyKey =
      req.body?.idempotencyKey ||
      (req.headers["idempotency-key"] as string | undefined);

    const result = await this.actionExecutor.approveAndExecute(
      userId,
      proposalId,
      {
        idempotencyKey,
        ip: req.ip,
        userAgent: req.get("user-agent"),
      }
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  rejectProposal = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user.id;
    const proposalId = Array.isArray(req.params.proposalId)
      ? req.params.proposalId[0]
      : req.params.proposalId;
    const reason = req.body?.reason;

    const proposal = await this.actionExecutor.rejectProposal(
      userId,
      proposalId,
      reason
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: proposal,
    });
  };
}
