import { ActionType, ActionTypeEnum, ActionExecutorInterface } from "./action-types";
import {
  ResumeUpdatePayloadSchema,
  ProfileUpdatePayloadSchema,
  CareerPlanCreatePayloadSchema,
} from "./action-schemas";
import { ResumeUpdateExecutor } from "./executors/resume-update.executor";
import { ProfileUpdateExecutor } from "./executors/profile-update.executor";
import { CareerPlanCreateExecutor } from "./executors/career-plan-create.executor";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { z } from "zod";

export interface ActionRegistration {
  actionType: ActionType;
  payloadSchema: z.ZodSchema<any>;
  executor: ActionExecutorInterface;
}

export class ActionRegistry {
  private static instance: ActionRegistry | null = null;
  private readonly registry = new Map<ActionType, ActionRegistration>();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ActionRegistry {
    if (!this.instance) {
      this.instance = new ActionRegistry();
    }
    return this.instance;
  }

  private registerDefaults(): void {
    this.register({
      actionType: ActionTypeEnum.RESUME_UPDATE,
      payloadSchema: ResumeUpdatePayloadSchema,
      executor: new ResumeUpdateExecutor(),
    });

    this.register({
      actionType: ActionTypeEnum.PROFILE_UPDATE,
      payloadSchema: ProfileUpdatePayloadSchema,
      executor: new ProfileUpdateExecutor(),
    });

    this.register({
      actionType: ActionTypeEnum.CAREER_PLAN_CREATE,
      payloadSchema: CareerPlanCreatePayloadSchema,
      executor: new CareerPlanCreateExecutor(),
    });
  }

  public register(registration: ActionRegistration): void {
    this.registry.set(registration.actionType, registration);
  }

  public get(actionType: string): ActionRegistration {
    const reg = this.registry.get(actionType as ActionType);
    if (!reg) {
      throw new AppError(
        `Unregistered or prohibited action type: '${actionType}'`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.UNREGISTERED_ACTION_TYPE
      );
    }
    return reg;
  }

  public has(actionType: string): boolean {
    return this.registry.has(actionType as ActionType);
  }

  public getAllowedActionTypes(): ActionType[] {
    return Array.from(this.registry.keys());
  }
}
