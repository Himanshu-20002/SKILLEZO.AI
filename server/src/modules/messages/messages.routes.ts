import { Router } from "express";
import { MessagesController } from "./messages.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();

// Require authenticated user (Candidate or Recruiter)
router.use(requireAuth);

// List active conversations for current user
router.get("/conversations", asyncHandler(MessagesController.getConversations));

// Get conversation message thread
router.get("/conversations/:id", asyncHandler(MessagesController.getConversationMessages));

// Send a message in a conversation
router.post("/conversations/:id/messages", asyncHandler(MessagesController.sendMessage));

// Schedule an interview for an application
router.post("/applications/:id/schedule-interview", asyncHandler(MessagesController.scheduleInterview));

// Extend official job offer for an application
router.post("/applications/:id/send-offer", asyncHandler(MessagesController.sendOffer));

// Candidate responds to job offer (accept / decline)
router.post("/applications/:id/respond-offer", asyncHandler(MessagesController.respondOffer));

export const messagesRouter = router;
export default router;
