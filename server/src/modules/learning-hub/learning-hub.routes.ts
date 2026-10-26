import { Router } from "express";
import { LearningHubController } from "./learning-hub.controller";
import { pdfUploadMiddleware } from "@/core/middleware/pdf-upload.middleware";

export const learningHubRouter = Router();

// Public / Learner Catalog & Personalized Routes
learningHubRouter.get("/catalog", LearningHubController.getCatalog);
learningHubRouter.get("/personalized", LearningHubController.getPersonalized);
learningHubRouter.get("/stats", LearningHubController.getUserStats);
learningHubRouter.get("/tracks/:slug", LearningHubController.getTrack);

// Interactive Progress Routes
learningHubRouter.post("/tracks/:id/enroll", LearningHubController.enrollTrack);
learningHubRouter.post("/resources/:id/progress", LearningHubController.toggleResourceProgress);

// PDF Vault & Question Bank Routes
learningHubRouter.get("/vault/pdfs", LearningHubController.listPdfs);
learningHubRouter.get("/vault/pdfs/:id", LearningHubController.getPdf);
learningHubRouter.get("/vault/pdfs/:id/preview", LearningHubController.previewPdf);
learningHubRouter.post("/vault/pdfs/:id/convert-to-quiz", LearningHubController.convertToQuiz);

// Admin & AI Ingestion Routes
learningHubRouter.post(
  "/admin/upload-pdf",
  pdfUploadMiddleware.single("file"),
  LearningHubController.uploadPdf
);
learningHubRouter.post("/admin/generate-drill", LearningHubController.generateSkillDrill);

// Practice Arena & AI Quiz Runner Routes
learningHubRouter.get("/practice/drills", LearningHubController.listPracticeDrills);
learningHubRouter.post("/practice/generate-blitz", LearningHubController.generateBlitz);
learningHubRouter.get("/resources/:id/questions", LearningHubController.getResourceQuestions);
learningHubRouter.post("/resources/:id/submit-quiz", LearningHubController.submitQuiz);
learningHubRouter.post("/resources/:id/claim-verification", LearningHubController.claimVerification);
