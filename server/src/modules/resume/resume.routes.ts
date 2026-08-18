import { Router } from "express";
import { ResumeController } from "./resume.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { resumeUploadMiddleware } from "@/core/middleware/upload.middleware";
import { validate } from "@/core/middleware/validate.middleware";
import { uploadResumeValidator, updateResumeValidator, resumeIdParamValidator } from "./resume.validator";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();
const controller = new ResumeController();

router.use(requireAuth);

router.post(
  "/upload",
  resumeUploadMiddleware.single("file"),
  validate({ body: uploadResumeValidator }),
  asyncHandler(controller.uploadResume)
);

router.get(
  "/",
  asyncHandler(controller.getUserResumes)
);

router.get(
  "/:resumeId",
  validate({ params: resumeIdParamValidator }),
  asyncHandler(controller.getResumeById)
);

router.get(
  "/:resumeId/download",
  validate({ params: resumeIdParamValidator }),
  asyncHandler(controller.downloadResume)
);

router.put(
  "/:resumeId/default",
  validate({ params: resumeIdParamValidator }),
  asyncHandler(controller.setDefaultResume)
);

router.patch(
  "/:resumeId",
  validate({ params: resumeIdParamValidator, body: updateResumeValidator }),
  asyncHandler(controller.updateResume)
);

router.delete(
  "/:resumeId",
  validate({ params: resumeIdParamValidator }),
  asyncHandler(controller.deleteResume)
);

export default router;
