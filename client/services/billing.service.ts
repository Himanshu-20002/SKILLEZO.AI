import { apiFetch } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/razorpay";

export interface RazorpayOrderData {
  isMock: boolean;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  planName: string;
  planDescription: string;
  user: {
    name: string;
    email: string;
  };
}

export interface VerifyPaymentResult {
  success: boolean;
  tier: string;
  remainingTokens: number;
  totalAllowance: number;
  currentPeriodEnd: string;
  message: string;
}

export interface BillingConfig {
  currency: string;
  plans: Record<string, any>;
  isMockMode: boolean;
  keyId: string;
}

export interface CheckoutOptions {
  billingCycle?: "MONTHLY" | "YEARLY";
  onSuccess?: (result: VerifyPaymentResult) => void;
  onError?: (error: Error) => void;
  onDismiss?: () => void;
}

export class BillingService {
  /**
   * Fetches public billing config and active payment mode.
   */
  async getConfig(): Promise<BillingConfig> {
    const res = await apiFetch<{ success: boolean; data: BillingConfig }>("/api/billing/config");
    return res.data;
  }

  /**
   * Creates a Razorpay checkout order on backend.
   */
  async createOrder(billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY"): Promise<RazorpayOrderData> {
    const res = await apiFetch<{ success: boolean; data: RazorpayOrderData }>("/api/billing/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify({ billingCycle }),
    });
    return res.data;
  }

  /**
   * Cryptographically verifies the payment and upgrades tier.
   */
  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string,
    billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY"
  ): Promise<VerifyPaymentResult> {
    const res = await apiFetch<{ success: boolean; data: VerifyPaymentResult }>("/api/billing/razorpay/verify", {
      method: "POST",
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
        billingCycle,
      }),
    });
    return res.data;
  }

  /**
   * Complete high-level checkout flow:
   * 1. Creates order
   * 2. If Mock Mode: Auto-simulates payment & verifies immediately
   * 3. If Real Mode: Opens Razorpay Checkout modal, collects UPI/Cards, and verifies on completion
   */
  async startCheckout(options: CheckoutOptions = {}): Promise<void> {
    const billingCycle = options.billingCycle || "MONTHLY";

    try {
      const order = await this.createOrder(billingCycle);

      // --- MOCK CHECKOUT (Development / Instant Testing) ---
      if (order.isMock) {
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `sig_mock_${Date.now()}`;

        const verifyResult = await this.verifyPayment(
          order.orderId,
          mockPaymentId,
          mockSignature,
          billingCycle
        );

        // Emit real-time telemetry update across client widgets
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("skillezo:tokens-updated", {
              detail: { remaining: verifyResult.remainingTokens },
            })
          );
        }

        options.onSuccess?.(verifyResult);
        return;
      }

      // --- LIVE / TEST RAZORPAY CHECKOUT ---
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
      }

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        throw new Error("Razorpay SDK is not available.");
      }

      const rzpOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "SKILLEZO.AI",
        description: order.planDescription || order.planName,
        order_id: order.orderId,
        prefill: {
          name: order.user?.name || "",
          email: order.user?.email || "",
        },
        theme: {
          color: "#3D5AFE",
        },
        modal: {
          ondismiss: () => {
            options.onDismiss?.();
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyResult = await this.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              billingCycle
            );

            // Synchronize client telemetry headers/widgets
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("skillezo:tokens-updated", {
                  detail: { remaining: verifyResult.remainingTokens },
                })
              );
            }

            options.onSuccess?.(verifyResult);
          } catch (verifyError: any) {
            options.onError?.(verifyError);
          }
        },
      };

      const paymentObject = new Razorpay(rzpOptions);
      paymentObject.open();
    } catch (error: any) {
      console.error("[BillingService] Checkout error:", error);
      options.onError?.(error);
      throw error;
    }
  }
}

export const billingService = new BillingService();
