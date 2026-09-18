import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  coachService,
  CareerCoachRequestBody,
  AIOrchestrationResult,
} from "../services/coach.service";
import { ApiError } from "@/lib/api";

describe("Phase 6: Frontend Coach Service & SSE Contract Test Suite", () => {
  const mockResult: AIOrchestrationResult = {
    intent: "RESUME_ANALYSIS",
    answer: "Your resume has an ATS score of 88.",
    metrics: [
      {
        name: "atsScore",
        value: 88,
        evidenceId: "ev_resume_88",
        label: "ATS Compatibility",
      },
    ],
    evidence: [
      {
        id: "ev_resume_88",
        type: "RESUME_ATS",
        source: "ResumeAtsEngine",
        summary: "ATS compatibility 88/100",
      },
    ],
    insights: [
      {
        title: "Strong Keywords",
        explanation: "Matches senior engineering criteria.",
        evidenceIds: ["ev_resume_88"],
      },
    ],
    recommendations: [
      {
        title: "Add Docker Metrics",
        explanation: "Show impact in deployment bullets.",
        priority: "HIGH",
        evidenceIds: ["ev_resume_88"],
      },
    ],
    confidence: "HIGH",
    limitations: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Non-streaming JSON Request", () => {
    it("posts to /api/ai/coach/chat with bounded context and stream: false", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          requestId: "req_123",
          data: mockResult,
        }),
      } as any);

      const requestPayload: CareerCoachRequestBody = {
        message: "   Analyze my resume   ",
        targetRole: "  Frontend Architect  ",
        conversationContext: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Hello!" },
        ],
      };

      const res = await coachService.sendChatMessage(requestPayload);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, options] = fetchSpy.mock.calls[0];

      expect(url).toContain("/api/ai/coach/chat");
      expect(options?.method).toBe("POST");

      const body = JSON.parse(options?.body as string);
      expect(body.message).toBe("Analyze my resume");
      expect(body.targetRole).toBe("Frontend Architect");
      expect(body.stream).toBe(false);
      expect(body.conversationContext).toHaveLength(2);

      // Security guarantee: ensure no client-side identity or tool overrides are sent
      expect(body.userId).toBeUndefined();
      expect(body.candidateId).toBeUndefined();
      expect(body.provider).toBeUndefined();
      expect(body.model).toBeUndefined();
      expect(body.evidence).toBeUndefined();

      expect(res.success).toBe(true);
      expect(res.data.intent).toBe("RESUME_ANALYSIS");
    });

    it("throws ApiError when server responds with 429 Too Many Requests", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Rate limit exceeded. Please wait 60 seconds.",
          },
        }),
      } as any);

      await expect(
        coachService.sendChatMessage({ message: "Check score" })
      ).rejects.toThrow(ApiError);
    });
  });

  describe("SSE Lifecycle Streaming", () => {
    it("parses lifecycle status sequence and delivers final validated AIOrchestrationResult", async () => {
      const sseChunks = [
        'event: status\ndata: {"status":"thinking"}\n\n',
        'event: status\ndata: {"status":"executing_tools"}\n\n',
        'event: status\ndata: {"status":"synthesizing"}\n\n',
        `event: result\ndata: ${JSON.stringify(mockResult)}\n\n`,
        'event: completed\ndata: {"status":"completed"}\n\n',
      ];

      const encoder = new TextEncoder();
      let chunkIndex = 0;

      const mockReadableStream = new ReadableStream({
        pull(controller) {
          if (chunkIndex < sseChunks.length) {
            controller.enqueue(encoder.encode(sseChunks[chunkIndex]));
            chunkIndex++;
          } else {
            controller.close();
          }
        },
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream,
      } as any);

      const statusHistory: string[] = [];
      let finalResult: AIOrchestrationResult | null = null;
      let completedCalled = false;

      await coachService.streamChatMessage(
        { message: "Tell me my readiness" },
        {
          onStatus: (st) => statusHistory.push(st),
          onResult: (res) => {
            finalResult = res;
          },
          onCompleted: () => {
            completedCalled = true;
          },
        }
      );

      // Verify authentic 3-stage lifecycle progression
      expect(statusHistory).toEqual(["thinking", "executing_tools", "synthesizing"]);
      expect(finalResult).toEqual(mockResult);
      expect(completedCalled).toBe(true);
    });

    it("gracefully ignores malformed JSON in SSE events without throwing", async () => {
      const sseChunks = [
        'event: status\ndata: {"status":"thinking"}\n\n',
        "event: status\ndata: INVALID_JSON_DATA_CORRUPT\n\n",
        `event: result\ndata: ${JSON.stringify(mockResult)}\n\n`,
      ];

      const encoder = new TextEncoder();
      let chunkIndex = 0;

      const mockReadableStream = new ReadableStream({
        pull(controller) {
          if (chunkIndex < sseChunks.length) {
            controller.enqueue(encoder.encode(sseChunks[chunkIndex]));
            chunkIndex++;
          } else {
            controller.close();
          }
        },
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream,
      } as any);

      let resultCaptured: AIOrchestrationResult | null = null;

      await coachService.streamChatMessage(
        { message: "Query" },
        {
          onResult: (r) => {
            resultCaptured = r;
          },
        }
      );

      expect(resultCaptured).toEqual(mockResult);
    });

    it("handles server-emitted error events cleanly via onError callback", async () => {
      const sseChunks = [
        'event: status\ndata: {"status":"thinking"}\n\n',
        'event: error\ndata: {"code":"SERVICE_UNAVAILABLE","message":"AI temporarily unavailable"}\n\n',
      ];

      const encoder = new TextEncoder();
      let chunkIndex = 0;

      const mockReadableStream = new ReadableStream({
        pull(controller) {
          if (chunkIndex < sseChunks.length) {
            controller.enqueue(encoder.encode(sseChunks[chunkIndex]));
            chunkIndex++;
          } else {
            controller.close();
          }
        },
      });

      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream,
      } as any);

      let errorCaught: any = null;

      await coachService.streamChatMessage(
        { message: "Query" },
        {
          onError: (err) => {
            errorCaught = err;
          },
        }
      );

      expect(errorCaught).toBeDefined();
      expect(errorCaught.message).toBe("AI temporarily unavailable");
    });

    it("handles client AbortSignal cleanly without propagating error", async () => {
      const abortController = new AbortController();
      abortController.abort();

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new DOMException("Aborted", "AbortError"));

      let errorCaught = false;

      await coachService.streamChatMessage(
        { message: "Cancelled request" },
        {
          onError: () => {
            errorCaught = true;
          },
        },
        abortController.signal
      );

      expect(errorCaught).toBe(false);
    });
  });
});
