import { describe, it, expect } from "vitest";
import {
  optimizationIntelligenceService,
  OptimizationTargetResolver,
  OptimizationRescorer,
} from "@/modules/resume-intelligence";
import { GeminiProvider } from "@/core/ai/providers/gemini.provider";

describe("Test 2 — Real Phase 7 Live Optimization with Gemini", () => {
  it("should generate a real Gemini-powered bullet optimization through Phase 7 pipeline", async () => {
    const sampleExtractedData = {
      skills: ["React", "TypeScript", "Node.js", "REST APIs", "JavaScript"],
      experience: [
        {
          companyName: "Acme Cloud Tech",
          jobTitle: "Software Developer",
          startDate: "2022-01",
          endDate: "2024-01",
          description: "Worked on React frontend components and helped team with backend REST APIs.",
        },
      ],
      projects: [],
      education: [],
    };

    const recommendation = {
      id: "rec_elevate_responsibility_01",
      category: "IMPACT",
      type: "RESPONSIBILITY_HEAVY_BULLETS",
      title: "Elevate responsibility bullets with quantifiable outcomes",
      problem: "Work experience bullets describe passive responsibilities rather than active achievements.",
      whyItMatters: "Recruiters screen for quantifiable engineering impact rather than plain tasks.",
      suggestedAction: "Rewrite bullet with strong power verbs and technical depth.",
      actionability: "FIX_NOW",
      evidenceIds: ["experience_0_bullet_0"],
      skillIds: ["React", "TypeScript", "Node.js"],
    };

    const target = OptimizationTargetResolver.resolveTarget(recommendation, sampleExtractedData);
    const baseline = OptimizationRescorer.rescoreDraft(
      sampleExtractedData,
      target,
      sampleExtractedData.experience[0].description,
      { atsScore: 80, matchScore: 50, contentScore: 40, timestamp: "init" },
      "Full-Stack Engineer"
    );
    const beforeScores = baseline.afterScores;

    const gemini = new GeminiProvider();
    expect(gemini.isAvailable()).toBe(true);

    console.log("=== PHASE 7 LIVE OPTIMIZATION PIPELINE ===");
    console.log("Original Bullet:", sampleExtractedData.experience[0].description);
    console.log("Recommendation:", recommendation.title);

    const draft = await optimizationIntelligenceService.proposeOptimization({
      resumeId: "live_test_resume_01",
      baseResumeVersionId: "v1_original",
      recommendation,
      extractedData: sampleExtractedData,
      rawText: "Worked on React frontend components and helped team with backend REST APIs.",
      beforeScores,
      targetRole: "Full-Stack Engineer",
      aiProvider: {
        generateCompletion: async (systemPrompt: string, userPrompt: string) => {
          const prompt = `${systemPrompt}\n\n${userPrompt}`;
          const res = await gemini.generateStructured<any>(prompt, "Optimization Proposal");
          console.log("Gemini Raw Proposal:", res);
          return res;
        },
      },
    });

    console.log("\n--- OPTIMIZATION RESULT ---");
    console.log("Draft ID:", draft.draftId);
    console.log("Original Text:", draft.originalText);
    console.log("Gemini Proposed Text:", draft.proposedText);
    console.log("Safety Validation:", draft.validation);
    console.log("Score Comparison:", draft.scoreComparison);
    console.log("Decision:", draft.decision);
    console.log("Status:", draft.status);

    // Verify draft properties
    expect(draft.draftId).toBeDefined();
    expect(draft.originalText).toBe(sampleExtractedData.experience[0].description);
    expect(draft.proposedText).toBeDefined();
    expect(draft.proposedText.length).toBeGreaterThan(10);
    // Verify it is not identical to original
    expect(draft.proposedText).not.toBe(draft.originalText);
    // Verify factual validation passed
    expect(draft.validation.valid).toBe(true);
    expect(draft.validation.safetyLevel).toBe("SAFE");
    // Verify deterministic scores recomputed
    expect(draft.afterScores).toBeDefined();
    expect(draft.scoreComparison?.improved).toBe(true);
    expect(draft.decision).toBe("IMPROVED");
  }, 25000);
});
