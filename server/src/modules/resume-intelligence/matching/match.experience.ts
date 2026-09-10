import { ExperienceRequirement } from "../roles/role.types";
import { RequirementMatchResult } from "./match.types";

export class ExperienceMatcher {
  /**
   * Deterministically calculates total non-overlapping elapsed years of experience.
   */
  public static calculateTotalYears(experiences: any[]): number {
    if (!Array.isArray(experiences) || experiences.length === 0) return 0;

    const intervals: Array<{ start: number; end: number }> = [];

    for (const exp of experiences) {
      const rawStart = exp.startDate || exp.startYear;
      const rawEnd = exp.endDate || exp.endYear;

      if (!rawStart) continue; // No date -> do not fabricate numeric duration

      const startYear = parseInt(rawStart, 10);
      if (isNaN(startYear)) continue;

      let endYear = isNaN(parseInt(rawEnd, 10))
        ? (rawEnd?.toLowerCase() === "present" || !rawEnd ? new Date().getFullYear() : startYear + 1)
        : parseInt(rawEnd, 10);

      if (endYear < startYear) endYear = startYear;

      intervals.push({ start: startYear, end: endYear });
    }

    if (intervals.length === 0) return 0;

    // Sort intervals by start year
    intervals.sort((a, b) => a.start - b.start);

    // Merge overlapping intervals
    const merged: Array<{ start: number; end: number }> = [];
    let current = { ...intervals[0] };

    for (let i = 1; i < intervals.length; i++) {
      const next = intervals[i];
      if (next.start <= current.end) {
        current.end = Math.max(current.end, next.end);
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
    merged.push(current);

    // Calculate total merged duration
    return merged.reduce((acc, interval) => acc + (interval.end - interval.start), 0);
  }

  /**
   * Matches candidate work experience history against required years of experience.
   */
  public static matchExperience(
    extractedData: any,
    requirements: ExperienceRequirement[]
  ): RequirementMatchResult[] {
    const experiences = extractedData?.experience || [];
    const candidateEvidenceIds = experiences.map((_: any, idx: number) => `exp_${idx}`);
    const totalEstimatedYears = this.calculateTotalYears(experiences);

    const results: RequirementMatchResult[] = [];

    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i];
      const reqMinYears = req.minYears || 2;
      const requirementId = `req_exp_${i}`;

      let status: "MATCHED" | "PARTIAL" | "NOT_DETECTED" = "NOT_DETECTED";
      let confidence = 0.90;

      if (totalEstimatedYears >= reqMinYears) {
        status = "MATCHED";
        confidence = 0.95;
      } else if (totalEstimatedYears >= reqMinYears * 0.5) {
        status = "PARTIAL";
        confidence = 0.85;
      } else if (experiences.length > 0) {
        status = "PARTIAL";
        confidence = 0.75;
      }

      results.push({
        requirementId,
        canonicalName: `${reqMinYears}+ years of experience (${req.category || "General"})`,
        category: "EXPERIENCE",
        requirementType: req.requirementType,
        source: req.evidenceIds && req.evidenceIds.length > 0 ? "JOB_DESCRIPTION" : "ROLE_BENCHMARK",
        status,
        confidence,
        candidateEvidenceIds,
        requirementEvidenceIds: req.evidenceIds || [],
        rationaleCode:
          status === "MATCHED"
            ? "EXPERIENCE_YEARS_SATISFIED"
            : status === "PARTIAL"
            ? "EXPERIENCE_YEARS_PARTIAL"
            : "EXPERIENCE_YEARS_INSUFFICIENT",
      });
    }

    return results;
  }
}
