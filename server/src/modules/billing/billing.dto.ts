import { z } from "zod";

export const CreateRazorpayOrderSchema = z.object({
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional().default("MONTHLY"),
  tier: z.enum(["PRO"]).optional().default("PRO"),
});

export type CreateRazorpayOrderInput = z.input<typeof CreateRazorpayOrderSchema>;

export const VerifyRazorpayPaymentSchema = z.object({
  orderId: z.string().min(1, "Razorpay Order ID is required"),
  paymentId: z.string().min(1, "Razorpay Payment ID is required"),
  signature: z.string().min(1, "Razorpay Signature is required"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]).optional().default("MONTHLY"),
});

export type VerifyRazorpayPaymentInput = z.input<typeof VerifyRazorpayPaymentSchema>;
