import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AIOrchestrator,
  IntentClassifier,
  EvidencePlanner,
  ToolSelectionGuard,
  ResponseValidator,
  normalizeTargetRole,
  extractTargetRoleFromMessage,
  AIOrchestratorError,
  AIOrchestratorTimeoutError,
  AIEvidencePlanningError,
} from "@/core/ai/orchestrator";
import { ToolRegistry } from "@/core/ai/tools/tool-registry";
import { ModelGateway } from "@/core/ai/gateway/model-gateway";
import { CandidateContextService } from "@/core/ai/context/candidate-context.service";
import { z } from "zod";

describe("Phase 4: AI Orchestrator Unit & Integrity Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(CandidateContextService, "getContextSnapshot").mockResolvedValue({
      candidateId: "usr_test",
      targetRole: "Software Engineer",
      generatedAt: new Date(),
      version: "v1",
      profile: null,
      resume: null,
      evidence: {
        candidateId: "usr_test",
        verifiedAt: new Date(),
        items: [],
        stats: { total: 0, deterministicCount: 0, extractedCount: 0, reviewRequiredCount: 0 },
      },
      metadata: { sourceCount: 0, evidenceCount: 0, snapshotHash: "hash_01" },
    } as any);
  });

  // =========================================================================
  // 1. INTENT CLASSIFICATION (10 Supported Variants)
  // =========================================================================
  describe("Intent Classification & Role Normalization", () => {
    it("classifies PROFILE_OVERVIEW with matchedRule", () => {
      const res = IntentClassifier.classify("Show my profile summary and skills");
      expect(res.intent).toBe("PROFILE_OVERVIEW");
      expect(res.matchedRule).toBe("RULE_PROFILE_OVERVIEW");
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("classifies RESUME_ANALYSIS with matchedRule", () => {
      const res = IntentClassifier.classify("What is my resume ATS score?");
      expect(res.intent).toBe("RESUME_ANALYSIS");
      expect(res.matchedRule).toBe("RULE_RESUME_ANALYSIS");
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("classifies RESUME_IMPROVEMENT with matchedRule", () => {
      const res = IntentClassifier.classify("How can I improve my resume bullets?");
      expect(res.intent).toBe("RESUME_IMPROVEMENT");
      expect(res.matchedRule).toBe("RULE_RESUME_IMPROVEMENT");
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("classifies SKILL_GAP_ANALYSIS and extracts target role", () => {
      const res = IntentClassifier.classify(
        "Show my skill gaps for Senior React Developer"
      );
      expect(res.intent).toBe("SKILL_GAP_ANALYSIS");
      expect(res.matchedRule).toBe("RULE_SKILL_GAP_KEYWORDS");
      expect(res.detectedRole).toContain("Senior");
      expect(res.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("classifies EMPLOYABILITY_ANALYSIS with matchedRule", () => {
      const res = IntentClassifier.classify("What is my current employability index score?");
      expect(res.intent).toBe("EMPLOYABILITY_ANALYSIS");
      expect(res.matchedRule).toBe("RULE_EMPLOYABILITY_INDEX");
    });

    it("classifies JOB_MATCHING with matchedRule", () => {
      const res = IntentClassifier.classify("What matching jobs are available for me?");
      expect(res.intent).toBe("JOB_MATCHING");
      expect(res.matchedRule).toBe("RULE_JOB_MATCHING");
    });

    it("classifies CAREER_READINESS with matchedRule", () => {
      const res = IntentClassifier.classify("Give me an overall readiness assessment");
      expect(res.intent).toBe("CAREER_READINESS");
      expect(res.matchedRule).toBe("RULE_CAREER_READINESS");
    });

    it("classifies CAREER_PLAN with matchedRule", () => {
      const res = IntentClassifier.classify("Create a career roadmap to become a DevOps Engineer");
      expect(res.intent).toBe("CAREER_PLAN");
      expect(res.matchedRule).toBe("RULE_CAREER_PLAN");
      expect(res.detectedRole).toContain("DevOps");
    });

    it("classifies GENERAL_CAREER_GUIDANCE for broad career queries", () => {
      const res = IntentClassifier.classify("What advice do you have for interview preparation?");
      expect(res.intent).toBe("GENERAL_CAREER_GUIDANCE");
      expect(res.matchedRule).toBe("RULE_GENERAL_CAREER_GUIDANCE");
    });

    it("classifies UNKNOWN for completely out of scope queries", () => {
      const res = IntentClassifier.classify("What is the recipe for chocolate cake?");
      expect(res.intent).toBe("UNKNOWN");
      expect(res.matchedRule).toBe("RULE_NO_MATCH_UNKNOWN");
    });

    it("normalizes target role whitespace and preserves technology casing", () => {
      expect(normalizeTargetRole("  ios   developer  ")).toBeDefined();
      expect(normalizeTargetRole("   Node.js   Backend   Engineer   ")).toBe("Node.js Backend Engineer");
      expect(normalizeTargetRole("")).toBeUndefined();
    });

    it("extracts target role cleanly from inquiry message", () => {
      const role = extractTargetRoleFromMessage("roadmap to become a Full Stack Developer");
      expect(role).toBeDefined();
      expect(role?.toLowerCase()).toMatch(/full[- ]stack/);
    });
  });

  // =========================================================================
  // 2. EVIDENCE PLANNING & TOOL SELECTION
  // =========================================================================
  describe("Evidence Planning & Tool Allowlist", () => {
    it("creates staged execution plan for CAREER_PLAN requiring resume readiness", () => {
      const plan = EvidencePlanner.createPlan("CAREER_PLAN", "Senior React Developer");
      expect(plan.intent).toBe("CAREER_PLAN");
      // Stage 1 must include profile and resume
      expect(plan.stage1Tools.map((t) => t.toolName)).toEqual(
        expect.arrayContaining(["getCandidateProfile", "getActiveResume"])
      );
      // Stage 3 must include gaps and employability
      expect(plan.stage3Tools.map((t) => t.toolName)).toEqual(
        expect.arrayContaining(["getSkillGaps", "getEmployabilityMetrics"])
      );
      // Stage 4 must include proposeCareerPlan
      expect(plan.stage4Tools.map((t) => t.toolName)).toEqual(["proposeCareerPlan"]);
    });

    it("creates staged execution plan for SKILL_GAP_ANALYSIS without unnecessary resume tool", () => {
      const plan = EvidencePlanner.createPlan("SKILL_GAP_ANALYSIS", "Frontend Engineer");
      expect(plan.stage1Tools.map((t) => t.toolName)).toEqual(["getCandidateProfile"]);
      expect(plan.stage1Tools.map((t) => t.toolName)).not.toContain("getActiveResume");
      expect(plan.stage3Tools.map((t) => t.toolName)).toContain("getSkillGaps");
    });

    it("creates staged execution plan for EMPLOYABILITY_ANALYSIS without unnecessary resume tool", () => {
      const plan = EvidencePlanner.createPlan("EMPLOYABILITY_ANALYSIS", "Frontend Engineer");
      expect(plan.stage1Tools.map((t) => t.toolName)).toEqual(["getCandidateProfile"]);
      expect(plan.stage1Tools.map((t) => t.toolName)).not.toContain("getActiveResume");
      expect(plan.stage3Tools.map((t) => t.toolName)).toContain("getEmployabilityMetrics");
    });

    it("creates staged execution plan for JOB_MATCHING without unnecessary resume tool", () => {
      const plan = EvidencePlanner.createPlan("JOB_MATCHING", "Frontend Engineer");
      expect(plan.stage1Tools.map((t) => t.toolName)).toEqual(["getCandidateProfile"]);
      expect(plan.stage1Tools.map((t) => t.toolName)).not.toContain("getActiveResume");
      expect(plan.stage3Tools.map((t) => t.toolName)).toContain("getMatchingJobs");
    });

    it("rejects unallowlisted tools through ToolSelectionGuard", () => {
      expect(() => ToolSelectionGuard.validateToolName("unauthorizedAdminTool")).toThrow(
        AIEvidencePlanningError
      );
      expect(ToolSelectionGuard.isAllowlisted("getCandidateProfile")).toBe(true);
      expect(ToolSelectionGuard.isAllowlisted("dropDatabase")).toBe(false);
    });
  });

  // =========================================================================
  // 3. IDENTITY ISOLATION INVARIANT
  // =========================================================================
  describe("Identity Isolation & Context Verification", () => {
    it("throws AIOrchestratorError if context.userId is missing or empty", async () => {
      const orchestrator = new AIOrchestrator();
      await expect(
        orchestrator.orchestrate(
          { message: "Check my resume" },
          { userId: "" } as any
        )
      ).rejects.toThrow(AIOrchestratorError);
    });

    it("immediately returns safe out-of-scope guidance for UNKNOWN without burning tools", async () => {
      const orchestrator = new AIOrchestrator();
      const result = await orchestrator.orchestrate(
        { message: "How to bake sourdough bread?" },
        { userId: "usr_test_123" }
      );

      expect(result.intent).toBe("UNKNOWN");
      expect(result.metrics).toHaveLength(0);
      expect(result.evidence).toHaveLength(0);
      expect(result.limitations).toContain("Query is out of scope for career coaching.");
      expect(orchestrator.getTelemetry()[0].toolCount).toBe(0);
    });
  });

  // =========================================================================
  // 4. SCORE & METRIC INTEGRITY VALIDATION
  // =========================================================================
  describe("Response Validation & Score Integrity", () => {
    const mockVerifiedEvidence = [
      {
        id: "ev_ats_score",
        type: "DETERMINISTIC",
        source: "ResumeAtsEngine",
        summary: "ATS score evaluated at 85/100",
        numericValue: 85,
      },
      {
        id: "ev_skill_gap_overall",
        type: "DETERMINISTIC",
        source: "SkillGapEngine",
        summary: "Overall match 72%",
        numericValue: 72,
      },
    ];

    it("preserves structured metrics matching verified evidence values", () => {
      const rawResult = {
        intent: "RESUME_ANALYSIS" as const,
        answer: "Your resume scored 85 on the ATS benchmark.",
        metrics: [
          {
            name: "atsScore",
            value: 85,
            evidenceId: "ev_ats_score",
            label: "ATS Benchmark",
          },
        ],
        evidence: [],
        insights: [
          {
            title: "Good ATS Score",
            explanation: "Solid formatting.",
            evidenceIds: ["ev_ats_score"],
          },
        ],
        recommendations: [],
        confidence: "HIGH" as const,
        limitations: [],
      };

      const validated = ResponseValidator.validate(
        rawResult,
        mockVerifiedEvidence,
        []
      );

      expect(validated.metrics).toHaveLength(1);
      expect(validated.metrics[0].value).toBe(85);
      expect(validated.insights[0].evidenceIds).toContain("ev_ats_score");
    });

    it("strips metrics that reference hallucinated evidence IDs and adds to limitations", () => {
      const rawResult = {
        intent: "RESUME_ANALYSIS" as const,
        answer: "You scored 99 out of nowhere.",
        metrics: [
          {
            name: "fakeScore",
            value: 99,
            evidenceId: "ev_non_existent",
            label: "Invented Score",
          },
        ],
        evidence: [],
        insights: [],
        recommendations: [],
        confidence: "HIGH" as const,
        limitations: [],
      };

      const validated = ResponseValidator.validate(
        rawResult,
        mockVerifiedEvidence,
        []
      );

      expect(validated.metrics).toHaveLength(0);
      expect(validated.limitations.some((l) => l.includes("Removed unverified metric"))).toBe(true);
    });

    it("strips metrics where LLM altered the deterministic score value", () => {
      const rawResult = {
        intent: "RESUME_ANALYSIS" as const,
        answer: "Your score was altered to 95.",
        metrics: [
          {
            name: "atsScore",
            value: 95, // Verified is 85!
            evidenceId: "ev_ats_score",
            label: "ATS Benchmark",
          },
        ],
        evidence: [],
        insights: [],
        recommendations: [],
        confidence: "HIGH" as const,
        limitations: [],
      };

      const validated = ResponseValidator.validate(
        rawResult,
        mockVerifiedEvidence,
        []
      );

      expect(validated.metrics).toHaveLength(0);
      expect(validated.limitations.some((l) => l.includes("diverges from deterministic value"))).toBe(true);
    });

    it("filters hallucinated evidence IDs from insights and recommendations", () => {
      const rawResult = {
        intent: "RESUME_ANALYSIS" as const,
        answer: "Analysis completed.",
        metrics: [],
        evidence: [],
        insights: [
          {
            title: "Insight",
            explanation: "Details",
            evidenceIds: ["ev_ats_score", "ev_fake_123"],
          },
        ],
        recommendations: [
          {
            title: "Rec",
            explanation: "Details",
            priority: "HIGH" as const,
            evidenceIds: ["ev_fake_456"],
          },
        ],
        confidence: "HIGH" as const,
        limitations: [],
      };

      const validated = ResponseValidator.validate(
        rawResult,
        mockVerifiedEvidence,
        []
      );

      expect(validated.insights[0].evidenceIds).toEqual(["ev_ats_score"]);
      expect(validated.recommendations[0].evidenceIds).toEqual([]);
    });
  });

  // =========================================================================
  // 5. DEPENDENCY-AWARE TOOL COORDINATION & CONCURRENCY
  // =========================================================================
  describe("End-to-End Orchestrator Coordination with Mocked Gateway", () => {
    it("executes tools in dependency order, injecting resolved target role from Stage 1", async () => {
      const customRegistry = new ToolRegistry();

      // Register mock tools
      customRegistry.register({
        name: "getCandidateProfile",
        description: "Mock profile",
        inputSchema: z.object({}).strict(),
        outputSchema: z.any(),
        execute: vi.fn().mockResolvedValue({
          userId: "usr_alex_01",
          headline: "Software Engineer",
          targetRole: "Senior Backend Developer",
          skills: [{ name: "Node.js", verified: true }],
        }),
      });

      customRegistry.register({
        name: "getActiveResume",
        description: "Mock resume",
        inputSchema: z.object({ resumeId: z.string().optional() }).strict(),
        outputSchema: z.any(),
        execute: vi.fn().mockResolvedValue({
          resumeId: "res_01",
          fileName: "Alex_Resume.pdf",
          status: "PARSED",
        }),
      });

      customRegistry.register({
        name: "getSkillGaps",
        description: "Mock skill gaps",
        inputSchema: z.object({ targetRole: z.string().optional() }),
        outputSchema: z.any(),
        execute: vi.fn().mockResolvedValue({
          targetRole: "Senior Backend Developer",
          overallMatchPercentage: 75,
          matchingSkills: ["Node.js"],
          missingSkills: ["Kubernetes"],
        }),
      });

      customRegistry.register({
        name: "getEmployabilityMetrics",
        description: "Mock employability",
        inputSchema: z.object({ targetRole: z.string().optional() }),
        outputSchema: z.any(),
        execute: vi.fn().mockResolvedValue({
          overallEmployabilityScore: 80,
          marketReadinessLevel: "HIGH",
        }),
      });

      // Mock ModelGateway structured generation
      vi.spyOn(ModelGateway.prototype, "generateStructured").mockResolvedValue({
        data: {
          intent: "SKILL_GAP_ANALYSIS",
          answer: "You have a 75% match for Senior Backend Developer. Missing Kubernetes.",
          metrics: [
            {
              name: "skillGapMatch",
              value: 75,
              evidenceId: "ev_skill_gap_overall",
              label: "Skill Match",
            },
          ],
          evidence: [],
          insights: [
            {
              title: "Strong Core Backend",
              explanation: "Node.js is verified.",
              evidenceIds: ["ev_skill_gap_overall"],
            },
          ],
          recommendations: [
            {
              title: "Learn Kubernetes",
              explanation: "Bridge the container orchestration gap.",
              priority: "HIGH",
              evidenceIds: ["ev_skill_gap_overall"],
            },
          ],
          confidence: "HIGH",
          limitations: [],
        },
        provider: "MockGemini",
        model: "gemini-flash",
        latencyMs: 120,
        fallbackUsed: false,
        correlationId: "test_corr_01",
      });

      const orchestrator = new AIOrchestrator(customRegistry);

      const result = await orchestrator.orchestrate(
        { message: "What are my skill gaps?" },
        { userId: "usr_alex_01" }
      );

      expect(result.intent).toBe("SKILL_GAP_ANALYSIS");
      expect(result.metrics).toHaveLength(1);
      expect(result.metrics[0].value).toBe(75);
      expect(result.insights[0].evidenceIds).toContain("ev_skill_gap_overall");

      // Verify telemetry
      const telemetry = orchestrator.getTelemetry();
      expect(telemetry.length).toBeGreaterThan(0);
      expect(telemetry[0].success).toBe(true);
      expect(telemetry[0].modelProvider).toBe("MockGemini");
      expect(telemetry[0].toolsUsed).toContain("getCandidateProfile");
      expect(telemetry[0].toolsUsed).toContain("getSkillGaps");
      expect(telemetry[0].toolsUsed).not.toContain("getActiveResume");
      expect(customRegistry.getTool("getActiveResume")?.execute).not.toHaveBeenCalled();
    });

    it("handles optional tool failure gracefully with limitations note", async () => {
      const customRegistry = new ToolRegistry();

      customRegistry.register({
        name: "getCandidateProfile",
        description: "Mock profile",
        inputSchema: z.object({}).strict(),
        outputSchema: z.any(),
        execute: vi.fn().mockResolvedValue({
          userId: "usr_alex_02",
          targetRole: "Frontend Developer",
        }),
      });

      customRegistry.register({
        name: "getActiveResume",
        description: "Mock resume that fails optionally",
        inputSchema: z.object({ resumeId: z.string().optional() }).strict(),
        outputSchema: z.any(),
        execute: vi.fn().mockRejectedValue(new Error("Resume storage temporarily unavailable")),
      });

      vi.spyOn(ModelGateway.prototype, "generateStructured").mockResolvedValue({
        data: {
          intent: "PROFILE_OVERVIEW",
          answer: "Here is your profile overview.",
          metrics: [],
          evidence: [],
          insights: [],
          recommendations: [],
          confidence: "MEDIUM",
          limitations: [],
        },
        provider: "MockGemini",
        model: "gemini-flash",
        latencyMs: 80,
        fallbackUsed: false,
        correlationId: "test_corr_02",
      });

      const orchestrator = new AIOrchestrator(customRegistry);

      const result = await orchestrator.orchestrate(
        { message: "Show my profile details" },
        { userId: "usr_alex_02" }
      );

      expect(result.intent).toBe("PROFILE_OVERVIEW");
      expect(
        result.limitations.some((l) => l.includes("getActiveResume") || l.includes("unavailable"))
      ).toBe(true);
    });

    it("aborts orchestration immediately when AbortSignal is cancelled", async () => {
      const orchestrator = new AIOrchestrator();
      const controller = new AbortController();
      controller.abort();

      await expect(
        orchestrator.orchestrate(
          { message: "Check my resume score" },
          { userId: "usr_alex_03", signal: controller.signal }
        )
      ).rejects.toThrow(AIOrchestratorTimeoutError);
    });

    it("maintains telemetry buffer capped at 100 entries without memory leak", async () => {
      const orchestrator = new AIOrchestrator();

      // Trigger 105 out of scope queries
      for (let i = 0; i < 105; i++) {
        await orchestrator.orchestrate(
          { message: `Irrelevant query ${i}` },
          { userId: "usr_load_test" }
        );
      }

      const telemetry = orchestrator.getTelemetry();
      expect(telemetry.length).toBe(100);
    });
  });
});
