import { Router } from "express";
import { LearningHubController } from "./learning-hub.controller";
import { pdfUploadMiddleware } from "@/core/middleware/pdf-upload.middleware";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { requireRole } from "@/core/auth/middleware/requireRole";
import { UserRole } from "@/core/constants/enums";

export const learningHubRouter = Router();

// 1. Public / Learner Catalog & Content Routes
learningHubRouter.get("/catalog", LearningHubController.getCatalog);
learningHubRouter.get("/tracks/:slug", LearningHubController.getTrack);
learningHubRouter.get("/resources/:id", LearningHubController.getResource);

// 2. Learner Authenticated Progress & Intelligence Routes
learningHubRouter.get("/personalized", requireAuth, LearningHubController.getPersonalized);
learningHubRouter.get("/stats", requireAuth, LearningHubController.getUserStats);
learningHubRouter.post("/tracks/:id/enroll", requireAuth, LearningHubController.enrollTrack);
learningHubRouter.post("/resources/:id/progress", requireAuth, LearningHubController.toggleResourceProgress);

// 3. PDF Vault & Question Bank Routes
learningHubRouter.get("/vault/pdfs", LearningHubController.listPdfs);
learningHubRouter.get("/vault/pdfs/:id", LearningHubController.getPdf);
learningHubRouter.get("/vault/pdfs/:id/preview", LearningHubController.previewPdf);
learningHubRouter.post("/vault/pdfs/:id/convert-to-quiz", requireAuth, LearningHubController.convertToQuiz);

// 4. Practice Arena & AI Quiz Runner Routes
learningHubRouter.get("/practice/drills", LearningHubController.listPracticeDrills);
learningHubRouter.post("/practice/generate-blitz", requireAuth, LearningHubController.generateBlitz);
learningHubRouter.get("/resources/:id/questions", requireAuth, LearningHubController.getResourceQuestions);
learningHubRouter.post("/resources/:id/submit-quiz", requireAuth, LearningHubController.submitQuiz);
learningHubRouter.post("/resources/:id/claim-verification", requireAuth, LearningHubController.claimVerification);

// 5. Admin Routes - Strictly Protected (requireAuth + requireRole(ADMIN))
const adminRouter = Router();
adminRouter.use(requireAuth, requireRole([UserRole.ADMIN]));

// Admin PDF & Ingestion
adminRouter.post(
  "/upload-pdf",
  pdfUploadMiddleware.single("file"),
  LearningHubController.uploadPdf
);
adminRouter.delete("/pdfs/:id", LearningHubController.deletePdf);
adminRouter.post("/generate-drill", LearningHubController.generateSkillDrill);

// Admin Track & Curriculum Management
adminRouter.get("/tracks", LearningHubController.adminListTracks);
adminRouter.post("/tracks", LearningHubController.adminCreateTrack);
adminRouter.put("/tracks/:id", LearningHubController.adminUpdateTrack);
adminRouter.delete("/tracks/:id", LearningHubController.adminDeleteTrack);

// Admin Module Management
adminRouter.post("/tracks/:id/modules", LearningHubController.adminAddModule);
adminRouter.put("/tracks/:id/modules/:moduleId", LearningHubController.adminUpdateModule);
adminRouter.delete("/tracks/:id/modules/:moduleId", LearningHubController.adminDeleteModule);

// Admin Resource (Lesson / External Doc / Video) Management
adminRouter.post(
  "/tracks/:id/modules/:moduleId/resources",
  LearningHubController.adminCreateResource
);
adminRouter.put("/resources/:id", LearningHubController.adminUpdateResource);
adminRouter.delete(
  "/tracks/:id/modules/:moduleId/resources/:resourceId",
  LearningHubController.adminDeleteResource
);

learningHubRouter.use("/admin", adminRouter);
