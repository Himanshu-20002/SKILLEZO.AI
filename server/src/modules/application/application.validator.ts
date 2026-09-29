import { z } from "zod";
import { ApplicationStatus } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createApplicationValidator = z.object({
  jobId: z.string().trim().regex(objectIdRegex, "Invalid jobId ObjectId format"),
  resumeId: z.string().trim().regex(objectIdRegex, "Invalid resumeId ObjectId format").optional(),
});

export const createJobProfileApplicationValidator = z.object({
  jobProfileId: z.string().trim().regex(objectIdRegex, "Invalid jobProfileId format"),
  resumeId: z.string().trim().regex(objectIdRegex, "Invalid resumeId format"),
  status: z
    .enum([ApplicationStatus.DRAFT, ApplicationStatus.APPLIED])
    .optional()
    .default(ApplicationStatus.DRAFT),
});

export const updateApplicationStatusValidator = z.object({
  status: z.enum(Object.values(ApplicationStatus) as [string, ...string[]]),
  reason: z.string().trim().max(1000).optional(),
});

export const addTimelineNoteValidator = z.object({
  note: z.string().trim().min(1, "Note cannot be empty").max(2000, "Note too long"),
});

export const applicationIdParamValidator = z.object({
  applicationId: z.string().trim().regex(objectIdRegex, "Invalid applicationId ObjectId format"),
});

export const getApplicationsQueryValidator = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive())
    .optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(100))
    .optional(),
  status: z.string().optional(),
  jobProfileId: z.string().trim().regex(objectIdRegex).optional(),
  source: z.string().optional(),
  search: z.string().trim().optional(),
});

export const withdrawApplicationValidator = z
  .object({
    reason: z.string().trim().max(500).optional(),
  })
  .default({});

/**
 * Validates status transitions based on the Phase 6F transition state machine.
 */
export function validateStatusTransition(
  fromStatus: ApplicationStatus,
  toStatus: ApplicationStatus
): void {
  if (fromStatus === toStatus) {
    throw new AppError(
      `Application is already in '${toStatus}' status`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION
    );
  }

  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.DRAFT]: [
      ApplicationStatus.APPLIED,
      ApplicationStatus.WITHDRAWN,
    ],
    [ApplicationStatus.APPLIED]: [
      ApplicationStatus.UNDER_REVIEW,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ],
    [ApplicationStatus.UNDER_REVIEW]: [
      ApplicationStatus.SHORTLISTED,
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ],
    [ApplicationStatus.SHORTLISTED]: [
      ApplicationStatus.INTERVIEW,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ],
    [ApplicationStatus.INTERVIEW]: [
      ApplicationStatus.OFFERED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ],
    [ApplicationStatus.OFFERED]: [
      ApplicationStatus.HIRED,
      ApplicationStatus.REJECTED,
      ApplicationStatus.WITHDRAWN,
    ],
    [ApplicationStatus.HIRED]: [],
    [ApplicationStatus.REJECTED]: [],
    [ApplicationStatus.WITHDRAWN]: [],
  };

  const allowed = validTransitions[fromStatus] || [];
  if (!allowed.includes(toStatus)) {
    throw new AppError(
      `Cannot transition application status from '${fromStatus}' to '${toStatus}'`,
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.APPLICATION_INVALID_STATUS_TRANSITION
    );
  }
}
