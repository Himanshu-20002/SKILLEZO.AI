import { ResumeEducationItem, ResumeEvidence } from "../../document/resume-document.types";
import { EducationSectionAnalysis, EducationSignals, SectionStatus } from "../section.types";

export class EducationAnalyzer {
  analyze(education: ResumeEducationItem[] = [], evidenceLedger: ResumeEvidence[] = []): EducationSectionAnalysis {
    const evidenceIds: string[] = [];
    const missing: string[] = [];
    const warnings: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const eduList = Array.isArray(education) ? education : [];
    const educationCount = eduList.length;

    // Collect linked evidence IDs
    for (const ev of evidenceLedger) {
      if (ev.type === "DEGREE" || ev.type === "INSTITUTION") {
        evidenceIds.push(ev.id);
      }
    }

    if (educationCount === 0) {
      return {
        sectionId: "education",
        title: "Education & Academics",
        status: "MISSING",
        completeness: 0,
        itemCount: 0,
        strengths: [],
        weaknesses: ["Education and academic history is empty."],
        missing: ["education"],
        warnings: ["No academic education history listed."],
        evidenceIds: [],
        signals: {
          educationCount: 0,
          entriesWithDegree: 0,
          entriesWithInstitution: 0,
          entriesWithField: 0,
          entriesWithDates: 0,
          entriesWithGPA: 0,
          gpaPresent: false,
          entriesWithHonors: 0,
          missingInstitutionCount: 0,
          missingDegreeCount: 0,
          missingDatesCount: 0,
        },
      };
    }

    let entriesWithDegree = 0;
    let entriesWithInstitution = 0;
    let entriesWithField = 0;
    let entriesWithDates = 0;
    let entriesWithGPA = 0;
    let entriesWithHonors = 0;
    let missingInstitutionCount = 0;
    let missingDegreeCount = 0;
    let missingDatesCount = 0;

    eduList.forEach((edu, idx) => {
      const prefix = `education[${idx}]`;
      const institution = (edu.institution || "").trim();
      const degree = (edu.degree || "").trim();
      const field = (edu.fieldOfStudy || "").trim();
      const startDate = (edu.startDate || "").trim();
      const endDate = (edu.endDate || "").trim();
      const gpa = (edu.gradeOrGpa || "").trim();
      const honors = Array.isArray(edu.honors) ? edu.honors : [];

      if (institution.length >= 2) {
        entriesWithInstitution++;
      } else {
        missingInstitutionCount++;
        missing.push(`${prefix}.institution`);
        warnings.push(`Education entry #${idx + 1} is missing an institution name.`);
      }

      if (degree.length >= 2) {
        entriesWithDegree++;
      } else {
        missingDegreeCount++;
        missing.push(`${prefix}.degree`);
        warnings.push(`Education entry #${idx + 1} at "${institution || "Institution"}" is missing degree specification.`);
      }

      if (field.length >= 2) {
        entriesWithField++;
      }

      if (startDate || endDate) {
        entriesWithDates++;
      } else {
        missingDatesCount++;
        missing.push(`${prefix}.dates`);
        warnings.push(`Education entry #${idx + 1} (${institution || "Institution"}) lacks graduation/attendance dates.`);
      }

      if (gpa.length > 0) {
        entriesWithGPA++;
      }

      if (honors.length > 0) {
        entriesWithHonors++;
      }
    });

    const gpaPresent = entriesWithGPA > 0;

    // Strengths
    if (educationCount >= 1 && entriesWithInstitution === educationCount && entriesWithDegree === educationCount) {
      strengths.push(`${educationCount} academic degree(s) clearly documented with institutions and degrees.`);
    }
    if (entriesWithDates === educationCount) {
      strengths.push("Graduation timelines and academic dates fully specified.");
    }
    if (entriesWithHonors > 0) {
      strengths.push("Academic honors and distinctions noted.");
    }
    if (gpaPresent) {
      strengths.push("Academic GPA / grading metrics included.");
    }

    // Weaknesses
    if (missingInstitutionCount > 0) {
      weaknesses.push(`${missingInstitutionCount} education entry/entries missing institution name.`);
    }
    if (missingDegreeCount > 0) {
      weaknesses.push(`${missingDegreeCount} education entry/entries missing degree type.`);
    }
    if (missingDatesCount > 0) {
      weaknesses.push(`${missingDatesCount} education entry/entries missing graduation dates.`);
    }

    // Completeness (Institution=35%, Degree=35%, Dates=20%, Field=10%)
    let completeness = 0;
    const instRatio = entriesWithInstitution / educationCount;
    const degRatio = entriesWithDegree / educationCount;
    const datesRatio = entriesWithDates / educationCount;
    const fieldRatio = entriesWithField / educationCount;

    completeness += instRatio * 0.35;
    completeness += degRatio * 0.35;
    completeness += datesRatio * 0.20;
    completeness += fieldRatio * 0.10;

    completeness = Math.min(1.0, Math.max(0.0, Number(completeness.toFixed(2))));

    let status: SectionStatus = "PARTIAL";
    if (completeness >= 0.85 && missingInstitutionCount === 0 && missingDegreeCount === 0) {
      status = "COMPLETE";
    }

    const signals: EducationSignals = {
      educationCount,
      entriesWithDegree,
      entriesWithInstitution,
      entriesWithField,
      entriesWithDates,
      entriesWithGPA,
      gpaPresent,
      entriesWithHonors,
      missingInstitutionCount,
      missingDegreeCount,
      missingDatesCount,
    };

    return {
      sectionId: "education",
      title: "Education & Academics",
      status,
      completeness,
      itemCount: educationCount,
      strengths,
      weaknesses,
      missing,
      warnings,
      evidenceIds: Array.from(new Set(evidenceIds)),
      signals,
    };
  }
}

export const educationAnalyzer = new EducationAnalyzer();
