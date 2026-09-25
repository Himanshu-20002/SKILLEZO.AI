import { Request, Response } from "express";
import {
  tailoringPlanService,
  TailoringPlanService,
} from "./tailoring-plan.service";
import {
  CreateTailoringPlanInputSchema,
  UpdateProposalDecisionSchema,
  BatchProposalDecisionsSchema,
  RegeneratePlanInputSchema,
  toTailoringPlanDTO,
} from "./job-tailoring.types";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class TailoringPlanController {
  constructor(private readonly service: TailoringPlanService = tailoringPlanService) {}

  /**
   * POST /api/job-profiles/:id/tailoring-plan
   * Generate or retrieve active Tailoring Plan.
   */
  createOrGetPlan = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;
    const { intensity, force } = CreateTailoringPlanInputSchema.parse(req.body || {});

    const { plan, isStale } = await this.service.createOrGetPlan(
      userId,
      jobProfileId,
      intensity,
      force
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse({
        tailoringPlan: toTailoringPlanDTO(plan),
        isStale,
      })
    );
  };

  /**
   * GET /api/job-profiles/:id/tailoring-plan
   * Retrieve active Tailoring Plan with dynamic staleness.
   */
  getPlan = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;

    const { plan, isStale } = await this.service.getPlan(userId, jobProfileId);

    res.status(HTTP_STATUS.OK).json(
      successResponse({
        tailoringPlan: plan ? toTailoringPlanDTO(plan) : null,
        isStale,
      })
    );
  };

  /**
   * PATCH /api/job-profiles/:id/tailoring-plan/proposals/:proposalId
   * Submit user decision for a specific proposal.
   */
  updateProposalDecision = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;
    const proposalId = req.params.proposalId as string;
    const { decision, editedValue } = UpdateProposalDecisionSchema.parse(req.body);

    const { plan, isStale } = await this.service.updateProposalDecision(
      userId,
      jobProfileId,
      proposalId,
      decision,
      editedValue
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse({
        tailoringPlan: toTailoringPlanDTO(plan),
        isStale,
      })
    );
  };

  /**
   * POST /api/job-profiles/:id/tailoring-plan/batch-decisions
   * Apply decisions for multiple proposals safely.
   */
  batchUpdateDecisions = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;
    const { updates } = BatchProposalDecisionsSchema.parse(req.body);

    const { plan, isStale } = await this.service.batchUpdateDecisions(
      userId,
      jobProfileId,
      updates
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse({
        tailoringPlan: toTailoringPlanDTO(plan),
        isStale,
      })
    );
  };

  /**
   * POST /api/job-profiles/:id/tailoring-plan/regenerate
   * Regenerate proposals with optional intensity change.
   */
  regeneratePlan = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.id;
    const jobProfileId = req.params.id as string;
    const { intensity, force } = RegeneratePlanInputSchema.parse(req.body || {});

    const { plan, isStale } = await this.service.regeneratePlan(
      userId,
      jobProfileId,
      intensity,
      force
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse({
        tailoringPlan: toTailoringPlanDTO(plan),
        isStale,
      })
    );
  };
}

export const tailoringPlanController = new TailoringPlanController();
