import { Router } from "express";
import { ProfileController } from "./profile.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { validate } from "@/core/middleware/validate.middleware";
import { asyncHandler } from "@/core/utils/asyncHandler";
import {
  createProfileValidator,
  updateProfileValidator,
  addSkillValidator,
  updateSkillsValidator,
  updateEducationValidator,
  updateExperienceValidator,
  updateLinksValidator,
  updateTargetRoleValidator,
  profileProjectValidator,
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

router.post(
  "/me/skills",
  requireAuth,
  validate({ body: addSkillValidator }),
  asyncHandler(controller.addSkill)
);

router.delete(
  "/me/skills/:skillName",
  requireAuth,
  asyncHandler(controller.deleteSkill)
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

router.post(
  "/me/projects",
  requireAuth,
  validate({ body: profileProjectValidator }),
  asyncHandler(controller.addProject)
);

router.post(
  "/me/projects/seed",
  requireAuth,
  asyncHandler(controller.seedSampleProjects)
);

router.patch(
  "/me/projects/:projectId",
  requireAuth,
  validate({ body: profileProjectValidator.partial() }),
  asyncHandler(controller.updateProject)
);

router.delete(
  "/me/projects/:projectId",
  requireAuth,
  asyncHandler(controller.deleteProject)
);

export default router;

