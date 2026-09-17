import { describe, it, expect, vi, beforeEach } from "vitest";
import { EvidenceValidator } from "@/core/ai/evidence/evidence-validator";
import { EvidenceNormalizer } from "@/core/ai/evidence/evidence-normalizer";
import { EvidenceBundleService } from "@/core/ai/evidence/evidence-bundle";
import { EvidenceCollector } from "@/core/ai/evidence/evidence-collector";
import {
  EvidenceValidationError,
  EvidenceOwnershipError,
} from "@/core/ai/evidence/evidence-errors";
import { RawEvidenceItem } from "@/core/ai/evidence/types";
import { ProfileModel } from "@/database/models/Profile.model";
import { ResumeModel } from "@/database/models/Resume.model";
import { SkillGapService } from "@/modules/career-plan/skill-gap.service";
import { EmployabilityService } from "@/modules/career-plan/employability.service";

describe("Phase 2: Evidence Layer Unit Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ProfileModel, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
    vi.spyOn(ResumeModel, "findOne").mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);
  });
  describe("Evidence Validator", () => {
    it("rejects null or undefined items", () => {
      expect(() => EvidenceValidator.validateItem(null as any)).toThrow(
        EvidenceValidationError
      );
    });

    it("rejects items with missing sourceEngine, sourceEntity, or metric", () => {
      const invalidItem: RawEvidenceItem = {
        sourceEngine: "",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: 85,
        evidenceType: "DETERMINISTIC",
      };
      expect(() => EvidenceValidator.validateItem(invalidItem)).toThrow(
        /must have a valid non-empty sourceEngine/
      );

      const invalidEntity: RawEvidenceItem = {
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "",
        metric: "atsCompatibilityScore",
        value: 85,
        evidenceType: "DETERMINISTIC",
      };
      expect(() => EvidenceValidator.validateItem(invalidEntity)).toThrow(
        /must have a valid non-empty sourceEntity/
      );
    });

    it("rejects items with null or undefined value", () => {
      const nullValueItem: RawEvidenceItem = {
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: null,
        evidenceType: "DETERMINISTIC",
      };
      expect(() => EvidenceValidator.validateItem(nullValueItem)).toThrow(
        /has null or undefined value/
      );
    });

    it("rejects unsupported evidence types", () => {
      const invalidTypeItem: any = {
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: 85,
        evidenceType: "UNSUPPORTED_TYPE",
      };
      expect(() => EvidenceValidator.validateItem(invalidTypeItem)).toThrow(
        /Unsupported evidenceType/
      );
    });

    it("rejects DETERMINISTIC evidence claiming unapproved sourceEngine", () => {
      const unapprovedEngineItem: RawEvidenceItem = {
        sourceEngine: "UnapprovedEngineX",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: 85,
        evidenceType: "DETERMINISTIC",
        verificationStatus: "VERIFIED",
      };
      expect(() => EvidenceValidator.validateItem(unapprovedEngineItem)).toThrow(
        /claims unapproved sourceEngine/
      );
    });

    it("enforces anti-masquerade rule: AI_GENERATED cannot masquerade as VERIFIED source of truth", () => {
      const masqueradingItem: RawEvidenceItem = {
        sourceEngine: "ProfileService",
        sourceEntity: "Profile",
        metric: "profileHeadline",
        value: "Senior Full-Stack Engineer",
        evidenceType: "AI_GENERATED",
        verificationStatus: "VERIFIED",
      };
      expect(() => EvidenceValidator.validateItem(masqueradingItem)).toThrow(
        /AI_GENERATED evidence cannot be marked as VERIFIED/
      );
    });

    it("rejects out-of-bounds score metrics (>100 or <0) without silently clamping", () => {
      const negativeScore: RawEvidenceItem = {
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: -5,
        evidenceType: "DETERMINISTIC",
        verificationStatus: "VERIFIED",
      };
      expect(() => EvidenceValidator.validateItem(negativeScore)).toThrow(
        /out of bounds \[0, 100\]/
      );

      const excessiveScore: RawEvidenceItem = {
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: 120,
        evidenceType: "DETERMINISTIC",
        verificationStatus: "VERIFIED",
      };
      expect(() => EvidenceValidator.validateItem(excessiveScore)).toThrow(
        /out of bounds \[0, 100\]/
      );
    });

    it("passes valid deterministic evidence from approved engines within bounds", () => {
      const validItem: RawEvidenceItem = {
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "Resume",
        sourceId: "res_123",
        metric: "atsCompatibilityScore",
        value: 88,
        evidenceType: "DETERMINISTIC",
        verificationStatus: "VERIFIED",
      };
      expect(() => EvidenceValidator.validateItem(validItem)).not.toThrow();
    });
  });

  describe("Evidence Normalizer", () => {
    it("normalizes raw items and produces deterministic IDs", () => {
      const raw: RawEvidenceItem[] = [
        {
          sourceEngine: "SkillGapEngine",
          sourceEntity: "SkillGapAnalysis",
          sourceId: "role_fs",
          metric: "skillGapMatchScore",
          value: 75,
          evidenceType: "DETERMINISTIC",
          verificationStatus: "VERIFIED",
        },
      ];

      const normalized1 = EvidenceNormalizer.normalize("cand_1", raw);
      const normalized2 = EvidenceNormalizer.normalize("cand_1", raw);

      expect(normalized1).toHaveLength(1);
      expect(normalized1[0].id).toBe(normalized2[0].id);
      expect(normalized1[0].id).toMatch(/^ev_skillgapengine_skillgapmatchscore_/);
      expect(normalized1[0].verificationStatus).toBe("VERIFIED");
    });

    it("deduplicates identical duplicate items cleanly", () => {
      const raw: RawEvidenceItem[] = [
        {
          sourceEngine: "SkillGapEngine",
          sourceEntity: "SkillGapAnalysis",
          sourceId: "role_fs",
          metric: "skillGapMatchScore",
          value: 75,
          evidenceType: "DETERMINISTIC",
        },
        {
          sourceEngine: "SkillGapEngine",
          sourceEntity: "SkillGapAnalysis",
          sourceId: "role_fs",
          metric: "skillGapMatchScore",
          value: 75,
          evidenceType: "DETERMINISTIC",
        },
      ];

      const normalized = EvidenceNormalizer.normalize("cand_1", raw);
      expect(normalized).toHaveLength(1);
      expect(normalized[0].verificationStatus).toBe("VERIFIED");
    });

    it("flags conflicting evidence as REVIEW_REQUIRED without arbitrarily overwriting", () => {
      const raw: RawEvidenceItem[] = [
        {
          sourceEngine: "SkillGapEngine",
          sourceEntity: "SkillGapAnalysis",
          sourceId: "role_fs",
          metric: "skillGapMatchScore",
          value: 75,
          evidenceType: "DETERMINISTIC",
        },
        {
          sourceEngine: "SkillGapEngine",
          sourceEntity: "SkillGapAnalysis",
          sourceId: "role_fs",
          metric: "skillGapMatchScore",
          value: 90, // Conflict!
          evidenceType: "DETERMINISTIC",
        },
      ];

      const normalized = EvidenceNormalizer.normalize("cand_1", raw);
      expect(normalized).toHaveLength(1);
      expect(normalized[0].verificationStatus).toBe("REVIEW_REQUIRED");
      expect(normalized[0].conflictDetails).toBeDefined();
      expect(normalized[0].conflictDetails).toContain("Conflicting evidence detected");
    });
  });

  describe("Evidence Collector & Ownership Enforcement", () => {
    it("throws EvidenceOwnershipError if candidate userId is missing or empty", async () => {
      await expect(
        EvidenceCollector.collectRawEvidence({ userId: "" })
      ).rejects.toThrow(EvidenceOwnershipError);

      await expect(
        EvidenceBundleService.buildCandidateEvidence({ userId: "" })
      ).rejects.toThrow(EvidenceOwnershipError);
    });

    it("prevents candidate from accessing another candidate's resume", async () => {
      vi.spyOn(ResumeModel, "findById").mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "res_other",
          userId: "attacker_id",
          rawText: "Resume text",
        }),
      } as any);

      await expect(
        EvidenceCollector.collectRawEvidence({
          userId: "legitimate_user",
          resumeId: "res_other",
        })
      ).rejects.toThrow(EvidenceOwnershipError);
    });

    it("assembles complete CandidateEvidenceBundle with accurate stats", async () => {
      vi.spyOn(ProfileModel, "findOne").mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "prof_1",
          userId: "cand_1",
          headline: "Full-Stack Dev",
          skills: [{ name: "TypeScript" }, { name: "React" }],
          projects: [{ title: "Portfolio" }],
        }),
      } as any);

      vi.spyOn(ResumeModel, "findOne").mockReturnValue({
        lean: vi.fn().mockResolvedValue({
          _id: "res_1",
          userId: "cand_1",
          rawText: "Senior Developer TypeScript React Node.js",
          extractedData: { skills: ["TypeScript", "Node.js"] },
        }),
      } as any);

      vi.spyOn(SkillGapService, "getCandidateSkillGap").mockResolvedValue({
        targetRole: "Full-Stack Engineer",
        availableRoles: ["Full-Stack Engineer"],
        overallMatchScore: 82,
        skillsAcquiredCount: 4,
        skillsRequiredCount: 5,
        skillsMissingCount: 1,
        radarCategories: [],
        competencies: [
          {
            id: "1",
            skill: "TypeScript",
            category: "Frontend",
            currentLevel: "Advanced",
            requiredLevel: "Advanced",
            currentNumeric: 90,
            requiredNumeric: 85,
            gap: 0,
            priority: "Low",
            status: "Matched",
          },
          {
            id: "2",
            skill: "Docker",
            category: "DevOps",
            currentLevel: "Beginner",
            requiredLevel: "Intermediate",
            currentNumeric: 30,
            requiredNumeric: 70,
            gap: 40,
            priority: "High",
            status: "Gap",
          },
        ],
        priorityRecommendations: [],
      });

      vi.spyOn(EmployabilityService, "getCandidateEmployability").mockResolvedValue({
        overallScore: 80,
        tierStatus: "Top 15%",
        targetTier: "Top 5%",
        targetRole: "Full-Stack Engineer",
        metrics: {
          technicalReadiness: 85,
          resumeStrength: 80,
          projectStrength: 75,
          skillAlignment: 82,
          recruiterVisibility: 78,
        },
        factors: {} as any,
        strengths: ["Strong TypeScript knowledge"],
        improvementAreas: ["Cloud deployment experience"],
        actionList: [],
        careerGps: {
          ready: false,
          milestones: [],
        },
      });

      const bundle = await EvidenceBundleService.buildCandidateEvidence({
        userId: "cand_1",
        targetRole: "Full-Stack Engineer",
      });

      expect(bundle.candidateId).toBe("cand_1");
      expect(bundle.targetRole).toBe("Full-Stack Engineer");
      expect(bundle.items.length).toBeGreaterThan(0);
      expect(bundle.stats.total).toBe(bundle.items.length);
      expect(bundle.stats.deterministicCount).toBeGreaterThan(0);

      // Verify deterministic scores are present and verified
      const atsScoreItem = bundle.items.find(
        (i) => i.metric === "atsCompatibilityScore"
      );
      expect(atsScoreItem).toBeDefined();
      expect(atsScoreItem?.verificationStatus).toBe("VERIFIED");
      expect(atsScoreItem?.evidenceType).toBe("DETERMINISTIC");

      const gapScoreItem = bundle.items.find(
        (i) => i.metric === "skillGapMatchScore"
      );
      expect(gapScoreItem).toBeDefined();
      expect(gapScoreItem?.value).toBe(82);

      const empScoreItem = bundle.items.find(
        (i) => i.metric === "employabilityOverallScore"
      );
      expect(empScoreItem).toBeDefined();
      expect(empScoreItem?.value).toBe(80);
    });
  });
});
