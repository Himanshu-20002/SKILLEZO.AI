import { Router } from "express";
import { VerificationController } from "./verification.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();

// Catalog of available assessments with completion flags
router.get("/catalog", requireAuth, asyncHandler(VerificationController.getCatalog));

// Fetch assessment questions (sanitized without answers)
router.get("/assessments/:topicId", requireAuth, asyncHandler(VerificationController.getQuiz));

// Submit assessment answers & mint cryptographic credential
router.post("/assessments/:topicId/submit", requireAuth, asyncHandler(VerificationController.submitQuiz));

// Fetch candidate's verification records
router.get("/records", requireAuth, asyncHandler(VerificationController.getUserRecords));

// Public endpoint to verify cryptographic credential badge
router.get("/credentials/:credentialHash", asyncHandler(VerificationController.verifyCredential));

export const verificationRouter = router;
export default router;
