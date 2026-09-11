import { ResumeSummary, ResumeEvidence } from "../../document/resume-document.types";
import { SummarySectionAnalysis, SummarySignals, SectionStatus } from "../section.types";

const FIRST_PERSON_REGEX = /\b(I|me|my|mine|myself|we|our|ours|us)\b/gi;

export class SummaryAnalyzer {
  analyze(summary?: ResumeSummary | null, evidenceLedger: ResumeEvidence[] = []): SummarySectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const text = (summary?.text || "").trim();
    const hasSummary = text.length > 0;

    if (!hasSummary) {
      return {
        sectionId: "summary",
        title: "Professional Summary",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["Professional summary statement is missing."],
        missing: ["summary.text", "summary.targetRole"],
        warnings: [],
        evidenceIds: [],
        signals: {
          hasSummary: false,
          characterCount: 0,
          wordCount: 0,
          sentenceCount: 0,
          hasYearsOfExperience: false,
          hasTargetRole: false,
          containsFirstPersonLanguage: false,
          firstPersonPronouns: [],
          isShort: false,
          isLong: false,
          isOptimalLength: false,
        },
      };
    }

    const characterCount = text.length;
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 3);
    const sentenceCount = sentences.length;

    const hasYearsOfExperience = typeof summary?.yearsOfExperience === "number" && summary.yearsOfExperience > 0;
    const hasTargetRole = Boolean(summary?.targetRole && summary.targetRole.trim().length >= 3);

    // Detect first person pronouns
    const pronounMatches = Array.from(text.matchAll(FIRST_PERSON_REGEX), (m) => m[0]);
    const firstPersonPronouns = Array.from(new Set(pronounMatches.map((p) => p.toLowerCase())));
    const containsFirstPersonLanguage = firstPersonPronouns.length > 0;

    const isShort = wordCount < 15;
    const isLong = wordCount > 120;
    const isOptimalLength = wordCount >= 18 && wordCount <= 100;

    // Warnings
    if (isShort) {
      warnings.push(`Summary is very brief (${wordCount} words). Recommended length is 20–80 words.`);
    }
    if (isLong) {
      warnings.push(`Summary is lengthy (${wordCount} words). Consider tightening to under 100 words.`);
    }
    if (containsFirstPersonLanguage) {
      warnings.push(`Summary contains first-person pronouns (${firstPersonPronouns.join(", ")}). Consider using executive passive/active phrasing.`);
    }

    // Missing fields
    if (!hasTargetRole) missing.push("summary.targetRole");
    if (!hasYearsOfExperience) missing.push("summary.yearsOfExperience");

    // Strengths
    if (isOptimalLength) {
      strengths.push(`Summary is well-calibrated in length (${wordCount} words across ${sentenceCount} sentences).`);
    }
    if (hasYearsOfExperience) {
      strengths.push(`Years of industry experience clearly specified (${summary?.yearsOfExperience}+ years).`);
    }
    if (hasTargetRole) {
      strengths.push(`Target role focus defined as "${summary?.targetRole}".`);
    }
    if (!containsFirstPersonLanguage && wordCount >= 20) {
      strengths.push("Professional tone maintained without first-person pronouns.");
    }

    // Weaknesses
    if (isShort) {
      weaknesses.push("Summary lacks sufficient depth to highlight candidate core strengths.");
    }
    if (containsFirstPersonLanguage) {
      weaknesses.push("First-person pronouns present in professional summary.");
    }
    if (!hasTargetRole) {
      weaknesses.push("Target role or specialization is not explicitly highlighted in summary.");
    }

    // Completeness (Text length=50%, Target role=25%, Experience years=25%)
    let completeness = 0.5; // Has text
    if (isOptimalLength) completeness += 0.2;
    else if (!isShort && !isLong) completeness += 0.1;
    if (hasTargetRole) completeness += 0.15;
    if (hasYearsOfExperience) completeness += 0.15;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.85 && !isShort && !isLong) {
      status = "COMPLETE";
    }

    const signals: SummarySignals = {
      hasSummary: true,
      characterCount,
      wordCount,
      sentenceCount,
      hasYearsOfExperience,
      yearsOfExperience: summary?.yearsOfExperience,
      hasTargetRole,
      targetRole: summary?.targetRole,
      containsFirstPersonLanguage,
      firstPersonPronouns,
      isShort,
      isLong,
      isOptimalLength,
    };

    return {
      sectionId: "summary",
      title: "Professional Summary",
      status,
      completeness,
      itemCount: 1,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds,
      signals,
    };
  }
}

export const summaryAnalyzer = new SummaryAnalyzer();
