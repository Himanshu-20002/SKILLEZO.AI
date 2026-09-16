import { Router } from "express";
import { AdminController } from "./admin.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { requireRole } from "@/core/auth/middleware/requireRole";
import { asyncHandler } from "@/core/utils/asyncHandler";
import { UserRole } from "@/core/constants/enums";

const router = Router();

// Enforce authentication & Administrator role across all admin routes
router.use(requireAuth, requireRole([UserRole.ADMIN]));

// 1. Live system & platform metrics
router.get("/metrics", asyncHandler(AdminController.getMetrics));

// 2. User directory & role/status moderation
router.get("/users", asyncHandler(AdminController.getUsers));
router.patch("/users/:userId/role", asyncHandler(AdminController.updateUserRole));
router.patch("/users/:userId/status", asyncHandler(AdminController.updateUserStatus));
router.delete("/users/:userId", asyncHandler(AdminController.deleteUser));

// 3. Job catalog & on-demand sync
router.get("/jobs", asyncHandler(AdminController.getJobs));
router.patch("/jobs/:jobId/status", asyncHandler(AdminController.updateJobStatus));
router.delete("/jobs/:jobId", asyncHandler(AdminController.deleteJob));
router.post("/jobs/trigger-sync", asyncHandler(AdminController.triggerJobIngestion));

// 4. Resumes & ATS intelligence
router.get("/resumes", asyncHandler(AdminController.getResumes));

export const adminRouter = router;
export default router;
