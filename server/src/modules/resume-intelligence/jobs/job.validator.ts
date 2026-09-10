import { MAX_JD_LENGTH } from "./job.types";

export class JobValidator {
  /**
   * Validates and normalizes raw Job Description text.
   * Enforces character limits and cleans excess whitespace.
   */
  public static validateAndNormalize(rawJd?: string): {
    isValid: boolean;
    normalizedText: string;
    error?: string;
  } {
    if (!rawJd || typeof rawJd !== "string") {
      return { isValid: false, normalizedText: "", error: "Job description must be a non-empty string" };
    }

    const trimmed = rawJd.trim();
    if (trimmed.length < 20) {
      return { isValid: false, normalizedText: "", error: "Job description is too short (min 20 characters)" };
    }

    if (trimmed.length > MAX_JD_LENGTH) {
      return {
        isValid: false,
        normalizedText: "",
        error: `Job description exceeds maximum allowed length of ${MAX_JD_LENGTH} characters`,
      };
    }

    // Normalize multiple consecutive blank lines and carriage returns
    const normalizedText = trimmed
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ");

    return {
      isValid: true,
      normalizedText,
    };
  }
}
