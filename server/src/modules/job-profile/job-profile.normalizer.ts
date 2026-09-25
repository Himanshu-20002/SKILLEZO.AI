import crypto from "crypto";

export class JobProfileNormalizer {
  /**
   * Normalizes raw job description text by cleaning whitespace while strictly preserving
   * technical names, code snippets, bullets, and section headings.
   */
  public static normalizeDescription(rawText: string): string {
    if (!rawText) return "";

    return (
      rawText
        // Normalize line endings
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Strip non-printable control characters except standard whitespace
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        // Normalize multiple horizontal spaces/tabs to a single space
        .replace(/[ \t]+/g, " ")
        // Collapse more than 2 consecutive newlines into 2
        .replace(/\n{3,}/g, "\n\n")
        // Trim each line
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim()
    );
  }

  /**
   * Computes a deterministic SHA-256 hash of the normalized description text.
   */
  public static computeSourceHash(normalizedText: string): string {
    return crypto.createHash("sha256").update(normalizedText).digest("hex");
  }

  /**
   * Computes a deterministic user-scoped fingerprint identifying the job.
   * Fingerprint = sha256(lowercase(title) + "::" + lowercase(company) + "::" + normalizedText)
   */
  public static computeJobFingerprint(
    jobTitle: string,
    company: string | null | undefined,
    normalizedText: string
  ): string {
    const cleanTitle = (jobTitle || "").trim().toLowerCase();
    const cleanCompany = (company || "").trim().toLowerCase();
    const seed = `${cleanTitle}::${cleanCompany}::${normalizedText}`;
    return crypto.createHash("sha256").update(seed).digest("hex");
  }

  /**
   * Verifies that the cited evidence text genuinely exists within the source JD text.
   * Accounts for minor whitespace differences while preventing fabricated/hallucinated citations.
   */
  public static verifyEvidenceGrounding(
    evidenceText: string,
    normalizedText: string
  ): boolean {
    if (!evidenceText || !normalizedText) return false;

    const trimmedEvidence = evidenceText.trim();
    if (trimmedEvidence.length === 0) return false;

    // 1. Exact case-insensitive substring match
    if (normalizedText.toLowerCase().includes(trimmedEvidence.toLowerCase())) {
      return true;
    }

    // 2. Whitespace-collapsed match
    const collapseWs = (str: string) => str.toLowerCase().replace(/\s+/g, " ").trim();
    const collapsedEvidence = collapseWs(trimmedEvidence);
    const collapsedDoc = collapseWs(normalizedText);

    if (collapsedDoc.includes(collapsedEvidence)) {
      return true;
    }

    // 3. Punctuation-insensitive normalized match
    const stripPunct = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const cleanEvidence = stripPunct(trimmedEvidence);
    const cleanDoc = stripPunct(normalizedText);

    return cleanDoc.includes(cleanEvidence);
  }
}
