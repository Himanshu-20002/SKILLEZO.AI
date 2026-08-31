export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Utility wrapper around fetch for sending requests to the backend API
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanBase = API_BASE_URL.trim().replace(/\/+$/, "");
  const cleanEndpoint = endpoint.trim().replace(/^\//, "");
  
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${cleanBase}/${cleanEndpoint}`;

  const defaultHeaders: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    credentials: options.credentials || "include",
    headers: {
      ...defaultHeaders,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message || errorBody?.message || `HTTP ${response.status}: ${response.statusText}`;
    const code = errorBody?.error?.code || errorBody?.code;
    const details = errorBody?.error?.details || errorBody?.details;
    
    throw new ApiError(message, response.status, code, details);
  }

  return response.json();
}

