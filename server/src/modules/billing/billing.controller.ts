import { Request, Response } from "express";
import { billingService } from "./billing.service";
import { CreateRazorpayOrderSchema, VerifyRazorpayPaymentSchema } from "./billing.dto";
import { BILLING_PLANS, BILLING_CURRENCY } from "./billing.constants";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { env } from "@/core/config/env";
import { razorpayService } from "./razorpay.service";

export class BillingController {
  /**
   * Generates a new Razorpay checkout order for the authenticated candidate.
   * Route: POST /api/billing/razorpay/create-order
   */
  async createRazorpayOrder(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user || !user.id) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const validatedInput = CreateRazorpayOrderSchema.parse(req.body);

    const orderData = await billingService.createRazorpayOrder(
      user.id,
      user.email || "",
      user.name || "",
      validatedInput
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: orderData,
    });
  }

  /**
   * Verifies the Razorpay payment signature and upgrades account to Pro with 100,000 tokens.
   * Route: POST /api/billing/razorpay/verify
   */
  async verifyPayment(req: Request, res: Response) {
    const user = (req as any).user;
    if (!user || !user.id) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
    }

    const validatedInput = VerifyRazorpayPaymentSchema.parse(req.body);

    const result = await billingService.verifyPayment(user.id, validatedInput);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
      data: result,
    });
  }

  /**
   * Handles asynchronous webhooks from Razorpay.
   * Route: POST /api/billing/razorpay/webhook
   */
  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers["x-razorpay-signature"] as string;
    if (!signature) {
      throw new AppError("Missing x-razorpay-signature header", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    await billingService.handleRazorpayWebhook(rawBody, signature);

    return res.status(HTTP_STATUS.OK).json({ received: true });
  }

  /**
   * Returns public billing configuration, pricing, and gateway mode.
   * Route: GET /api/billing/config
   */
  async getBillingConfig(_req: Request, res: Response) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        currency: BILLING_CURRENCY,
        plans: BILLING_PLANS,
        isMockMode: env.MOCK_BILLING_ENABLED || !razorpayService.isConfigured,
        keyId: razorpayService.keyId,
      },
    });
  }
}

export const billingController = new BillingController();
