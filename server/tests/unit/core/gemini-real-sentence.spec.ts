import { describe, it, expect } from "vitest";
import { env } from "@/core/config/env";
import { GeminiProvider } from "@/core/ai/providers/gemini.provider";
import { OptimizationValidator } from "@/modules/resume-intelligence";

describe("Real Gemini Phase 7 Sentence Generation", () => {
  it("should generate a real custom sentence from Gemini for bullet optimization", async () => {
    const key = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    const originalBullet = "Worked on React frontend components and helped team with backend REST APIs.";
    const verifiedSkills = ["React", "TypeScript", "Node.js", "REST APIs", "JavaScript"];

    const systemPrompt = `You are a strict, factual Resume Optimization Engine for Full-Stack Engineer.
CRITICAL ANTI-HALLUCINATION RULES:
1. You are rewriting ONE existing bullet point.
2. Use ONLY facts, tools, and outcomes supported by the candidate's existing background.
3. DO NOT invent new metrics (%, $, scale numbers, latency ms, team sizes). If the original text does not have a metric, do not add one.
4. DO NOT invent new technologies or skills not in the verified skills list.
5. DO NOT escalate ownership (e.g. do not turn "worked on" or "assisted with" into "led", "architected", or "managed").
6. Focus on clarity, strong power verbs (e.g. 'Developed', 'Engineered', 'Optimized'), and crisp technical framing.
7. Return ONLY valid JSON.`;

    const userPrompt = `TARGET INFORMATION:
Original Text: "${originalBullet}"
Recommendation Context: Elevate responsibility bullets with quantifiable outcomes

CANDIDATE VERIFIED SKILLS:
${verifiedSkills.join(", ")}

CANDIDATE EXISTING METRICS IN EVIDENCE:
None

Return ONLY a JSON object matching this schema:
{
  "proposalId": "prop_01",
  "recommendationId": "rec_01",
  "originalText": "${originalBullet}",
  "optimizedText": "Improved professional wording preserving exact facts",
  "changes": [
    { "type": "CLARITY", "description": "Replaced passive opening with active power verb" }
  ],
  "preservedEvidenceIds": [],
  "addedClaims": [],
  "removedClaims": [],
  "confidence": 0.95
}`;

    const gemini = new GeminiProvider();
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const proposal = await gemini.generateStructured<any>(prompt, "Optimization Proposal");
    expect(proposal).toBeDefined();

    console.log("\n--- GEMINI GENERATED SENTENCE ---");
    console.log("Original:", originalBullet);
    console.log("Gemini Optimized:", proposal.optimizedText);

    expect(proposal.optimizedText).toBeDefined();
    expect(proposal.optimizedText.length).toBeGreaterThan(15);
    expect(proposal.optimizedText).not.toBe(originalBullet);

    // Run deterministic factual validation on Gemini's sentence
    const validation = OptimizationValidator.validateProposal(
      originalBullet,
      proposal.optimizedText,
      verifiedSkills,
      originalBullet
    );

    console.log("Factual Validator Result:", validation);
    expect(validation.valid).toBe(true);
    expect(validation.safetyLevel).toBe("SAFE");
  }, 25000);
});
