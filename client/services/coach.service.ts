import { API_BASE_URL, ApiError } from "@/lib/api";

export type AIIntent =
  | "PROFILE_OVERVIEW"
  | "RESUME_ANALYSIS"
  | "RESUME_IMPROVEMENT"
  | "SKILL_GAP_ANALYSIS"
  | "EMPLOYABILITY_ANALYSIS"
  | "JOB_MATCHING"
  | "CAREER_READINESS"
  | "CAREER_PLAN"
  | "GENERAL_CAREER_GUIDANCE"
  | "UNKNOWN";

export type RecommendationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface StructuredMetricItem {
  name: string;
  value: number;
  evidenceId: string;
  label: string;
}

export interface OrchestrationEvidenceItem {
  id: string;
  type: string;
  source: string;
  summary: string;
}

export interface OrchestrationInsight {
  title: string;
  explanation: string;
  evidenceIds: string[];
}

export interface OrchestrationRecommendation {
  title: string;
  explanation: string;
  priority: RecommendationPriority;
  evidenceIds?: string[];
}

export interface AIOrchestrationResult {
  intent: AIIntent;
  answer: string;
  metrics: StructuredMetricItem[];
  evidence: OrchestrationEvidenceItem[];
  insights: OrchestrationInsight[];
  recommendations: OrchestrationRecommendation[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  limitations: string[];
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CareerCoachRequestBody {
  message: string;
  targetRole?: string;
  conversationContext?: ConversationMessage[];
  stream?: boolean;
}

export interface CareerCoachResponseEnvelope {
  success: boolean;
  requestId: string;
  data: AIOrchestrationResult;
}

export type LifecycleStatus = "thinking" | "executing_tools" | "synthesizing";

export interface CoachStreamCallbacks {
  onStatus?: (status: LifecycleStatus) => void;
  onResult?: (result: AIOrchestrationResult) => void;
  onCompleted?: () => void;
  onError?: (error: Error | ApiError) => void;
}

/**
 * Service for communicating with the Phase 5 Career Coach API.
 * Guarantees zero direct LLM SDK calls, zero database imports, and strict adherence
 * to server-side authenticated identity.
 */
export const coachService = {
  /**
   * Sends a standard non-streaming chat request to POST /api/ai/coach/chat.
   */
  async sendChatMessage(
    request: CareerCoachRequestBody,
    signal?: AbortSignal
  ): Promise<CareerCoachResponseEnvelope> {
    const cleanBase = API_BASE_URL.trim().replace(/\/+$/, "");
    const url = `${cleanBase}/api/ai/coach/chat`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("skillezo_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const payload: CareerCoachRequestBody = {
      message: request.message.trim(),
      targetRole: request.targetRole?.trim() || undefined,
      conversationContext: request.conversationContext?.slice(-20) || [],
      stream: false,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        errorBody?.error?.message ||
        errorBody?.message ||
        `Request failed with status ${response.status}`;
      const code = errorBody?.error?.code || errorBody?.code;
      const details = errorBody?.error?.details || errorBody?.details;

      throw new ApiError(message, response.status, code, details);
    }

    return response.json();
  },

  /**
   * Consumes real-time SSE lifecycle events from POST /api/ai/coach/chat.
   * Emits lifecycle progress (thinking -> executing_tools -> synthesizing)
   * and dispatches the final validated AIOrchestrationResult upon completion.
   */
  async streamChatMessage(
    request: CareerCoachRequestBody,
    callbacks: CoachStreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const cleanBase = API_BASE_URL.trim().replace(/\/+$/, "");
    const url = `${cleanBase}/api/ai/coach/chat`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("skillezo_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const payload: CareerCoachRequestBody = {
      message: request.message.trim(),
      targetRole: request.targetRole?.trim() || undefined,
      conversationContext: request.conversationContext?.slice(-20) || [],
      stream: true,
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
        signal,
      });
    } catch (err: unknown) {
      if (signal?.aborted) {
        return; // Normal user cancellation
      }
      const error = err instanceof Error ? err : new Error(String(err));
      callbacks.onError?.(error);
      return;
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        errorBody?.error?.message ||
        errorBody?.message ||
        `Request failed with status ${response.status}`;
      const code = errorBody?.error?.code || errorBody?.code;
      const details = errorBody?.error?.details || errorBody?.details;

      const apiErr = new ApiError(message, response.status, code, details);
      callbacks.onError?.(apiErr);
      return;
    }

    if (!response.body) {
      callbacks.onError?.(new Error("Response body is empty or streaming unsupported."));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        // Keep the remainder after the last complete event in the buffer
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          let eventType = "message";
          let dataString = "";

          const lines = rawEvent.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventType = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataString = line.replace("data:", "").trim();
            }
          }

          if (!dataString) continue;

          try {
            const parsedData = JSON.parse(dataString);

            if (eventType === "status") {
              if (parsedData?.status) {
                callbacks.onStatus?.(parsedData.status as LifecycleStatus);
              }
            } else if (eventType === "result") {
              callbacks.onResult?.(parsedData as AIOrchestrationResult);
            } else if (eventType === "completed") {
              callbacks.onCompleted?.();
            } else if (eventType === "error") {
              callbacks.onError?.(
                new ApiError(
                  parsedData?.message || "AI Coach encountered an error",
                  500,
                  parsedData?.code || "COACH_ERROR"
                )
              );
            }
          } catch (parseError: unknown) {
            console.warn("[CoachService] Malformed SSE event data received:", dataString);
          }
        }
      }

      callbacks.onCompleted?.();
    } catch (err: unknown) {
      if (signal?.aborted) {
        return; // User cancelled
      }
      const error = err instanceof Error ? err : new Error(String(err));
      callbacks.onError?.(error);
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // Ignore cleanup releases
      }
    }
  },
};
