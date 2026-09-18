import { ActionStatus, ActionStatusEnum } from "./action-types";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class ActionStateMachine {
  private static readonly VALID_TRANSITIONS: Record<ActionStatus, ActionStatus[]> = {
    [ActionStatusEnum.PROPOSED]: [
      ActionStatusEnum.APPROVED,
      ActionStatusEnum.REJECTED,
      ActionStatusEnum.EXPIRED,
      ActionStatusEnum.STALE,
    ],
    [ActionStatusEnum.APPROVED]: [
      ActionStatusEnum.EXECUTING,
      ActionStatusEnum.FAILED,
    ],
    [ActionStatusEnum.EXECUTING]: [
      ActionStatusEnum.COMPLETED,
      ActionStatusEnum.FAILED,
    ],
    [ActionStatusEnum.COMPLETED]: [], // Terminal state
    [ActionStatusEnum.FAILED]: [],    // Terminal state
    [ActionStatusEnum.REJECTED]: [],  // Terminal state
    [ActionStatusEnum.EXPIRED]: [],   // Terminal state
    [ActionStatusEnum.STALE]: [],     // Terminal state
  };

  public static canTransition(from: ActionStatus, to: ActionStatus): boolean {
    const allowed = this.VALID_TRANSITIONS[from] || [];
    return allowed.includes(to);
  }

  public static assertTransition(from: ActionStatus, to: ActionStatus): void {
    if (!this.canTransition(from, to)) {
      throw new AppError(
        `Invalid action state transition from '${from}' to '${to}'`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_ACTION_STATE_TRANSITION as any
      );
    }
  }

  public static isTerminal(status: ActionStatus): boolean {
    return (
      status === ActionStatusEnum.COMPLETED ||
      status === ActionStatusEnum.FAILED ||
      status === ActionStatusEnum.REJECTED ||
      status === ActionStatusEnum.EXPIRED ||
      status === ActionStatusEnum.STALE
    );
  }
}
