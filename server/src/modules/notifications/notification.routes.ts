import { Router } from "express";
import { notificationController } from "./notification.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { requireRole } from "@/core/auth/middleware/requireRole";
import { UserRole } from "@/core/constants/enums";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();

// All notification routes require authenticated session
router.use(requireAuth);

// User-specific notification routes
router.get("/", asyncHandler(notificationController.getUserNotifications));
router.get("/unread-count", asyncHandler(notificationController.getUnreadCount));
router.patch("/read-all", asyncHandler(notificationController.markAllAsRead));
router.patch("/:id/read", asyncHandler(notificationController.markAsRead));

// Admin-only broadcast route
router.post(
  "/broadcast",
  requireRole([UserRole.ADMIN]),
  asyncHandler(notificationController.broadcastAnnouncement)
);

export const notificationRouter = router;
