import { CertificationRequirement } from "../roles/role.types";
import { RequirementMatchResult } from "./match.types";

export class CertificationMatcher {
  /**
   * Matches candidate certifications against certification requirements.
   */
  public static matchCertifications(
    extractedData: any,
    requirements: CertificationRequirement[]
  ): RequirementMatchResult[] {
    const candidateCerts = extractedData?.certifications || [];
    const results: RequirementMatchResult[] = [];

    const certText = candidateCerts
      .map((c: any) => `${c.name || ""} ${c.issuer || ""}`)
      .join(" ")
      .toLowerCase();

    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i];
      const requirementId = `req_cert_${i}`;
      const reqName = req.name;

      const isMatched = certText.includes(reqName.toLowerCase()) || (reqName.toLowerCase().includes("aws") && certText.includes("aws"));

      results.push({
        requirementId,
        canonicalName: reqName,
        category: "CERTIFICATION",
        requirementType: req.requirementType,
        source: "ROLE_BENCHMARK",
        status: isMatched ? "MATCHED" : "NOT_DETECTED",
        confidence: 0.92,
        candidateEvidenceIds: isMatched ? candidateCerts.map((_: any, idx: number) => `cert_${idx}`) : [],
        requirementEvidenceIds: [],
        rationaleCode: isMatched ? "CERTIFICATION_VERIFIED" : "CERTIFICATION_NOT_DETECTED",
      });
    }

    return results;
  }
}
