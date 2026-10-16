import { Router } from "express";
import { billingController } from "./billing.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { asyncHandler } from "@/core/utils/asyncHandler";

const router = Router();

// Public billing configuration & pricing
router.get("/config", asyncHandler(billingController.getBillingConfig.bind(billingController)));

// Webhook listener (Public, verified via cryptographic signature)
router.post("/razorpay/webhook", asyncHandler(billingController.handleWebhook.bind(billingController)));

// Authenticated Razorpay billing routes
router.post(
  "/razorpay/create-order",
  requireAuth,
  asyncHandler(billingController.createRazorpayOrder.bind(billingController))
);

router.post(
  "/razorpay/verify",
  requireAuth,
  asyncHandler(billingController.verifyPayment.bind(billingController))
);

export const billingRouter = router;
