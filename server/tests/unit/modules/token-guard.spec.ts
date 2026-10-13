import { describe, it, expect, vi, beforeEach } from "vitest";
import { tokenGuard } from "@/modules/plan/token-guard.middleware";
import { planService } from "@/modules/plan/plan.service";
import { TokenFeature } from "@/database/models/TokenUsageLog.model";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

vi.mock("@/modules/plan/plan.service", () => ({
  planService: {
    checkTokenQuota: vi.fn(),
    deductTokens: vi.fn(),
  },
}));

describe("tokenGuard Middleware (Phase 2)", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      user: { id: "user-test-123" },
      headers: {},
    };

    const headers: Record<string, string> = {};
    mockRes = {
      statusCode: 200,
      headersSent: false,
      status: vi.fn().mockImplementation((code: number) => {
        mockRes.statusCode = code;
        return mockRes;
      }),
      json: vi.fn().mockImplementation((body: any) => body),
      setHeader: vi.fn().mockImplementation((name: string, value: string) => {
        headers[name] = value;
      }),
      getHeader: vi.fn().mockImplementation((name: string) => headers[name]),
      on: vi.fn(),
    };

    mockNext = vi.fn();
  });

  it("should permit request and deduct tokens on successful 200 response", async () => {
    (planService.checkTokenQuota as any).mockResolvedValue({
      allowed: true,
      balance: 5000,
      required: 700,
      missing: 0,
      upgradeUrl: "/dashboard/plan",
    });

    (planService.deductTokens as any).mockResolvedValue({
      success: true,
      tokensDeducted: 700,
      balanceAfter: 4300,
    });

    const middleware = tokenGuard(TokenFeature.TAILORED_RESUME);
    await middleware(mockReq, mockRes, mockNext);

    expect(planService.checkTokenQuota).toHaveBeenCalledWith("user-test-123", TokenFeature.TAILORED_RESUME, undefined);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalledWith(HTTP_STATUS.PAYMENT_REQUIRED);

    // Simulate controller sending 200 response
    mockRes.statusCode = 200;
    mockRes.json({ success: true, resumeId: "res-1" });

    expect(planService.deductTokens).toHaveBeenCalledWith(
      "user-test-123",
      TokenFeature.TAILORED_RESUME,
      undefined,
      undefined,
      {}
    );
  });

  it("should halt and reject with HTTP 402 and structured details when tokens are insufficient", async () => {
    (planService.checkTokenQuota as any).mockResolvedValue({
      allowed: false,
      balance: 200,
      required: 700,
      missing: 500,
      upgradeUrl: "/dashboard/plan",
    });

    const middleware = tokenGuard(TokenFeature.TAILORED_RESUME);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(HTTP_STATUS.PAYMENT_REQUIRED);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: ERROR_CODES.INSUFFICIENT_TOKENS,
          details: expect.objectContaining({
            balance: 200,
            required: 700,
            missing: 500,
            feature: TokenFeature.TAILORED_RESUME,
            upgradeUrl: "/dashboard/plan",
          }),
        }),
      })
    );
    expect(planService.deductTokens).not.toHaveBeenCalled();
  });

  it("should NOT deduct tokens when controller response returns HTTP 500 error", async () => {
    (planService.checkTokenQuota as any).mockResolvedValue({
      allowed: true,
      balance: 5000,
      required: 50,
      missing: 0,
      upgradeUrl: "/dashboard/plan",
    });

    const middleware = tokenGuard(TokenFeature.CAREER_COACH);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();

    // Simulate controller returning 500 Internal Error (e.g. LLM timeout)
    mockRes.statusCode = 500;
    mockRes.json({ success: false, message: "AI model timeout" });

    // Deduct tokens must NOT be called for failed requests!
    expect(planService.deductTokens).not.toHaveBeenCalled();
  });

  it("should pass through to next if req.user is unauthenticated", async () => {
    mockReq.user = undefined;

    const middleware = tokenGuard(TokenFeature.RESUME_ATS);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(planService.checkTokenQuota).not.toHaveBeenCalled();
  });
});
