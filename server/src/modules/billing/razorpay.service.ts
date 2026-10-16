import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "@/core/config/env";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export interface CreateOrderParams {
  amountInPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

export class RazorpayService {
  private razorpayInstance: Razorpay | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const keyId = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.razorpayInstance = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  public get isConfigured(): boolean {
    return !!(this.razorpayInstance && (env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID));
  }

  public get keyId(): string {
    return env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
  }

  /**
   * Creates an order with Razorpay.
   */
  async createOrder(params: CreateOrderParams): Promise<RazorpayOrderResult> {
    if (!this.razorpayInstance) {
      throw new AppError(
        "Razorpay credentials are not configured on the server",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    try {
      const order = await this.razorpayInstance.orders.create({
        amount: params.amountInPaise,
        currency: params.currency,
        receipt: params.receipt,
        notes: params.notes,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
      };
    } catch (error: any) {
      console.error("[RazorpayService] createOrder failed:", error);
      throw new AppError(
        error.message || "Failed to create Razorpay order",
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.SERVICE_UNAVAILABLE
      );
    }
  }

  /**
   * Cryptographically verifies the payment signature using HMAC SHA256.
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const secret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new AppError(
        "RAZORPAY_KEY_SECRET is not configured",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_SERVER_ERROR
      );
    }

    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(signature, "utf8")
    );
  }

  /**
   * Cryptographically verifies webhook events from Razorpay.
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"))
      .digest("hex");

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(signature, "utf8")
      );
    } catch {
      return false;
    }
  }
}

export const razorpayService = new RazorpayService();
