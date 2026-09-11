import { ResumeDocument } from "../document/resume-document.types";
import {
  ResumeSectionAnalysisResult,
  SectionAnalysisSummaryStats,
  SectionId,
  BaseSectionAnalysis,
} from "./section.types";
import { contactAnalyzer } from "./analyzers/contact.analyzer";
import { summaryAnalyzer } from "./analyzers/summary.analyzer";
import { skillsAnalyzer } from "./analyzers/skills.analyzer";
import { experienceAnalyzer } from "./analyzers/experience.analyzer";
import { projectsAnalyzer } from "./analyzers/projects.analyzer";
import { educationAnalyzer } from "./analyzers/education.analyzer";
import { achievementsAnalyzer } from "./analyzers/achievements.analyzer";

export class ResumeSectionEngine {
  public readonly engineVersion = "section-engine-v1";

  /**
   * Master Section Intelligence Pipeline
   * Evaluates all 7 canonical resume sections deterministically without mutations or AI calls.
   */
  analyze(doc: ResumeDocument): ResumeSectionAnalysisResult {
    const evidenceLedger = Array.isArray(doc.evidence) ? doc.evidence : [];

    // Analyze each of the 7 canonical sections
    const contact = contactAnalyzer.analyze(doc.contact, evidenceLedger);
    const summary = summaryAnalyzer.analyze(doc.summary, evidenceLedger);
    const skills = skillsAnalyzer.analyze(doc.skills, evidenceLedger);
    const experience = experienceAnalyzer.analyze(doc.experience, evidenceLedger);
    const projects = projectsAnalyzer.analyze(doc.projects, evidenceLedger);
    const education = educationAnalyzer.analyze(doc.education, evidenceLedger);
    const achievements = achievementsAnalyzer.analyze(doc.achievements, evidenceLedger);

    const sectionsList = [contact, summary, skills, experience, projects, education, achievements];

    // Compute summary statistics
    let completeSectionsCount = 0;
    let partialSectionsCount = 0;
    let missingSectionsCount = 0;
    let invalidSectionsCount = 0;
    let completenessSum = 0;
    let totalStrengthsCount = 0;
    let totalWeaknessesCount = 0;
    let totalMissingFieldsCount = 0;
    let totalWarningsCount = 0;
    const trackedEvidenceSet = new Set<string>();

    for (const sec of sectionsList) {
      if (sec.status === "COMPLETE") completeSectionsCount++;
      else if (sec.status === "PARTIAL") partialSectionsCount++;
      else if (sec.status === "MISSING") missingSectionsCount++;
      else if (sec.status === "INVALID") invalidSectionsCount++;

      completenessSum += sec.completeness;
      totalStrengthsCount += sec.strengths.length;
      totalWeaknessesCount += sec.weaknesses.length;
      totalMissingFieldsCount += sec.missing.length;
      totalWarningsCount += sec.warnings.length;

      sec.evidenceIds.forEach((id) => trackedEvidenceSet.add(id));
    }

    const overallCompletenessAverage = Number((completenessSum / sectionsList.length).toFixed(2));

    const summaryStats: SectionAnalysisSummaryStats = {
      totalSectionsAnalyzed: sectionsList.length,
      completeSectionsCount,
      partialSectionsCount,
      missingSectionsCount,
      invalidSectionsCount,
      overallCompletenessAverage,
      totalStrengthsCount,
      totalWeaknessesCount,
      totalMissingFieldsCount,
      totalWarningsCount,
      totalEvidenceTracked: trackedEvidenceSet.size,
    };

    return {
      resumeId: doc.id || "doc_unknown",
      analyzedAt: new Date().toISOString(),
      engineVersion: this.engineVersion,
      sections: {
        contact,
        summary,
        skills,
        experience,
        projects,
        education,
        achievements,
      },
      summaryStats,
    };
  }

  /**
   * Analyze a single target section on demand
   */
  analyzeSection(doc: ResumeDocument, sectionId: SectionId): BaseSectionAnalysis {
    const evidenceLedger = Array.isArray(doc.evidence) ? doc.evidence : [];

    switch (sectionId) {
      case "contact":
        return contactAnalyzer.analyze(doc.contact, evidenceLedger);
      case "summary":
        return summaryAnalyzer.analyze(doc.summary, evidenceLedger);
      case "skills":
        return skillsAnalyzer.analyze(doc.skills, evidenceLedger);
      case "experience":
        return experienceAnalyzer.analyze(doc.experience, evidenceLedger);
      case "projects":
        return projectsAnalyzer.analyze(doc.projects, evidenceLedger);
      case "education":
        return educationAnalyzer.analyze(doc.education, evidenceLedger);
      case "achievements":
        return achievementsAnalyzer.analyze(doc.achievements, evidenceLedger);
      default:
        throw new Error(`Unknown section ID: ${sectionId}`);
    }
  }
}

export const resumeSectionEngine = new ResumeSectionEngine();
