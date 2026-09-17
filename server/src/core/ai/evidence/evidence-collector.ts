import { RawEvidenceItem } from "./types";
import { EvidenceOwnershipError } from "./evidence-errors";
import { ProfileModel } from "@/database/models/Profile.model";
import { ResumeModel } from "@/database/models/Resume.model";
import { resumeAtsEngine } from "@/modules/resume/resume.ats";
import { SkillGapService } from "@/modules/career-plan/skill-gap.service";
import { EmployabilityService } from "@/modules/career-plan/employability.service";

export interface EvidenceCollectorOptions {
  userId: string;
  targetRole?: string;
  resumeId?: string;
}

export class EvidenceCollector {
  /**
   * Collects raw evidence items from authoritative deterministic SKILLEZO engines
   * for an authenticated candidate. Never trusts model-supplied or client-supplied IDs.
   */
  public static async collectRawEvidence(
    options: EvidenceCollectorOptions
  ): Promise<RawEvidenceItem[]> {
    const { userId, targetRole, resumeId } = options;

    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      throw new EvidenceOwnershipError(
        "Candidate identity must originate from authenticated context. Invalid or missing userId."
      );
    }

    const rawEvidence: RawEvidenceItem[] = [];
    const now = new Date();

    // 1. Profile Data Collection
    let profile: any = null;
    try {
      profile = await ProfileModel.findOne({ userId }).lean();
      if (profile) {
        const profileId = profile._id ? profile._id.toString() : `profile_${userId}`;

        if (Array.isArray(profile.skills) && profile.skills.length > 0) {
          const extractedSkillNames = profile.skills
            .map((s: any) => (typeof s === "string" ? s.trim() : (s?.name || "").trim()))
            .filter(Boolean);

          rawEvidence.push({
            sourceEngine: "ProfileService",
            sourceEntity: "Profile",
            sourceId: profileId,
            metric: "profileSkills",
            value: extractedSkillNames,
            evidenceType: "EXTRACTED",
            verificationStatus: "VERIFIED",
            description: "Candidate skills extracted from active profile",
            extractedAt: now,
          });
        }

        if (Array.isArray(profile.projects)) {
          rawEvidence.push({
            sourceEngine: "ProfileService",
            sourceEntity: "Profile",
            sourceId: profileId,
            metric: "profileProjectsCount",
            value: profile.projects.length,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Total number of verified portfolio projects listed on candidate profile",
            extractedAt: now,
          });
        }

        if (profile.headline) {
          rawEvidence.push({
            sourceEngine: "ProfileService",
            sourceEntity: "Profile",
            sourceId: profileId,
            metric: "profileHeadline",
            value: profile.headline,
            evidenceType: "EXTRACTED",
            verificationStatus: "VERIFIED",
            description: "Candidate profile professional headline",
            extractedAt: now,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[EvidenceCollector] Failed to collect profile evidence for ${userId}:`, err?.message);
    }

    // 2. Resume & ATS Engine Collection
    let activeResume: any = null;
    try {
      if (resumeId) {
        // Enforce strict candidate ownership: resume must belong to authenticated candidate
        activeResume = await ResumeModel.findById(resumeId).lean();
        if (activeResume && activeResume.userId !== userId) {
          throw new EvidenceOwnershipError(
            `Candidate ${userId} unauthorized to access resume entity ${resumeId}`,
            { candidateId: userId, requestedResumeId: resumeId }
          );
        }
      } else {
        // Find candidate's default or latest resume
        activeResume =
          (await ResumeModel.findOne({ userId, isDefault: true }).lean()) ||
          (await ResumeModel.findOne({ userId }).sort({ updatedAt: -1 }).lean());
      }

      if (activeResume) {
        const resumeEntityId = activeResume._id ? activeResume._id.toString() : "active_resume";
        const extracted = activeResume.extractedData || {};
        const rawText = activeResume.rawText || "";

        // Build effective text for ATS Engine
        const effectiveText =
          rawText && rawText.length > 50
            ? rawText
            : [
                extracted.summary,
                ...(extracted.skills || []).map((s: any) => (typeof s === "string" ? s : s.name)),
                ...(extracted.experience || []).map(
                  (e: any) => `${e.jobTitle || ""} ${e.companyName || ""} ${e.description || ""}`
                ),
                ...(extracted.projects || []).map(
                  (p: any) => `${p.title || ""} ${(p.technologies || []).join(" ")} ${p.description || ""}`
                ),
              ]
                .filter(Boolean)
                .join(" ");

        // Run deterministic ATS engine analysis
        const atsAnalysis = resumeAtsEngine.analyze(extracted, effectiveText);

        if (typeof atsAnalysis.overallScore === "number") {
          rawEvidence.push({
            sourceEngine: "ResumeAtsEngine",
            sourceEntity: "Resume",
            sourceId: resumeEntityId,
            metric: "atsCompatibilityScore",
            value: Math.min(100, Math.max(0, Math.round(atsAnalysis.overallScore))),
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Deterministic ATS overall compatibility score calculated against industry parser criteria",
            extractedAt: now,
          });
        }

        if (atsAnalysis.breakdown) {
          if (typeof atsAnalysis.breakdown.keywordMatch === "number") {
            rawEvidence.push({
              sourceEngine: "ResumeAtsEngine",
              sourceEntity: "Resume",
              sourceId: resumeEntityId,
              metric: "resumeKeywordMatchScore",
              value: Math.min(100, Math.max(0, Math.round(atsAnalysis.breakdown.keywordMatch))),
              evidenceType: "DETERMINISTIC",
              verificationStatus: "VERIFIED",
              description: "ATS keyword density and match score",
              extractedAt: now,
            });
          }

          if (typeof atsAnalysis.breakdown.structure === "number") {
            rawEvidence.push({
              sourceEngine: "ResumeAtsEngine",
              sourceEntity: "Resume",
              sourceId: resumeEntityId,
              metric: "resumeStructureScore",
              value: Math.min(100, Math.max(0, Math.round(atsAnalysis.breakdown.structure))),
              evidenceType: "DETERMINISTIC",
              verificationStatus: "VERIFIED",
              description: "ATS document section structure and parsing compatibility score",
              extractedAt: now,
            });
          }

          if (typeof atsAnalysis.breakdown.impact === "number") {
            rawEvidence.push({
              sourceEngine: "ResumeAtsEngine",
              sourceEntity: "Resume",
              sourceId: resumeEntityId,
              metric: "resumeImpactScore",
              value: Math.min(100, Math.max(0, Math.round(atsAnalysis.breakdown.impact))),
              evidenceType: "DETERMINISTIC",
              verificationStatus: "VERIFIED",
              description: "Resume action-verb and quantitative impact scoring",
              extractedAt: now,
            });
          }
        }

        if (Array.isArray(extracted.skills) && extracted.skills.length > 0) {
          const skillsList = extracted.skills
            .map((s: any) => (typeof s === "string" ? s.trim() : (s?.name || "").trim()))
            .filter(Boolean);

          rawEvidence.push({
            sourceEngine: "ResumeDocumentNormalizer",
            sourceEntity: "Resume",
            sourceId: resumeEntityId,
            metric: "resumeExtractedSkills",
            value: skillsList,
            evidenceType: "EXTRACTED",
            verificationStatus: "VERIFIED",
            description: "Skills extracted directly from parsed candidate resume",
            extractedAt: now,
          });
        }
      }
    } catch (err: any) {
      if (err instanceof EvidenceOwnershipError) {
        throw err;
      }
      console.warn(`[EvidenceCollector] Failed to collect resume evidence for ${userId}:`, err?.message);
    }

    // 3. Skill Gap Engine Collection
    try {
      const skillGap = await SkillGapService.getCandidateSkillGap(userId, targetRole);
      if (skillGap) {
        const gapSourceId = `skillgap_${userId}_${(targetRole || skillGap.targetRole || "default").toLowerCase().replace(/\s+/g, "_")}`;

        if (typeof skillGap.overallMatchScore === "number") {
          rawEvidence.push({
            sourceEngine: "SkillGapEngine",
            sourceEntity: "SkillGapAnalysis",
            sourceId: gapSourceId,
            metric: "skillGapMatchScore",
            value: Math.min(100, Math.max(0, Math.round(skillGap.overallMatchScore))),
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: `Deterministic role readiness match score for benchmark target role: ${skillGap.targetRole}`,
            extractedAt: now,
          });
        }

        if (typeof skillGap.skillsMissingCount === "number") {
          rawEvidence.push({
            sourceEngine: "SkillGapEngine",
            sourceEntity: "SkillGapAnalysis",
            sourceId: gapSourceId,
            metric: "skillGapMissingCount",
            value: skillGap.skillsMissingCount,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Number of missing skills required for target role",
            extractedAt: now,
          });
        }

        if (Array.isArray(skillGap.competencies)) {
          const missing = skillGap.competencies
            .filter((c) => c.status === "Gap")
            .map((c) => c.skill);

          const strengths = skillGap.competencies
            .filter((c) => c.status === "Matched")
            .map((c) => c.skill);

          if (missing.length > 0) {
            rawEvidence.push({
              sourceEngine: "SkillGapEngine",
              sourceEntity: "SkillGapAnalysis",
              sourceId: gapSourceId,
              metric: "skillGapMissingSkills",
              value: missing,
              evidenceType: "DETERMINISTIC",
              verificationStatus: "VERIFIED",
              description: "Identified missing competencies required for target benchmark role",
              extractedAt: now,
            });
          }

          if (strengths.length > 0) {
            rawEvidence.push({
              sourceEngine: "SkillGapEngine",
              sourceEntity: "SkillGapAnalysis",
              sourceId: gapSourceId,
              metric: "skillGapStrengths",
              value: strengths,
              evidenceType: "DETERMINISTIC",
              verificationStatus: "VERIFIED",
              description: "Candidate demonstrated skill proficiencies meeting target role requirements",
              extractedAt: now,
            });
          }
        }

        if (skillGap.targetRole) {
          rawEvidence.push({
            sourceEngine: "SkillGapEngine",
            sourceEntity: "SkillGapAnalysis",
            sourceId: gapSourceId,
            metric: "skillGapTargetRole",
            value: skillGap.targetRole,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Benchmark role evaluated during skill gap calculation",
            extractedAt: now,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[EvidenceCollector] Failed to collect skill gap evidence for ${userId}:`, err?.message);
    }

    // 4. Employability Engine Collection
    try {
      const employability = await EmployabilityService.getCandidateEmployability(userId, targetRole);
      if (employability) {
        const empSourceId = `employability_${userId}`;

        if (typeof employability.overallScore === "number") {
          rawEvidence.push({
            sourceEngine: "EmployabilityEngine",
            sourceEntity: "EmployabilityAnalysis",
            sourceId: empSourceId,
            metric: "employabilityOverallScore",
            value: Math.min(100, Math.max(0, Math.round(employability.overallScore))),
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Comprehensive multi-factor career readiness and employability score",
            extractedAt: now,
          });
        }

        if (employability.tierStatus) {
          rawEvidence.push({
            sourceEngine: "EmployabilityEngine",
            sourceEntity: "EmployabilityAnalysis",
            sourceId: empSourceId,
            metric: "employabilityTierStatus",
            value: employability.tierStatus,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Tiered employability readiness categorization",
            extractedAt: now,
          });
        }

        if (employability.metrics) {
          rawEvidence.push({
            sourceEngine: "EmployabilityEngine",
            sourceEntity: "EmployabilityAnalysis",
            sourceId: empSourceId,
            metric: "employabilityMetrics",
            value: employability.metrics,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Readiness breakdown across technicalReadiness, resumeStrength, projectStrength, skillAlignment, and recruiterVisibility",
            extractedAt: now,
          });
        }

        if (Array.isArray(employability.strengths) && employability.strengths.length > 0) {
          rawEvidence.push({
            sourceEngine: "EmployabilityEngine",
            sourceEntity: "EmployabilityAnalysis",
            sourceId: empSourceId,
            metric: "employabilityStrengths",
            value: employability.strengths,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Authoritative candidate career strengths",
            extractedAt: now,
          });
        }

        if (Array.isArray(employability.improvementAreas) && employability.improvementAreas.length > 0) {
          rawEvidence.push({
            sourceEngine: "EmployabilityEngine",
            sourceEntity: "EmployabilityAnalysis",
            sourceId: empSourceId,
            metric: "employabilityImprovementAreas",
            value: employability.improvementAreas,
            evidenceType: "DETERMINISTIC",
            verificationStatus: "VERIFIED",
            description: "Authoritative candidate areas for career improvement",
            extractedAt: now,
          });
        }
      }
    } catch (err: any) {
      console.warn(`[EvidenceCollector] Failed to collect employability evidence for ${userId}:`, err?.message);
    }

    return rawEvidence;
  }
}
