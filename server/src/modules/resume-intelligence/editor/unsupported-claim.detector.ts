/**
 * SKILLEZO RESUME STUDIO — PHASE 5 SECTION AI EDITOR
 * Unsupported Claim Detector (Anti-Hallucination Guardrail)
 */

import { SectionId } from "../sections/section.types";
import { ResumeDocument } from "../document/resume-document.types";

export interface ClaimVerificationResult {
  isValid: boolean;
  unsupportedClaims: string[];
  warnings: string[];
}

export class UnsupportedClaimDetector {
  private static readonly METRIC_PATTERN = /\b\d+(?:\.\d+)?(?:%|\s*(?:x|k|m|b|percent|million|thousand|billion|\+))\b/gi;
  private static readonly DOLLAR_PATTERN = /\$[\d,]+(?:\.\d+)?(?:k|m|b|million|billion)?\b/gi;

  /**
   * Scans proposed section content against original content and evidence ledger
   */
  public static verifyClaims(
    sectionId: SectionId,
    originalContent: any,
    proposedContent: any,
    doc: ResumeDocument
  ): ClaimVerificationResult {
    const unsupportedClaims: string[] = [];
    const warnings: string[] = [];

    const originalString = JSON.stringify(originalContent || "");
    const proposedString = JSON.stringify(proposedContent || "");

    // Extract all metrics and numbers from proposed vs original
    const proposedMetrics = this.extractMetrics(proposedString);
    const originalMetrics = new Set(this.extractMetrics(originalString));

    // Also check document-wide evidence ledger for known numbers
    const evidenceMetrics = new Set(
      doc.evidence
        .filter((e) => e.type === "METRIC")
        .map((e) => e.value.toLowerCase().trim())
    );

    for (const metric of proposedMetrics) {
      const normalized = metric.toLowerCase().trim();
      const inOriginal = originalMetrics.has(metric) || originalString.toLowerCase().includes(normalized);
      const inEvidence = evidenceMetrics.has(normalized);

      if (!inOriginal && !inEvidence) {
        unsupportedClaims.push(`Metric "${metric}" was introduced without underlying resume evidence.`);
      }
    }

    // Check for newly introduced company names in experience section
    if (sectionId === "experience" && Array.isArray(proposedContent) && Array.isArray(originalContent)) {
      const originalCompanies = new Set(originalContent.map((item: any) => item.companyName?.toLowerCase().trim()));
      for (const item of proposedContent) {
        if (item.companyName && !originalCompanies.has(item.companyName.toLowerCase().trim())) {
          unsupportedClaims.push(`Company name "${item.companyName}" does not match original employment records.`);
        }
      }
    }

    return {
      isValid: unsupportedClaims.length === 0,
      unsupportedClaims,
      warnings,
    };
  }

  private static extractMetrics(text: string): string[] {
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    const metricRegex = /\b\d+(?:\.\d+)?(?:%|\s*(?:x|k|m|b|percent|million|thousand|billion|\+))\b/gi;
    while ((match = metricRegex.exec(text)) !== null) {
      matches.push(match[0].trim());
    }

    const dollarRegex = /\$[\d,]+(?:\.\d+)?(?:k|m|b|million|billion)?\b/gi;
    while ((match = dollarRegex.exec(text)) !== null) {
      matches.push(match[0].trim());
    }

    return matches;
  }
}
