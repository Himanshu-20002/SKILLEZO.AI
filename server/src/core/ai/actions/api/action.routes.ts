import { Router } from "express";
import { ActionController } from "./action.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { asyncHandler } from "@/core/utils/asyncHandler";
import {
  CreateActionProposalSchema,
  ApproveActionProposalSchema,
  RejectActionProposalSchema,
} from "../action-schemas";

const router = Router();
const controller = new ActionController();

// Enforce authenticated context across all action endpoints
router.use(requireAuth);

router.post(
  "/proposals",
  validate({ body: CreateActionProposalSchema }),
  asyncHandler(controller.createProposal)
);

router.get(
  "/proposals",
  asyncHandler(controller.listProposals)
);

router.get(
  "/:proposalId",
  asyncHandler(controller.getProposal)
);

router.post(
  "/:proposalId/approve",
  validate({ body: ApproveActionProposalSchema }),
  asyncHandler(controller.approveProposal)
);

router.post(
  "/:proposalId/reject",
  validate({ body: RejectActionProposalSchema }),
  asyncHandler(controller.rejectProposal)
);

export const actionRouter = router;
