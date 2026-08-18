import { env } from "@/core/config/env";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { JobSourceQuery } from "../../types/job-source.types";
import { joobleResponseSchema, ValidatedJoobleResponse } from "./jooble.schema";

export class JoobleClient {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = (env.JOOBLE_API_BASE_URL || "https://in.jooble.org/api").replace(/\/+$/, "");
  }

  async search(query: JobSourceQuery): Promise<ValidatedJoobleResponse> {
    const apiKey = env.JOOBLE_API_KEY || process.env.JOOBLE_API_KEY || process.env.job_api_key;

    if (!apiKey) {
      throw new AppError(
        "Jooble API key is not configured on server",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.JOOBLE_API_KEY_INVALID
      );
    }

    const endpoint = `${this.baseUrl}/${apiKey}`;

    const requestBody = {
      keywords: query.keywords || "software engineer",
      location: query.location || "Delhi",
      radius: query.radius || "40",
      salary: query.salary || 0,
      page: String(query.page || 1),
      ResultOnPage: query.limit || 20,
      SearchMode: 0,
      companysearch: query.companySearch ?? false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new AppError(
            "Jooble API authentication failed. Check API key configuration.",
            HTTP_STATUS.FORBIDDEN,
            ERROR_CODES.JOOBLE_API_KEY_INVALID
          );
        }
        throw new AppError(
          `Jooble API error response (HTTP ${response.status})`,
          HTTP_STATUS.SERVICE_UNAVAILABLE,
          ERROR_CODES.JOB_SOURCE_UNAVAILABLE
        );
      }

      const rawJson = await response.json();
      const parseResult = joobleResponseSchema.safeParse(rawJson);

      if (!parseResult.success) {
        console.error("Jooble API response failed Zod validation:", parseResult.error.format());
        throw new AppError(
          "Jooble API returned malformed response structure",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.JOB_SOURCE_INVALID_RESPONSE
        );
      }

      return parseResult.data;
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === "AbortError") {
        throw new AppError(
          "Request to Jooble API timed out after 10 seconds",
          HTTP_STATUS.GATEWAY_TIMEOUT,
          ERROR_CODES.JOB_SOURCE_TIMEOUT
        );
      }

      if (err instanceof AppError) {
        throw err;
      }

      throw new AppError(
        `Failed to reach Jooble API: ${err.message}`,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        ERROR_CODES.JOB_SOURCE_UNAVAILABLE
      );
    }
  }
}
