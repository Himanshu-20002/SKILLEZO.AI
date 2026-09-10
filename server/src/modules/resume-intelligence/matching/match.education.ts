import { EducationRequirement } from "../roles/role.types";
import { RequirementMatchResult } from "./match.types";

export class EducationMatcher {
  /**
   * Matches candidate education entries against degree requirements.
   */
  public static matchEducation(
    extractedData: any,
    requirements: EducationRequirement[]
  ): RequirementMatchResult[] {
    const candidateEdu = extractedData?.education || [];
    const results: RequirementMatchResult[] = [];

    const eduText = candidateEdu
      .map((e: any) => `${e.degree || ""} ${e.fieldOfStudy || ""} ${e.institution || ""}`)
      .join(" ")
      .toLowerCase();

    const hasBachelors =
      /\b(bachelor|b\.tech|b\.e|b\.s|bs in cs|bca|undergraduate)\b/i.test(eduText) ||
      candidateEdu.length > 0;
    const hasMasters = /\b(master|m\.tech|m\.s|mca|postgraduate|phd)\b/i.test(eduText);

    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i];
      const requirementId = `req_edu_${i}`;
      let status: "MATCHED" | "PARTIAL" | "NOT_DETECTED" = "NOT_DETECTED";

      if (req.degreeLevel === "MASTERS") {
        if (hasMasters) status = "MATCHED";
        else if (hasBachelors) status = "PARTIAL";
      } else {
        // BACHELORS or ANY_DEGREE
        if (hasBachelors || hasMasters) status = "MATCHED";
      }

      results.push({
        requirementId,
        canonicalName: `${req.degreeLevel || "Bachelor's"} degree in ${req.fieldOfStudy || "Computer Science / Technical Field"}`,
        category: "EDUCATION",
        requirementType: req.requirementType,
        source: "ROLE_BENCHMARK",
        status,
        confidence: 0.90,
        candidateEvidenceIds: candidateEdu.map((_: any, idx: number) => `edu_${idx}`),
        requirementEvidenceIds: [],
        rationaleCode: status === "MATCHED" ? "EDUCATION_DEGREE_MATCHED" : "EDUCATION_NOT_FOUND",
      });
    }

    return results;
  }
}
