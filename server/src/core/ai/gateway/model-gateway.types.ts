import { AIProviderRequestOptions } from "../providers/provider.interface";

export interface ModelGatewayRequest extends AIProviderRequestOptions {
  prompt: string;
  preferredProvider?: "gemini" | "openai" | "auto";
  timeoutMs?: number;
  correlationId?: string;
}

export interface ModelGatewayResponse {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  correlationId: string;
}

export interface StructuredGatewayResponse<T> {
  data: T;
  provider: string;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  correlationId: string;
}

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface ProviderCircuitInfo {
  failureCount: number;
  lastFailureTime: number;
  state: CircuitState;
}

export interface ModelGatewayTelemetry {
  correlationId: string;
  provider: string;
  model: string;
  latencyMs: number;
  status: "SUCCESS" | "FALLBACK" | "ERROR";
  fallbackUsed: boolean;
  error?: string;
  timestamp: string;
}
