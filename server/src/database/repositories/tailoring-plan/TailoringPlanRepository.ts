import { BaseRepository } from "../base/BaseRepository";
import {
  ITailoringPlan,
  TailoringPlanModel,
  UserProposalDecision,
  ITailoringProposal,
} from "../../models/TailoringPlan.model";

export class TailoringPlanRepository extends BaseRepository<ITailoringPlan> {
  constructor() {
    super(TailoringPlanModel, "TailoringPlan");
  }

  /**
   * Find a TailoringPlan by user ID and JobProfile ID.
   */
  async findByUserAndJobProfile(
    userId: string,
    jobProfileId: string
  ): Promise<ITailoringPlan | null> {
    return this.model.findOne({ userId, jobProfileId }).exec();
  }

  /**
   * Upsert a TailoringPlan document for a specific user and JobProfile.
   * Atomically replaces or creates the plan without duplicate-key errors.
   */
  async upsertPlan(
    userId: string,
    jobProfileId: string,
    planData: Partial<ITailoringPlan>
  ): Promise<ITailoringPlan> {
    const existing = await this.findByUserAndJobProfile(userId, jobProfileId);
    const planVersion = existing ? (existing.planVersion || 1) + 1 : 1;

    const updated = await this.model
      .findOneAndUpdate(
        { userId, jobProfileId },
        {
          $set: {
            ...planData,
            userId,
            jobProfileId,
            planVersion,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after", upsert: true, runValidators: true }
      )
      .exec();

    return updated as ITailoringPlan;
  }

  /**
   * Update the decision for a single proposal within a user's plan.
   * Recalculates summary counts and updates status appropriately.
   */
  async updateProposalDecision(
    userId: string,
    jobProfileId: string,
    proposalId: string,
    decision: UserProposalDecision,
    editedValue?: string | null
  ): Promise<ITailoringPlan | null> {
    const plan = await this.findByUserAndJobProfile(userId, jobProfileId);
    if (!plan) return null;

    const proposalIndex = plan.proposals.findIndex((p) => p.id === proposalId);
    if (proposalIndex === -1) return null;

    // Reject modifying protected DO_NOT_ADD proposals
    if (plan.proposals[proposalIndex].isProtected) {
      throw new Error(`Cannot manually override protected exclusion: ${proposalId}`);
    }

    plan.proposals[proposalIndex].userDecision = decision;
    plan.proposals[proposalIndex].updatedAt = new Date();

    if (decision === "EDITED" && editedValue !== undefined) {
      plan.proposals[proposalIndex].userEditedValue = editedValue;
    } else if (decision !== "EDITED") {
      plan.proposals[proposalIndex].userEditedValue = null;
    }

    // Recalculate summary metrics
    this.recalculatePlanSummary(plan);

    await plan.save();
    return plan;
  }

  /**
   * Batch update decisions for multiple proposals safely within a plan.
   */
  async batchUpdateDecisions(
    userId: string,
    jobProfileId: string,
    updates: Array<{ proposalId: string; decision: UserProposalDecision; editedValue?: string | null }>
  ): Promise<ITailoringPlan | null> {
    const plan = await this.findByUserAndJobProfile(userId, jobProfileId);
    if (!plan) return null;

    for (const update of updates) {
      const idx = plan.proposals.findIndex((p) => p.id === update.proposalId);
      if (idx !== -1 && !plan.proposals[idx].isProtected) {
        plan.proposals[idx].userDecision = update.decision;
        plan.proposals[idx].updatedAt = new Date();
        if (update.decision === "EDITED" && update.editedValue !== undefined) {
          plan.proposals[idx].userEditedValue = update.editedValue;
        } else if (update.decision !== "EDITED") {
          plan.proposals[idx].userEditedValue = null;
        }
      }
    }

    this.recalculatePlanSummary(plan);
    await plan.save();
    return plan;
  }

  /**
   * Recomputes summary metrics and updates plan status (e.g. IN_REVIEW or APPROVED).
   */
  public recalculatePlanSummary(plan: ITailoringPlan): void {
    const proposals = plan.proposals || [];
    let pending = 0;
    let accepted = 0;
    let edited = 0;
    let rejected = 0;
    let doNotAdd = 0;
    let actionableTotal = 0;

    for (const p of proposals) {
      if (p.isProtected || p.action === "DO_NOT_ADD") {
        doNotAdd++;
      } else {
        actionableTotal++;
        if (p.userDecision === "ACCEPTED") accepted++;
        else if (p.userDecision === "EDITED") edited++;
        else if (p.userDecision === "REJECTED") rejected++;
        else pending++;
      }
    }

    plan.summary = {
      totalProposals: proposals.length,
      actionableTotal,
      pending,
      accepted,
      edited,
      rejected,
      doNotAdd,
    };

    // Update status based on progress
    if (plan.status !== "STALE") {
      if (pending === 0 && actionableTotal > 0 && (accepted > 0 || edited > 0)) {
        plan.status = "APPROVED";
      } else if (accepted > 0 || edited > 0 || rejected > 0) {
        plan.status = "IN_REVIEW";
      } else {
        plan.status = "READY_FOR_REVIEW";
      }
    }
  }
}

export const tailoringPlanRepository = new TailoringPlanRepository();
