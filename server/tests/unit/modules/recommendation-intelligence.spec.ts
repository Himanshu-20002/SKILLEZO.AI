import { describe, it, expect } from "vitest";
import {
  recommendationIntelligenceService,
  RecommendationSignalCollector,
  RecommendationGrouper,
  RecommendationPrioritizer,
  RecommendationValidator,
  AIRecommendationExplanationSchema,
  RECOMMENDATION_ENGINE_VERSION,
  ExperienceMatcher,
} from "@/modules/resume-intelligence";

describe("Phase 6 Final Audit: AI Recommendation Orchestrator", () => {
  describe("1. Priority Normalization & Calculation", () => {
    it("should calculate normalized priorityScore strictly between 0.0 and 1.0 without NaN or Infinity", () => {
      const signals = [
        {
          id: "sig_1",
          groupKey: "skill:docker",
          category: "MATCH" as const,
          type: "MISSING_SKILL",
          severity: 0.95,
          impact: "VERY_HIGH" as const,
          relevance: 1.0,
          actionability: "REQUIRES_NEW_EVIDENCE" as const,
          confidence: 0.95,
          sourceIds: ["req_1"],
          evidenceIds: ["ev_1"],
          title: "Address Docker requirement",
          problem: "Docker is required.",
          whyItMatters: "Core tech.",
          suggestedAction: "Add project.",
        },
      ];

      const ranked = RecommendationPrioritizer.rankRecommendations(signals);
      expect(ranked[0].priorityScore).toBeGreaterThanOrEqual(0.0);
      expect(ranked[0].priorityScore).toBeLessThanOrEqual(1.0);
      expect(Number.isNaN(ranked[0].priorityScore)).toBe(false);
      expect(Number.isFinite(ranked[0].priorityScore)).toBe(true);
    });
  });

  describe("2. Required vs Preferred Skills Ranking", () => {
    it("should prioritize missing REQUIRED skills over missing PREFERRED skills", () => {
      const signals = [
        {
          id: "sig_pref",
          groupKey: "skill:graphql",
          category: "SKILL" as const,
          type: "MISSING_PREFERRED",
          severity: 0.65,
          impact: "MEDIUM" as const,
          relevance: 0.70,
          actionability: "REQUIRES_NEW_EVIDENCE" as const,
          confidence: 0.95,
          sourceIds: ["req_graphql"],
          evidenceIds: [],
          title: "Address GraphQL requirement",
          problem: "Preferred skill missing.",
          whyItMatters: "Boosts profile.",
          suggestedAction: "Add if experienced.",
        },
        {
          id: "sig_req",
          groupKey: "skill:docker",
          category: "MATCH" as const,
          type: "MISSING_REQUIRED",
          severity: 0.95,
          impact: "VERY_HIGH" as const,
          relevance: 1.0,
          actionability: "REQUIRES_NEW_EVIDENCE" as const,
          confidence: 0.95,
          sourceIds: ["req_docker"],
          evidenceIds: [],
          title: "Address Docker requirement",
          problem: "Required skill missing.",
          whyItMatters: "Core requirement.",
          suggestedAction: "Add if experienced.",
        },
      ];

      const ranked = RecommendationPrioritizer.rankRecommendations(signals);
      expect(ranked[0].id).toBe("sig_req");
      expect(ranked[0].priorityScore).toBeGreaterThan(ranked[1].priorityScore);
    });
  });

  describe("3. Grouping & Deduplication vs Unrelated Separation", () => {
    it("should merge multiple signals for the same skill into ONE recommendation and preserve all IDs", () => {
      const duplicateSignals = [
        {
          id: "sig_react_1",
          groupKey: "skill:react",
          category: "MATCH" as const,
          type: "WEAK_EVIDENCE",
          severity: 0.70,
          impact: "HIGH" as const,
          relevance: 0.90,
          actionability: "STRENGTHEN_EVIDENCE" as const,
          confidence: 0.90,
          sourceIds: ["source_1"],
          evidenceIds: ["ev_1"],
          skillIds: ["React"],
          requirementIds: ["req_react"],
          title: "Strengthen React evidence",
          problem: "React mentioned only once.",
          whyItMatters: "Important skill.",
          suggestedAction: "Elaborate React usage.",
        },
        {
          id: "sig_react_2",
          groupKey: "skill:react",
          category: "EVIDENCE" as const,
          type: "LOW_TECH_DEPTH",
          severity: 0.60,
          impact: "MEDIUM" as const,
          relevance: 0.85,
          actionability: "FIX_NOW" as const,
          confidence: 0.95,
          sourceIds: ["source_2"],
          evidenceIds: ["ev_2"],
          skillIds: ["React"],
          requirementIds: ["req_react"],
          title: "Add technical depth to React",
          problem: "React lacks architectural details.",
          whyItMatters: "Convinces hiring managers.",
          suggestedAction: "Add state management details.",
        },
      ];

      const grouped = RecommendationGrouper.groupSignals(duplicateSignals);
      expect(grouped.length).toBe(1);
      expect(grouped[0].sourceIds).toContain("source_1");
      expect(grouped[0].sourceIds).toContain("source_2");
      expect(grouped[0].evidenceIds).toContain("ev_1");
      expect(grouped[0].evidenceIds).toContain("ev_2");
      expect(grouped[0].skillIds).toContain("React");
    });

    it("should keep distinct skills separate and never cross-merge unrelated technologies", () => {
      const signals = [
        {
          id: "sig_docker",
          groupKey: "skill:docker",
          category: "MATCH" as const,
          type: "MISSING_SKILL",
          severity: 0.90,
          impact: "VERY_HIGH" as const,
          relevance: 1.0,
          actionability: "REQUIRES_NEW_EVIDENCE" as const,
          confidence: 0.95,
          sourceIds: ["source_docker"],
          evidenceIds: [],
          title: "Address Docker",
          problem: "Docker missing",
          whyItMatters: "Required",
          suggestedAction: "Add",
        },
        {
          id: "sig_k8s",
          groupKey: "skill:kubernetes",
          category: "MATCH" as const,
          type: "MISSING_SKILL",
          severity: 0.90,
          impact: "VERY_HIGH" as const,
          relevance: 1.0,
          actionability: "REQUIRES_NEW_EVIDENCE" as const,
          confidence: 0.95,
          sourceIds: ["source_k8s"],
          evidenceIds: [],
          title: "Address Kubernetes",
          problem: "K8s missing",
          whyItMatters: "Required",
          suggestedAction: "Add",
        },
      ];

      const grouped = RecommendationGrouper.groupSignals(signals);
      expect(grouped.length).toBe(2);
      expect(grouped.some((g) => g.groupKey === "skill:docker")).toBe(true);
      expect(grouped.some((g) => g.groupKey === "skill:kubernetes")).toBe(true);
    });
  });

  describe("4. Repetition Handling (Style Signal Protection)", () => {
    it("should treat repetition as a LOW or INFORMATIONAL style recommendation without inflating priority", () => {
      const repetitionSignal = {
        id: "sig_rep",
        groupKey: "style:repetition",
        category: "STRUCTURE" as const,
        type: "REPETITIVE_ACTION_VERBS",
        severity: 0.35,
        impact: "LOW" as const,
        relevance: 0.40,
        actionability: "INFORMATIONAL" as const,
        confidence: 0.90,
        sourceIds: ["rep_1"],
        evidenceIds: ["b1", "b2", "b3"],
        title: "Vary opening action verbs for writing diversity",
        problem: "Action verb 'Built' is repeated 4 times.",
        whyItMatters: "Keeps recruiters engaged.",
        suggestedAction: "Use synonymous power verbs.",
      };

      const ranked = RecommendationPrioritizer.rankRecommendations([repetitionSignal]);
      expect(ranked[0].priority).toBe("LOW");
      expect(ranked[0].priorityScore).toBeLessThan(0.45);
    });
  });

  describe("5. Experience-Year Overlap & Vague Duration Safety", () => {
    it("should not double count overlapping employment durations (2020-2023 and 2022-2025 is ~5 years)", () => {
      const expItems = [
        { startDate: "2020-01", endDate: "2023-01", title: "Dev 1", company: "A" },
        { startDate: "2022-01", endDate: "2025-01", title: "Dev 2", company: "B" },
      ];

      const years = ExperienceMatcher.calculateTotalYears(expItems);
      expect(years).toBeGreaterThanOrEqual(4.8);
      expect(years).toBeLessThanOrEqual(5.2);
    });

    it("should produce 0 years from vague text like 'Experienced backend developer'", () => {
      const expItems = [
        { title: "Experienced backend developer", company: "Tech" },
      ];

      const years = ExperienceMatcher.calculateTotalYears(expItems);
      expect(years).toBe(0);
    });
  });

  describe("6. NOT_DETECTED vs Accusatory Phrasing Safety", () => {
    it("should accept constructive phrasing: 'Docker is not currently detected'", () => {
      const rec = {
        id: "rec_docker",
        category: "MATCH" as const,
        title: "Address Docker requirement",
        summary: "Docker is not currently detected in your resume, but is expected for Full-Stack Engineer.",
        whyItMatters: "Required skills carry high weight in recruiter and ATS filtering.",
        priority: "HIGH" as const,
        impact: "HIGH" as const,
        actionability: "REQUIRES_NEW_EVIDENCE" as const,
        effort: "MEDIUM" as const,
        confidence: 0.95,
        priorityScore: 0.80,
        sourceIds: ["req_docker"],
        evidenceIds: [],
        status: "OPEN" as const,
        suggestedAction: "If you have genuine Docker experience, consider adding a concrete project example.",
        engineVersion: RECOMMENDATION_ENGINE_VERSION,
      };

      const val = RecommendationValidator.validateRecommendation(rec, "");
      expect(val.isValid).toBe(true);
      expect(val.safetyFlags.length).toBe(0);
    });

    it("should reject defamatory/accusatory phrasing: 'You don't know Docker'", () => {
      const rec = {
        id: "rec_bad",
        category: "MATCH" as const,
        title: "You failed this requirement",
        summary: "You don't know Docker.",
        whyItMatters: "You lack skills.",
        priority: "HIGH" as const,
        impact: "HIGH" as const,
        actionability: "FIX_NOW" as const,
        effort: "LOW" as const,
        confidence: 0.95,
        priorityScore: 0.80,
        sourceIds: [],
        evidenceIds: [],
        status: "OPEN" as const,
        suggestedAction: "Fix it.",
        engineVersion: RECOMMENDATION_ENGINE_VERSION,
      };

      const val = RecommendationValidator.validateRecommendation(rec, "");
      expect(val.isValid).toBe(false);
      expect(val.safetyFlags).toContain("ACCUSATORY_LANGUAGE_DETECTED");
    });
  });

  describe("7. Metric Fabrication Protection", () => {
    it("should flag unsupported metric claims when not present in candidate evidence", () => {
      const rec = {
        id: "rec_metric",
        category: "IMPACT" as const,
        title: "Quantify latency",
        summary: "You improved performance by 40% across all services.",
        whyItMatters: "Metrics show impact.",
        priority: "HIGH" as const,
        impact: "HIGH" as const,
        actionability: "FIX_NOW" as const,
        effort: "LOW" as const,
        confidence: 0.95,
        priorityScore: 0.80,
        sourceIds: [],
        evidenceIds: [],
        status: "OPEN" as const,
        suggestedAction: "State your 40% metric.",
        engineVersion: RECOMMENDATION_ENGINE_VERSION,
      };

      const val = RecommendationValidator.validateRecommendation(rec, "Improved performance of backend services.");
      expect(val.safetyFlags.some((f) => f.includes("UNSUPPORTED_METRIC_CLAIM: 40%"))).toBe(true);
    });
  });

  describe("8. Score Immutability", () => {
    it("should never mutate ATS, Match, or Content scores during recommendation generation", () => {
      const input = {
        atsResult: { overallScore: 85 },
        matchResult: { overallMatchScore: 78 },
        contentResult: { contentScore: 72 },
        targetRole: "Full-Stack Engineer",
      };

      const beforeAts = input.atsResult.overallScore;
      const beforeMatch = input.matchResult.overallMatchScore;
      const beforeContent = input.contentResult.contentScore;

      const res = recommendationIntelligenceService.generateRecommendations(input);

      expect(res.sourceScores.atsScore).toBe(beforeAts);
      expect(res.sourceScores.matchScore).toBe(beforeMatch);
      expect(res.sourceScores.contentScore).toBe(beforeContent);
      expect(input.atsResult.overallScore).toBe(beforeAts);
      expect(input.matchResult.overallMatchScore).toBe(beforeMatch);
      expect(input.contentResult.contentScore).toBe(beforeContent);
    });
  });

  describe("9. AI Schema Validation & Resilient Fallback", () => {
    it("should validate valid AI explanation responses with Zod", () => {
      const validAIResponse = {
        id: "rec_1",
        title: "Improve AWS Evidence",
        explanation: "Adding measurable AWS deployments will improve role alignment.",
        suggestedAction: "Mention S3 and Lambda in your primary project.",
        confidence: 0.92,
      };

      const parseResult = AIRecommendationExplanationSchema.safeParse(validAIResponse);
      expect(parseResult.success).toBe(true);
    });

    it("should reject malformed AI responses missing explanation", () => {
      const invalidAIResponse = {
        id: "rec_1",
        confidence: 0.92,
      };

      const parseResult = AIRecommendationExplanationSchema.safeParse(invalidAIResponse);
      expect(parseResult.success).toBe(false);
    });
  });

  describe("10. Deterministic Ordering & Top-5 Limit", () => {
    it("should deterministically sort recommendations and cap output at 5", () => {
      const matchResult = {
        skillBreakdown: {
          missing: [
            { canonicalName: "Skill 1", requirementType: "REQUIRED" },
            { canonicalName: "Skill 2", requirementType: "REQUIRED" },
            { canonicalName: "Skill 3", requirementType: "REQUIRED" },
            { canonicalName: "Skill 4", requirementType: "PREFERRED" },
            { canonicalName: "Skill 5", requirementType: "PREFERRED" },
            { canonicalName: "Skill 6", requirementType: "PREFERRED" },
            { canonicalName: "Skill 7", requirementType: "PREFERRED" },
          ],
        },
      };

      const res1 = recommendationIntelligenceService.generateRecommendations({ matchResult });
      const res2 = recommendationIntelligenceService.generateRecommendations({ matchResult });

      expect(res1.recommendations.length).toBe(5);
      expect(res2.recommendations.length).toBe(5);
      expect(res1.recommendations.map((r) => r.id)).toEqual(res2.recommendations.map((r) => r.id));
    });
  });
});
