import { ResumeExperienceItem, ResumeEvidence } from "../../document/resume-document.types";
import { ExperienceSectionAnalysis, ExperienceSignals, SectionStatus } from "../section.types";

export class ExperienceAnalyzer {
  analyze(experience: ResumeExperienceItem[] = [], evidenceLedger: ResumeEvidence[] = []): ExperienceSectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const expList = Array.isArray(experience) ? experience : [];
    const experienceCount = expList.length;

    if (experienceCount === 0) {
      return {
        sectionId: "experience",
        title: "Work Experience",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["Work experience section is empty."],
        missing: ["experience"],
        warnings: ["No work experience entries detected."],
        evidenceIds: [],
        signals: {
          experienceCount: 0,
          totalBulletsCount: 0,
          entriesWithCompany: 0,
          entriesWithTitle: 0,
          entriesWithDates: 0,
          entriesWithBullets: 0,
          entriesWithMetrics: 0,
          totalMetricsCount: 0,
          totalVerbsCount: 0,
          entriesMissingDates: 0,
          entriesMissingCompany: 0,
          entriesMissingTitle: 0,
          entriesWithoutBullets: 0,
          shortBulletsCount: 0,
          longBulletsCount: 0,
          hasCurrentRole: false,
          averageBulletsPerRole: 0,
        },
      };
    }

    let totalBulletsCount = 0;
    let entriesWithCompany = 0;
    let entriesWithTitle = 0;
    let entriesWithDates = 0;
    let entriesWithBullets = 0;
    let entriesWithMetrics = 0;
    let totalMetricsCount = 0;
    let totalVerbsCount = 0;
    let entriesMissingDates = 0;
    let entriesMissingCompany = 0;
    let entriesMissingTitle = 0;
    let entriesWithoutBullets = 0;
    let shortBulletsCount = 0;
    let longBulletsCount = 0;
    let hasCurrentRole = false;

    expList.forEach((exp, idx) => {
      const prefix = `experience[${idx}]`;
      const company = (exp.companyName || "").trim();
      const title = (exp.jobTitle || "").trim();
      const startDate = (exp.startDate || "").trim();
      const endDate = (exp.endDate || "").trim();
      const isCurrent = Boolean(exp.isCurrent);
      const bullets = Array.isArray(exp.bullets) ? exp.bullets : [];

      if (isCurrent) hasCurrentRole = true;

      // Check company
      if (company && company.toLowerCase() !== "organization") {
        entriesWithCompany++;
      } else {
        entriesMissingCompany++;
        missing.push(`${prefix}.companyName`);
        warnings.push(`Experience entry #${idx + 1} is missing company name.`);
      }

      // Check title
      if (title && title.toLowerCase() !== "software engineer") {
        entriesWithTitle++;
      } else if (title) {
        entriesWithTitle++;
      } else {
        entriesMissingTitle++;
        missing.push(`${prefix}.jobTitle`);
        warnings.push(`Experience entry #${idx + 1} is missing job title.`);
      }

      // Check dates
      if (startDate || endDate || isCurrent) {
        entriesWithDates++;
      } else {
        entriesMissingDates++;
        missing.push(`${prefix}.dates`);
        warnings.push(`Experience entry #${idx + 1} (${company || "Unknown Company"}) lacks employment dates.`);
      }

      // Check bullets
      const bulletCount = bullets.length;
      totalBulletsCount += bulletCount;

      if (bulletCount > 0) {
        entriesWithBullets++;
        let roleHasMetrics = false;

        bullets.forEach((b, bIdx) => {
          if (!b || !b.text) return;
          const words = b.text.trim().split(/\s+/).filter(Boolean);
          if (words.length < 6) {
            shortBulletsCount++;
            warnings.push(`Short bullet point detected in ${company || "role"}: "${b.text.slice(0, 40)}..."`);
          } else if (words.length > 45) {
            longBulletsCount++;
            warnings.push(`Long bullet point detected (>45 words) in ${company || "role"}. Consider splitting.`);
          }

          if (Array.isArray(b.metrics) && b.metrics.length > 0) {
            totalMetricsCount += b.metrics.length;
            roleHasMetrics = true;
          }

          if (Array.isArray(b.verbs) && b.verbs.length > 0) {
            totalVerbsCount += b.verbs.length;
          }

          if (Array.isArray(b.evidenceIds)) {
            evidenceIds.push(...b.evidenceIds);
          }
        });

        if (roleHasMetrics) {
          entriesWithMetrics++;
        }
      } else {
        entriesWithoutBullets++;
        missing.push(`${prefix}.bullets`);
        warnings.push(`Experience entry #${idx + 1} (${company || "Unknown"}) contains no descriptive bullet points.`);
      }
    });

