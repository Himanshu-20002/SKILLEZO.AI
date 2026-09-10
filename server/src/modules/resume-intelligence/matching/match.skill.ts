import { ResumeSkillProfile } from "../skills/skill.types";
import { SkillNormalizer } from "../skills/skill.normalizer";
import { JobSkillRequirement } from "../jobs/job.types";
import { RequirementMatchResult, MatchSource } from "./match.types";

export class SkillMatcher {
  /**
   * Deterministically matches candidate skill profile against merged role/JD skill requirements.
   */
  public static matchSkills(
    candidateProfile: ResumeSkillProfile,
    requirements: JobSkillRequirement[]
  ): RequirementMatchResult[] {
    const candidateSkillMap = new Map(
      candidateProfile.skills.map((s) => [s.skillId, s])
    );

    const results: RequirementMatchResult[] = [];

    for (const req of requirements) {
      const canonicalReqSkill = SkillNormalizer.getById(req.skillId);
      const reqCanonicalId = req.skillId;
      const canonicalName = req.canonicalName || canonicalReqSkill?.canonicalName || req.skillId;

      const sources: MatchSource =
        req.sources.includes("ROLE_BENCHMARK") && req.sources.includes("JOB_DESCRIPTION")
          ? "BOTH"
          : req.sources.includes("JOB_DESCRIPTION")
          ? "JOB_DESCRIPTION"
          : "ROLE_BENCHMARK";

      // 1. Direct Exact / Alias Match
      if (candidateSkillMap.has(reqCanonicalId)) {
        const candidateSkill = candidateSkillMap.get(reqCanonicalId)!;
        results.push({
          requirementId: reqCanonicalId,
          canonicalName,
          category: "SKILL",
          requirementType: req.requirementType,
          source: sources,
          status: "MATCHED",
          confidence: parseFloat((candidateSkill.confidence * (req.confidence || 0.95)).toFixed(2)),
          candidateEvidenceIds: candidateSkill.evidenceIds,
          requirementEvidenceIds: req.evidenceIds,
          rationaleCode: "EXACT_SKILL_MATCH",
          candidateSkillId: candidateSkill.skillId,
        });
        continue;
      }

      // 2. Parent / Child and Related Skill Matching via Phase 2 Catalog
      let relatedFound = false;

      if (canonicalReqSkill) {
        // A. Check if candidate has a related skill
        for (const relId of canonicalReqSkill.relatedSkillIds || []) {
          if (candidateSkillMap.has(relId)) {
            const candidateSkill = candidateSkillMap.get(relId)!;
            const relDef = SkillNormalizer.getById(relId);
            results.push({
              requirementId: reqCanonicalId,
              canonicalName,
              category: "SKILL",
              requirementType: req.requirementType,
              source: sources,
              status: "RELATED",
              confidence: parseFloat((candidateSkill.confidence * 0.85).toFixed(2)),
              candidateEvidenceIds: candidateSkill.evidenceIds,
              requirementEvidenceIds: req.evidenceIds,
              rationaleCode: "RELATED_SKILL_MATCH",
              candidateSkillId: candidateSkill.skillId,
              relatedSkillName: relDef?.canonicalName || candidateSkill.canonicalName,
            });
            relatedFound = true;
            break;
          }
        }

        if (relatedFound) continue;

        // B. Check if candidate has parent skill
        if (canonicalReqSkill.parentSkillId && candidateSkillMap.has(canonicalReqSkill.parentSkillId)) {
          const candidateSkill = candidateSkillMap.get(canonicalReqSkill.parentSkillId)!;
          const parentDef = SkillNormalizer.getById(canonicalReqSkill.parentSkillId);
          results.push({
            requirementId: reqCanonicalId,
            canonicalName,
            category: "SKILL",
            requirementType: req.requirementType,
            source: sources,
            status: "RELATED",
            confidence: parseFloat((candidateSkill.confidence * 0.80).toFixed(2)),
            candidateEvidenceIds: candidateSkill.evidenceIds,
            requirementEvidenceIds: req.evidenceIds,
            rationaleCode: "PARENT_SKILL_MATCH",
            candidateSkillId: candidateSkill.skillId,
            relatedSkillName: parentDef?.canonicalName,
          });
          continue;
        }
      }

      // 3. Not Detected in candidate resume evidence
      results.push({
        requirementId: reqCanonicalId,
        canonicalName,
        category: "SKILL",
        requirementType: req.requirementType,
        source: sources,
        status: "NOT_DETECTED",
        confidence: 0.95,
        candidateEvidenceIds: [],
        requirementEvidenceIds: req.evidenceIds,
        rationaleCode: "SKILL_NOT_DETECTED_IN_RESUME",
      });
    }

    return results;
  }
}
