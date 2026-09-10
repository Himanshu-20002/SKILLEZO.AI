import { describe, it, expect } from "vitest";
import {
  optimizationIntelligenceService,
  OptimizationTargetResolver,
  OptimizationValidator,
  OptimizationDiff,
  OptimizationRescorer,
  OPTIMIZATION_ENGINE_VERSION,
  ResumeScoreSnapshot,
  ResumeOptimizationDraft,
} from "@/modules/resume-intelligence";

describe("Phase 7 Final Audit: Resume Optimization + Deterministic Re-score", () => {
  const sampleExtractedData = {
    skills: ["TypeScript", "Node.js", "React"],
    experience: [
      {
        companyName: "Acme Corp",
        jobTitle: "Software Engineer",
        startDate: "2021-01",
        endDate: "2023-01",
        description: "Worked on React applications.\nResponsible for backend APIs.",
      },
    ],
    projects: [
      {
        title: "Cloud Dashboard",
        description: "Built real-time web portal using React and Node.js.",
        technologies: ["React", "Node.js"],
      },
    ],
    education: [
      {
        institution: "Tech University",
        degree: "B.S. Computer Science",
        endYear: 2020,
      },
    ],
  };

  const sampleScores: ResumeScoreSnapshot = {
    atsScore: 82,
    matchScore: 74,
    contentScore: 68,
    timestamp: "2026-09-09T10:00:00.000Z",
  };

  describe("1. Target Resolution & Non-Rewritable Missing Evidence Protection", () => {
    it("should resolve bullet target accurately for actionable recommendations", () => {
      const rec = {
        id: "rec_bullet_1",
        category: "IMPACT",
        actionability: "FIX_NOW",
        evidenceIds: ["experience_0_bullet_0"],
        skillIds: ["React"],
      };

      const target = OptimizationTargetResolver.resolveTarget(rec, sampleExtractedData);

      expect(target.recommendationId).toBe("rec_bullet_1");
      expect(target.type).toBe("IMPROVE_IMPACT");
      expect(target.section).toBe("EXPERIENCE");
      expect(target.isRewritable).toBe(true);
      expect(target.sourceText).toContain("React");
      expect(target.engineVersion).toBe(OPTIMIZATION_ENGINE_VERSION);
    });

    it("should mark recommendations requiring new factual evidence as NOT rewritable", () => {
      const missingSkillRec = {
        id: "rec_missing_docker",
        category: "MATCH",
        actionability: "REQUIRES_NEW_EVIDENCE",
        skillIds: ["Docker"],
      };

      const target = OptimizationTargetResolver.resolveTarget(missingSkillRec, sampleExtractedData);

      expect(target.isRewritable).toBe(false);
      expect(target.nonRewritableReason).toContain("genuine candidate experience");
    });
  });

  describe("2. Factual Safety & Anti-Hallucination Validator", () => {
    it("should PASS when rewrite preserves factual claims and existing skills", () => {
      const original = "Worked on React applications.";
      const proposed = "Developed reusable React components for dashboard applications.";
      const verifiedSkills = ["React", "Node.js", "TypeScript"];

      const result = OptimizationValidator.validateProposal(
        original,
        proposed,
        verifiedSkills,
        "Experienced frontend developer specializing in React."
      );

      expect(result.valid).toBe(true);
      expect(result.safetyLevel).toBe("SAFE");
      expect(result.errors.length).toBe(0);
    });

    it("should REJECT and BLOCK proposals that fabricate unverified metrics", () => {
      const original = "Improved backend performance.";
      const proposed = "Improved backend performance by 45%, saving $100K annually.";
      const verifiedSkills = ["Node.js"];

      const result = OptimizationValidator.validateProposal(
        original,
        proposed,
        verifiedSkills,
        "Backend engineer working with Node.js."
      );

      expect(result.valid).toBe(false);
      expect(result.safetyLevel).toBe("BLOCKED");
      expect(result.errors.some((e) => e.code === "UNSUPPORTED_METRIC")).toBe(true);
      expect(result.unsupportedClaims).toContain("45%");
    });

    it("should REJECT and BLOCK proposals that introduce unverified technologies/skills", () => {
      const original = "Built RESTful APIs using Node.js.";
      const proposed = "Built scalable microservices in Node.js deployed on Kubernetes and Docker.";
      const verifiedSkills = ["Node.js", "JavaScript"]; // Kubernetes and Docker are missing

      const result = OptimizationValidator.validateProposal(
        original,
        proposed,
        verifiedSkills,
        "Developed backend services using Node.js."
      );

      expect(result.valid).toBe(false);
      expect(result.safetyLevel).toBe("BLOCKED");
      expect(result.errors.some((e) => e.code === "UNSUPPORTED_SKILL")).toBe(true);
      expect(result.addedSkills.length).toBeGreaterThan(0);
    });

    it("should REJECT and BLOCK unauthorized ownership escalation (e.g. 'assisted' -> 'led')", () => {
      const original = "Worked with the team to develop backend APIs.";
      const proposed = "Led backend API architecture across the engineering team.";
      const verifiedSkills = ["Node.js"];

      const result = OptimizationValidator.validateProposal(
        original,
        proposed,
        verifiedSkills,
        "Software developer working on backend APIs."
      );

      expect(result.valid).toBe(false);
      expect(result.safetyLevel).toBe("BLOCKED");
      expect(result.errors.some((e) => e.code === "UNAUTHORIZED_OWNERSHIP_ESCALATION")).toBe(true);
    });

    it("should issue warnings for unusually short or long bullet points", () => {
      const original = "Developed APIs.";
      const proposed = "Built APIs."; // 2 words (< 5)

      const result = OptimizationValidator.validateProposal(original, proposed, ["API"]);
      expect(result.warnings.some((w) => w.code === "SHORT_PROPOSAL")).toBe(true);
      expect(result.safetyLevel).toBe("REVIEW");
    });
  });

  describe("3. Diff Calculation", () => {
    it("should compute accurate word-level diffs", () => {
      const original = "Worked on React applications.";
      const proposed = "Developed React applications.";

      const diff = OptimizationDiff.computeDiff(original, proposed);

      expect(diff.some((d) => d.type === "REMOVED" && d.value === "worked")).toBe(true);
      expect(diff.some((d) => d.type === "ADDED" && d.value === "developed")).toBe(true);
      expect(diff.some((d) => d.type === "UNCHANGED" && d.value === "react")).toBe(true);
    });
  });

  describe("4. Deterministic Re-Score & Regression Detection", () => {
    it("should re-score draft and detect score improvements", () => {
      const target = {
        recommendationId: "rec_1",
        type: "IMPROVE_IMPACT" as const,
        section: "EXPERIENCE" as const,
        bulletId: "exp_0_bullet_0",
        sourceText: "Worked on React applications.",
        sourceEvidenceIds: ["exp_0_bullet_0"],
        constraints: [],
        isRewritable: true,
        engineVersion: OPTIMIZATION_ENGINE_VERSION,
      };

      const baselineRes = OptimizationRescorer.rescoreDraft(
        sampleExtractedData,
        target,
        "Worked on React applications.",
        { atsScore: 80, matchScore: 70, contentScore: 50, timestamp: "initial" },
        "Frontend Engineer"
      );

      const proposed = "Developed responsive React web applications improving user engagement.";

      const { afterScores, comparison, decision } = OptimizationRescorer.rescoreDraft(
        sampleExtractedData,
        target,
        proposed,
        baselineRes.afterScores,
        "Frontend Engineer"
      );

      expect(afterScores.atsScore).toBeGreaterThanOrEqual(baselineRes.afterScores.atsScore);
      expect(comparison.delta.content).toBeDefined();
      expect(decision).toBe("IMPROVED");
      expect(comparison.regressed).toBe(false);
    });

    it("should detect material regression when score falls by more than threshold", () => {
      const target = {
        recommendationId: "rec_1",
        type: "IMPROVE_IMPACT" as const,
        section: "EXPERIENCE" as const,
        bulletId: "exp_0_bullet_0",
        sourceText: "Worked on React applications.",
        sourceEvidenceIds: ["exp_0_bullet_0"],
        constraints: [],
        isRewritable: true,
        engineVersion: OPTIMIZATION_ENGINE_VERSION,
      };

      // Artificially high beforeScores
      const highBeforeScores: ResumeScoreSnapshot = {
        atsScore: 95,
        matchScore: 95,
        contentScore: 95,
        timestamp: "2026-09-09T10:00:00.000Z",
      };

      const proposed = "Helped team.";

      const { comparison, decision } = OptimizationRescorer.rescoreDraft(
        sampleExtractedData,
        target,
        proposed,
        highBeforeScores,
        "Frontend Engineer"
      );

      expect(comparison.regressed).toBe(true);
      expect(decision).toBe("REGRESSED");
    });
  });

  describe("5. End-to-End Service Workflows (Propose, Accept, Reject, Immutability)", () => {
    it("should propose a valid optimization and generate deterministic scores", async () => {
      const draft = await optimizationIntelligenceService.proposeOptimization({
        resumeId: "res_123",
        baseResumeVersionId: "v1_orig",
        recommendation: {
          id: "rec_1",
          category: "IMPACT",
          actionability: "FIX_NOW",
          evidenceIds: ["experience_0_bullet_0"],
          skillIds: ["React"],
        },
        extractedData: sampleExtractedData,
        beforeScores: sampleScores,
        targetRole: "Frontend Engineer",
      });

      expect(draft.draftId).toBeDefined();
      expect(draft.status).toBe("VALIDATED");
      expect(draft.validation.valid).toBe(true);
      expect(draft.afterScores).toBeDefined();
    });

    it("should safely reject optimization for missing evidence recommendations", async () => {
      const draft = await optimizationIntelligenceService.proposeOptimization({
        resumeId: "res_123",
        recommendation: {
          id: "rec_docker",
          category: "MATCH",
          actionability: "REQUIRES_NEW_EVIDENCE",
          skillIds: ["Docker"],
        },
        extractedData: sampleExtractedData,
        beforeScores: sampleScores,
      });

      expect(draft.status).toBe("REJECTED");
      expect(draft.validation.valid).toBe(false);
      expect(draft.validation.errors[0].code).toBe("NON_REWRITABLE_TARGET");
    });

    it("should create a new version on acceptDraft without mutating the original extractedData", () => {
      const originalDataBackup = JSON.parse(JSON.stringify(sampleExtractedData));

      const mockDraft: ResumeOptimizationDraft = {
        draftId: "draft_test_1",
        resumeId: "res_123",
        baseResumeVersionId: "v1_original",
        recommendationId: "rec_1",
        target: {
          recommendationId: "rec_1",
          type: "REWRITE_BULLET",
          section: "EXPERIENCE",
          bulletId: "exp_0_bullet_0",
          sourceText: "Worked on React applications.",
          sourceEvidenceIds: [],
          constraints: [],
          isRewritable: true,
          engineVersion: OPTIMIZATION_ENGINE_VERSION,
        },
        originalText: "Worked on React applications.",
        proposedText: "Engineered scalable React web applications with modular components.",
        validation: {
          valid: true,
          safetyLevel: "SAFE",
          safetyScore: 100,
          errors: [],
          warnings: [],
          preservedEvidenceIds: [],
          unsupportedClaims: [],
          changedMetrics: [],
          addedSkills: [],
          changedOwnershipClaims: [],
          meaningPreserved: true,
        },
        beforeScores: sampleScores,
        afterScores: { atsScore: 83, matchScore: 75, contentScore: 74, timestamp: "now" },
        status: "VALIDATED",
        createdAt: "now",
      };

      const { newVersionId, updatedExtractedData, historyEntry } = optimizationIntelligenceService.acceptDraft(
        mockDraft,
        sampleExtractedData
      );

      expect(newVersionId).toBeDefined();
      expect(updatedExtractedData.experience[0].description).toContain("Engineered scalable React web applications");
      // Verify original object was NOT mutated
      expect(sampleExtractedData.experience[0].description).toBe(originalDataBackup.experience[0].description);
      expect(historyEntry.originalVersionId).toBe("v1_original");
      expect(historyEntry.resultingVersionId).toBe(newVersionId);
    });

    it("should leave the resume untouched when rejecting a draft", () => {
      const mockDraft: ResumeOptimizationDraft = {
        draftId: "draft_test_2",
        resumeId: "res_123",
        baseResumeVersionId: "v1_original",
        recommendationId: "rec_1",
        target: {
          recommendationId: "rec_1",
          type: "REWRITE_BULLET",
          section: "EXPERIENCE",
          sourceText: "Worked on React applications.",
          sourceEvidenceIds: [],
          constraints: [],
          isRewritable: true,
          engineVersion: OPTIMIZATION_ENGINE_VERSION,
        },
        originalText: "Worked on React applications.",
        proposedText: "Developed React applications.",
        validation: {
          valid: true,
          safetyLevel: "SAFE",
          safetyScore: 100,
          errors: [],
          warnings: [],
          preservedEvidenceIds: [],
          unsupportedClaims: [],
          changedMetrics: [],
          addedSkills: [],
          changedOwnershipClaims: [],
          meaningPreserved: true,
        },
        beforeScores: sampleScores,
        status: "VALIDATED",
        createdAt: "now",
      };

      const rejected = optimizationIntelligenceService.rejectDraft(mockDraft);
      expect(rejected.status).toBe("REJECTED");
    });
  });
});
