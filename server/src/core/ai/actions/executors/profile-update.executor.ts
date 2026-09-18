import {
  ActionExecutorInterface,
  ActionProposalDTO,
  ActionExecutionContext,
  ActionTypeEnum,
} from "../action-types";
import { ProfileService } from "@/modules/profile/profile.service";
import { ProfileRepository } from "@/database/repositories/profile/ProfileRepository";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class ProfileUpdateExecutor implements ActionExecutorInterface {
  public readonly actionType = ActionTypeEnum.PROFILE_UPDATE;

  constructor(
    private readonly profileService: ProfileService = new ProfileService(),
    private readonly profileRepository: ProfileRepository = new ProfileRepository()
  ) {}

  public async checkStale(
    proposal: ActionProposalDTO
  ): Promise<{ isStale: boolean; reason?: string }> {
    const profile = await this.profileRepository.findByUserId(proposal.ownerId);
    if (!profile) {
      // Profile does not exist yet; fresh creation is permitted and not considered stale
      return { isStale: false };
    }

    return { isStale: false };
  }

  public async execute(
    payload: { changes: Record<string, any> },
    context: ActionExecutionContext
  ): Promise<any> {
    const { changes } = payload;
    if (!changes || Object.keys(changes).length === 0) {
      throw new AppError(
        "No valid profile changes supplied in action payload",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Execute deterministic profile update
    const updatedProfile = await this.profileService.updateProfile(
      context.userId,
      changes
    );

    return updatedProfile;
  }

  public async verify(
    result: any,
    _context: ActionExecutionContext
  ): Promise<{ verified: boolean; metrics?: any[] }> {
    if (!result || !result._id) {
      return { verified: false };
    }

    const completion = result.completionPercentage ?? 0;
    const metrics = [
      {
        metric: "Profile Completion",
        value: completion,
      },
    ];

    return {
      verified: true,
      metrics,
    };
  }
}
