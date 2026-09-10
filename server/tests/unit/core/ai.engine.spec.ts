import { describe, it, expect } from "vitest";
import { AIContextBuilder } from "@/core/ai/ai.context";
import { AIGuardrails } from "@/core/ai/ai.guardrails";
import { AIAnalysisOutputSchema, AIBulletRewriteSchema } from "@/core/ai/ai.schemas";
import { aiService } from "@/core/ai/ai.service";

describe("Phase 1: AI Intelligence Foundation", () => {
  const mockExtractedData = {
    candidateName: "Alex Rivera",
    email: "alex@example.com",
    phone: "+1 555-0199",
    location: "San Francisco, CA",
    summary: "Senior Full Stack Engineer with 5+ years of experience in React and Node.js.",
    skills: [{ name: "React" }, { name: "TypeScript" }, { name: "Node.js" }, { name: "PostgreSQL" }],
    experience: [
      {
        companyName: "TechCorp",
        jobTitle: "Senior Developer",
        description: "Built REST APIs with Node.js.\nReduced page load by 35% across 50k users.",
      },
    ],
    projects: [
      {
        title: "E-Commerce Platform",
        description: "Next.js application serving 10k monthly visitors.",
        technologies: ["Next.js", "Tailwind CSS"],
      },
    ],
  };

  it("builds evidence-tagged AI context correctly", () => {
    const context = AIContextBuilder.buildContext(
      mockExtractedData,
      "Raw resume text with React and Node.js",
      { overallScore: 85, atsScore: 88, breakdown: { keywordMatch: 80, impact: 70 } },
      "Full-Stack Engineer",
      undefined,
      "resume-123",
      1
    );

    expect(context.resume.candidate.fullName).toBe("Alex Rivera");
    expect(context.evidence.length).toBeGreaterThan(0);

    const expBulletEvidence = context.evidence.find((e) => e.id.includes("experience_0_bullet_1"));
    expect(expBulletEvidence).toBeDefined();
    expect(expBulletEvidence?.detectedMetrics?.length).toBeGreaterThan(0);
  });

  it("computes deterministic input hashes for caching", () => {
    const hash1 = AIContextBuilder.computeInputHash("res-1", 1, "Full-Stack Engineer", "JD text");
    const hash2 = AIContextBuilder.computeInputHash("res-1", 1, "Full-Stack Engineer", "JD text");
    const hash3 = AIContextBuilder.computeInputHash("res-1", 2, "Full-Stack Engineer", "JD text");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it("validates structured AI output schema with Zod", () => {
    const validOutput = {
      engineVersion: "1.0.0",
      targetRole: "Full-Stack Engineer",
      targetRoleFitScore: 88,
      executiveSummaryCritique: "Strong full-stack foundations with clear frontend impact.",
      recommendations: [
        {
          id: "rec_1",
          category: "IMPACT",
          priority: "HIGH",
          title: "Add scale metrics",
          problem: "Missing throughput numbers",
          whyItMatters: "Highlights engineering depth",
          recommendation: "Add verified request numbers",
          evidenceIds: ["exp_0_bullet_0"],
          requiresUserInput: true,
          suggestedAction: "Add Metrics",
          impactScoreBoost: 5,
        },
      ],
      bulletCritiques: [
        {
          original: "Built APIs",
          rewritten: "Architected 10+ REST APIs handling 50k daily calls",
          improvements: ["Added scale", "Used strong verb"],
          preservedFacts: ["REST APIs"],
          missingInformation: [],
          powerVerbs: ["Architected"],
          requiresUserVerification: true,
        },
      ],
      missingSkillsNiche: [
        {
          skill: "Docker",
          category: "DevOps",
          priority: "High",
          impactLevel: "High",
          recommendation: "Add containerization skills",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const parsed = AIAnalysisOutputSchema.safeParse(validOutput);
    expect(parsed.success).toBe(true);
  });

  it("enforces non-accusatory guardrails on recommendations", () => {
    const rawRecs = [
      {
        id: "r1",
        category: "SKILLS" as const,
        priority: "HIGH" as const,
        title: "Missing AWS",
        problem: "AWS missing",
        whyItMatters: "Cloud is needed",
        recommendation: "You don't know AWS cloud infrastructure.",
        evidenceIds: [],
        requiresUserInput: false,
      },
    ];

    const sanitized = AIGuardrails.sanitizeRecommendations(rawRecs);
    expect(sanitized[0].recommendation).not.toContain("You don't know");
    expect(sanitized[0].recommendation).toContain("is not detected in the resume");
  });

  it("executes deterministic fallback gracefully without API keys", async () => {
    const analysis = await aiService.analyzeResume(
      "Sample resume text",
      mockExtractedData,
      "Full-Stack Engineer"
    );

    expect(analysis).toBeDefined();
    expect(analysis.engineVersion).toBe("1.0.0");
    expect(analysis.targetRole).toBe("Full-Stack Engineer");
    expect(analysis.recommendations.length).toBeGreaterThan(0);
  }, 30000);
});
