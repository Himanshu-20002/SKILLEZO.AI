import {
  ActionExecutorInterface,
  ActionProposalDTO,
  ActionExecutionContext,
  ActionTypeEnum,
} from "../action-types";
import { CareerPlanModel } from "@/database/models/CareerPlan.model";
import { CareerPlanStatus } from "@/core/constants/enums";
import { Types } from "mongoose";

export class CareerPlanCreateExecutor implements ActionExecutorInterface {
  public readonly actionType = ActionTypeEnum.CAREER_PLAN_CREATE;

  public async checkStale(
    _proposal: ActionProposalDTO
  ): Promise<{ isStale: boolean; reason?: string }> {
    return { isStale: false };
  }

  public async execute(
    payload: {
      targetRole: string;
      roleId?: string;
      readinessScore: number;
      gapsData: any;
    },
    context: ActionExecutionContext
  ): Promise<any> {
    const { roleId, readinessScore, gapsData } = payload;

    // 1. Supersede any existing active plans for this candidate
    await CareerPlanModel.updateMany(
      { userId: context.userId, status: CareerPlanStatus.ACTIVE },
      { $set: { status: CareerPlanStatus.SUPERSEDED } }
    );

    // 2. Resolve or generate valid role ObjectId
    const resolvedRoleId =
      roleId && Types.ObjectId.isValid(roleId)
        ? new Types.ObjectId(roleId)
        : new Types.ObjectId();

    // 3. Create fresh active career plan
    const newPlan = await CareerPlanModel.create({
      userId: context.userId,
      roleId: resolvedRoleId,
      readinessScore: Math.min(100, Math.max(0, readinessScore || 0)),
      gapsData: gapsData || {
        matchedSkills: [],
        missingSkills: [],
        improvementSkills: [],
        strengths: [],
        summary: {
          totalSkillsRequired: 0,
          matchedCount: 0,
          missingCount: 0,
          improvementCount: 0,
          readinessScore: readinessScore || 0,
        },
      },
      status: CareerPlanStatus.ACTIVE,
    });

    return newPlan;
  }

  public async verify(
    result: any,
    _context: ActionExecutionContext
  ): Promise<{ verified: boolean; metrics?: any[] }> {
    if (!result || !result._id) {
      return { verified: false };
    }

    const metrics = [
      {
        metric: "Readiness Score",
        value: result.readinessScore ?? 0,
      },
    ];

    return {
      verified: true,
      metrics,
    };
  }
}