    const averageBulletsPerRole = experienceCount > 0 ? Number((totalBulletsCount / experienceCount).toFixed(1)) : 0;

    // Strengths
    if (experienceCount >= 1 && entriesWithCompany === experienceCount && entriesWithTitle === experienceCount) {
      strengths.push(`${experienceCount} professional employment position(s) clearly documented with companies and titles.`);
    }
    if (totalBulletsCount >= 3) {
      strengths.push(`${totalBulletsCount} structured bullet point(s) provided across roles.`);
    }
    if (totalMetricsCount > 0) {
      strengths.push(`${totalMetricsCount} quantifiable metric(s) or performance result(s) detected in bullet points.`);
    }
    if (totalVerbsCount >= 4) {
      strengths.push("Active power verbs used across responsibility bullets.");
    }
    if (hasCurrentRole) {
      strengths.push("Current active employment status indicated.");
    }

    // Weaknesses
    if (entriesWithoutBullets > 0) {
      weaknesses.push(`${entriesWithoutBullets} experience position(s) have no bulleted achievements.`);
    }
    if (entriesMissingDates > 0) {
      weaknesses.push(`${entriesMissingDates} role(s) are missing start or end dates.`);
    }
    if (totalMetricsCount === 0 && totalBulletsCount > 0) {
      weaknesses.push("Bullet points lack quantifiable metrics, percentages, or measurable outcomes.");
    }
    if (averageBulletsPerRole < 2 && totalBulletsCount > 0) {
      weaknesses.push("Average bullet density is low (< 2 bullets per role).");
    }

    // Completeness calculation
    let completeness = 0;
    const companyRatio = entriesWithCompany / experienceCount;
    const titleRatio = entriesWithTitle / experienceCount;
    const datesRatio = entriesWithDates / experienceCount;
    const bulletsRatio = entriesWithBullets / experienceCount;

    completeness += companyRatio * 0.25;
    completeness += titleRatio * 0.25;
    completeness += datesRatio * 0.20;
    completeness += bulletsRatio * 0.20;
    if (totalMetricsCount > 0) completeness += 0.10;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.85 && entriesMissingCompany === 0 && entriesMissingTitle === 0 && entriesWithoutBullets === 0) {
      status = "COMPLETE";
    }

    const signals: ExperienceSignals = {
      experienceCount,
      totalBulletsCount,
      entriesWithCompany,
      entriesWithTitle,
      entriesWithDates,
      entriesWithBullets,
      entriesWithMetrics,
      totalMetricsCount,
      totalVerbsCount,
      entriesMissingDates,
      entriesMissingCompany,
      entriesMissingTitle,
      entriesWithoutBullets,
      shortBulletsCount,
      longBulletsCount,
      hasCurrentRole,
      averageBulletsPerRole,
    };

    return {
      sectionId: "experience",
      title: "Work Experience",
      status,
      completeness,
      itemCount: experienceCount,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds: Array.from(new Set(evidenceIds)),
      signals,
    };
  }
}

export const experienceAnalyzer = new ExperienceAnalyzer();
