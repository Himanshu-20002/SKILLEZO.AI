import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { asyncHandler } from "@/core/utils/asyncHandler";
import {
  createProfileValidator,
  updateProfileValidator,
  updateSkillsValidator,
  updateEducationValidator,
  updateExperienceValidator,
  updateLinksValidator,
  updateTargetRoleValidator,
} from "./profile.validator";

const router = Router();
const controller = new ProfileController();

router.post(
  "/",
  requireAuth,
  validate({ body: createProfileValidator }),
  asyncHandler(controller.createProfile)
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(controller.getMyProfile)
);

router.patch(
  "/me",
  requireAuth,
  validate({ body: updateProfileValidator }),
  asyncHandler(controller.updateProfile)
);

router.patch(
  "/me/skills",
  requireAuth,
  validate({ body: updateSkillsValidator }),
  asyncHandler(controller.updateSkills)
);

router.patch(
  "/me/education",
  requireAuth,
  validate({ body: updateEducationValidator }),
  asyncHandler(controller.updateEducation)
);

router.patch(
  "/me/experience",
  requireAuth,
  validate({ body: updateExperienceValidator }),
  asyncHandler(controller.updateExperience)
);

router.patch(
  "/me/links",
  requireAuth,
  validate({ body: updateLinksValidator }),
  asyncHandler(controller.updateLinks)
);

router.patch(
  "/me/target-role",
  requireAuth,
  validate({ body: updateTargetRoleValidator }),
  asyncHandler(controller.updateTargetRole)
);

export default router;
