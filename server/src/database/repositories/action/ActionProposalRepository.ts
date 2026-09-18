import { BaseRepository } from "../base";
import {
  ActionProposalModel,
  IActionProposal,
  ActionStatus,
} from "@/database/models/ActionProposal.model";
import { UpdateQuery } from "mongoose";

export class ActionProposalRepository extends BaseRepository<IActionProposal> {
  constructor() {
    super(ActionProposalModel, "ActionProposal");
  }

  async findByProposalId(proposalId: string): Promise<IActionProposal | null> {
    return await this.findOne({ proposalId });
  }

  async findByOwnerId(
    ownerId: string,
    status?: ActionStatus
  ): Promise<IActionProposal[]> {
    const filter: Record<string, any> = { ownerId };
    if (status) {
      filter.status = status;
    }
    return await this.findMany(filter, { sort: { createdAt: -1 } });
  }

  async findByIdempotencyKey(
    ownerId: string,
    idempotencyKey: string
  ): Promise<IActionProposal | null> {
    return await this.findOne({ ownerId, idempotencyKey });
  }

  /**
   * Atomically transitions proposal status to prevent race conditions & double-execution.
   */
  async atomicTransitionStatus(
    proposalId: string,
    expectedStatus: ActionStatus,
    targetStatus: ActionStatus,
    extraUpdates: Partial<IActionProposal> = {}
  ): Promise<IActionProposal | null> {
    const updateDoc: UpdateQuery<IActionProposal> = {
      $set: {
        status: targetStatus,
        ...extraUpdates,
      },
    };

    return await this.model
      .findOneAndUpdate(
        { proposalId, status: expectedStatus },
        updateDoc,
        { new: true, runValidators: true }
      )
      .exec();
  }
}
