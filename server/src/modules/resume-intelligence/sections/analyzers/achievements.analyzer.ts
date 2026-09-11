import { ResumeAchievementItem, ResumeEvidence } from "../../document/resume-document.types";
import { AchievementsSectionAnalysis, AchievementsSignals, SectionStatus } from "../section.types";

export class AchievementsAnalyzer {
  analyze(achievements: ResumeAchievementItem[] = [], evidenceLedger: ResumeEvidence[] = []): AchievementsSectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const achList = Array.isArray(achievements) ? achievements : [];
    const achievementCount = achList.length;

    // Collect linked evidence IDs
    for (const ev of evidenceLedger) {
      if (ev.type === "CERTIFICATION") {
        evidenceIds.push(ev.id);
      }
    }

    if (achievementCount === 0) {
      return {
        sectionId: "achievements",
        title: "Achievements & Certifications",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["No certifications, awards, or verified achievements listed."],
        missing: ["achievements"],
        warnings: [],
        evidenceIds: [],
        signals: {
          achievementCount: 0,
          entriesWithIssuer: 0,
          entriesWithDate: 0,
          entriesWithDescription: 0,
          entriesWithUrl: 0,
          emptyEntriesCount: 0,
        },
      };
    }

    let entriesWithIssuer = 0;
    let entriesWithDate = 0;
    let entriesWithDescription = 0;
    let entriesWithUrl = 0;
    let emptyEntriesCount = 0;

    achList.forEach((ach, idx) => {
      const prefix = `achievements[${idx}]`;
      const title = (ach.title || "").trim();
      const issuer = (ach.issuer || "").trim();
      const date = (ach.date || "").trim();
      const desc = (ach.description || "").trim();
      const url = (ach.url || "").trim();

      if (title.length < 2) {
        emptyEntriesCount++;
        missing.push(`${prefix}.title`);
        warnings.push(`Achievement #${idx + 1} has an empty title.`);
      }

      if (issuer.length >= 2) {
        entriesWithIssuer++;
      } else {
        warnings.push(`Achievement "${title || `#${idx + 1}`}" lacks an issuing organization.`);
      }

      if (date.length >= 4) {
        entriesWithDate++;
      }

      if (desc.length >= 5) {
        entriesWithDescription++;
      }

      if (url.length > 0) {
        entriesWithUrl++;
        try {
          new URL(url);
        } catch {
          warnings.push(`Invalid URL in achievement "${title}": ${url}`);
        }
      }
    });

    // Strengths
    if (achievementCount >= 1 && entriesWithIssuer === achievementCount) {
      strengths.push(`${achievementCount} professional certification(s) / award(s) documented with issuing authorities.`);
    } else if (achievementCount >= 1) {
      strengths.push(`${achievementCount} achievement(s) listed.`);
    }
    if (entriesWithDate > 0) {
      strengths.push("Issue dates / award timelines specified.");
    }
    if (entriesWithUrl > 0) {
      strengths.push("Credential verification links provided.");
    }

    // Weaknesses
    if (entriesWithIssuer < achievementCount) {
      weaknesses.push(`${achievementCount - entriesWithIssuer} achievement(s) lack an issuing authority.`);
    }

    // Completeness (Title = 50%, Issuer = 30%, Date/URL = 20%)
    let completeness = 0;
    const titleRatio = (achievementCount - emptyEntriesCount) / achievementCount;
    const issuerRatio = entriesWithIssuer / achievementCount;
    const dateRatio = entriesWithDate / achievementCount;

    completeness += titleRatio * 0.50;
    completeness += issuerRatio * 0.30;
    completeness += dateRatio * 0.20;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.80 && emptyEntriesCount === 0) {
      status = "COMPLETE";
    }

    const signals: AchievementsSignals = {
      achievementCount,
      entriesWithIssuer,
      entriesWithDate,
      entriesWithDescription,
      entriesWithUrl,
      emptyEntriesCount,
    };

    return {
      sectionId: "achievements",
      title: "Achievements & Certifications",
      status,
      completeness,
      itemCount: achievementCount,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds: Array.from(new Set(evidenceIds)),
      signals,
    };
  }
}

export const achievementsAnalyzer = new AchievementsAnalyzer();
