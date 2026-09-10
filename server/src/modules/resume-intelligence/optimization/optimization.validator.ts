import {
  OptimizationValidationResult,
  OptimizationValidationError,
  OptimizationValidationWarning,
  OptimizationSafetyLevel,
} from "./optimization.types";
import { OWNERSHIP_ESCALATION_PAIRS } from "./optimization.constants";
import { ContentImpactDetector } from "../content/content.impact";
import { SkillDetector } from "../skills/skill.detector";
import { CANONICAL_SKILL_CATALOG } from "../skills/skill.catalog";

export class OptimizationValidator {
  /**
   * Deterministically validates proposed resume optimization against candidate evidence.
   */
  public static validateProposal(
    originalText: string,
    proposedText: string,
    candidateVerifiedSkills: string[] = [],
    candidateEvidenceText = ""
  ): OptimizationValidationResult {
    const errors: OptimizationValidationError[] = [];
    const warnings: OptimizationValidationWarning[] = [];
    const unsupportedClaims: string[] = [];
    const changedMetrics: string[] = [];
    const addedSkills: string[] = [];
    const changedOwnershipClaims: string[] = [];

    const normOriginal = originalText.toLowerCase();
    const normProposed = proposedText.toLowerCase();
    const normEvidence = `${candidateEvidenceText} ${originalText}`.toLowerCase();

    // 1. Metric Validation (Phase 5 detector reuse)
    const proposedMetrics = ContentImpactDetector.extractMetrics(proposedText, "prop");
    for (const metric of proposedMetrics) {
      const raw = metric.rawValue.toLowerCase();
      if (!normEvidence.includes(raw)) {
        errors.push({
          code: "UNSUPPORTED_METRIC",
          message: `Proposed rewrite introduces unverified metric '${metric.rawValue}' not present in candidate evidence.`,
          unsupportedValue: metric.rawValue,
        });
        unsupportedClaims.push(metric.rawValue);
        changedMetrics.push(metric.rawValue);
      }
    }

    // 2. Skill Validation (Phase 2 detector reuse)
    const skillProfile = SkillDetector.detectAndBuildProfile({ summary: proposedText }, proposedText);
    const detectedInProposed = skillProfile.skills;
    const verifiedSkillNamesLower = candidateVerifiedSkills.map((s) => s.toLowerCase());

    const originalSkillProfile = SkillDetector.detectAndBuildProfile(
      { summary: originalText },
      `${candidateEvidenceText} ${originalText}`
    );
    const originalSkillIds = new Set(originalSkillProfile.skills.map((s) => s.skillId));
    const originalSkillNames = new Set(originalSkillProfile.skills.map((s) => s.canonicalName.toLowerCase()));

    for (const detected of detectedInProposed) {
      const nameLower = detected.canonicalName.toLowerCase();
      const inOriginal = originalSkillIds.has(detected.skillId) || originalSkillNames.has(nameLower) || normEvidence.includes(nameLower);
      const inVerified = verifiedSkillNamesLower.includes(nameLower);
      const canonicalDef = CANONICAL_SKILL_CATALOG.find((c) => c.id === detected.skillId);
      const aliasInEvidence = canonicalDef?.aliases?.some((a: string) => normEvidence.includes(a.toLowerCase())) ?? false;

      if (!inOriginal && !inVerified && !aliasInEvidence) {
        errors.push({
          code: "UNSUPPORTED_SKILL",
          message: `Proposed rewrite introduces new technology '${detected.canonicalName}' not supported by candidate background.`,
          unsupportedValue: detected.canonicalName,
        });
        unsupportedClaims.push(detected.canonicalName);
        addedSkills.push(detected.canonicalName);
      }
    }

    // 3. Ownership Escalation Check
    for (const pair of OWNERSHIP_ESCALATION_PAIRS) {
      const hadPassive = pair.passive.some((p) => normOriginal.includes(p));
      const hasEscalatedLead = pair.unauthorizedLeads.some((l) => {
        const regex = new RegExp(`\\b${l}\\b`, "i");
        return regex.test(normProposed) && !regex.test(normOriginal);
      });

      if (hadPassive && hasEscalatedLead) {
        errors.push({
          code: "UNAUTHORIZED_OWNERSHIP_ESCALATION",
          message: "Proposed rewrite escalated passive participation into unauthorized leadership ownership.",
        });
        changedOwnershipClaims.push("PASSIVE_TO_LEADERSHIP_ESCALATION");
      }
    }

    // 4. Word count & length checks
    const words = proposedText.trim().split(/\s+/);
    if (words.length < 5) {
      warnings.push({
        code: "SHORT_PROPOSAL",
        message: "Proposed bullet point is very short (< 5 words).",
      });
    } else if (words.length > 40) {
      warnings.push({
        code: "LONG_PROPOSAL",
        message: "Proposed bullet point exceeds 40 words.",
      });
    }

    const isValid = errors.length === 0;
    let safetyLevel: OptimizationSafetyLevel = "SAFE";
    let safetyScore = 100;

    if (!isValid) {
      safetyLevel = "BLOCKED";
      safetyScore = 0;
    } else if (warnings.length > 0) {
      safetyLevel = "REVIEW";
      safetyScore = 80;
    }

    return {
      valid: isValid,
      safetyLevel,
      safetyScore,
      errors,
      warnings,
      preservedEvidenceIds: [],
      unsupportedClaims,
      changedMetrics,
      addedSkills,
      changedOwnershipClaims,
      meaningPreserved: isValid,
    };
  }
}
