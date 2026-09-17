import { describe, it, expect, vi, beforeEach } from "vitest";
import { toolRegistry } from "@/core/ai/tools";
import { ToolRegistry } from "@/core/ai/tools/tool-registry";
import {
  AIToolNotFoundError,
  AIToolValidationError,
  AIToolOwnershipError,
  AIToolTimeoutError,
  AIToolRegistryError,
} from "@/core/ai/tools/tool-errors";
import { ProfileService } from "@/modules/profile/profile.service";
import { ResumeService } from "@/modules/resume/resume.service";
import { SkillGapService } from "@/modules/career-plan/skill-gap.service";
import { EmployabilityService } from "@/modules/career-plan/employability.service";
import { JobsService } from "@/modules/jobs/jobs.service";

describe("Phase 3: Controlled Tool Registry & Security Layer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toolRegistry.clearTelemetry();
  });

  describe("1. Registry Allowlist & Tool Discovery", () => {
    it("contains all seven required allowlisted tools upon initialization", () => {
      const requiredTools = [
        "getCandidateProfile",
        "getActiveResume",
        "getResumeIntelligence",
        "getSkillGaps",
        "getEmployabilityMetrics",
        "getMatchingJobs",
        "proposeCareerPlan",
      ];

      for (const name of requiredTools) {
        expect(toolRegistry.hasTool(name)).toBe(true);
        expect(toolRegistry.getTool(name)).toBeDefined();
      }
    });

    it("rejects duplicate tool registration with AIToolRegistryError", () => {
      const duplicateTool: any = {
        name: "getCandidateProfile",
        description: "Duplicate tool",
        inputSchema: { safeParse: vi.fn() },
        outputSchema: { safeParse: vi.fn() },
        execute: vi.fn(),
      };

      expect(() => toolRegistry.register(duplicateTool)).toThrow(AIToolRegistryError);
    });

    it("rejects unknown/unregistered tools with AIToolNotFoundError", async () => {
      await expect(
        toolRegistry.execute(
          "unregisteredDangerousTool",
          {},
          { userId: "candidate_123" }
        )
      ).rejects.toThrow(AIToolNotFoundError);
    });

    it("exposes model-facing tool definitions with strongly-typed schemas and NO leaked userId", () => {
      const definitions = toolRegistry.getDefinitions();
      expect(definitions).toHaveLength(7);

      for (const def of definitions) {
        expect(def.name).toBeDefined();
        expect(def.description).toBeDefined();
        expect(def.inputSchema).toBeDefined();

        // Security check: userId must NEVER be a required or accepted parameter in model schemas
        const props = (def.inputSchema as any).properties || {};
        expect(props.userId).toBeUndefined();
      }
    });
  });

  describe("2. Strict User ID Injection Protection (Security Boundary)", () => {
    it("rejects tool parameters attempting to inject or override candidate userId", async () => {
      // Attacker attempts to pass { userId: "target_victim_id" } into getCandidateProfile
      await expect(
        toolRegistry.execute(
          "getCandidateProfile",
          { userId: "target_victim_id" } as any,
          { userId: "attacker_authenticated_id" }
        )
      ).rejects.toThrow(AIToolValidationError);

      // Attacker attempts to pass { userId: "target_victim_id" } into getSkillGaps
      await expect(
        toolRegistry.execute(
          "getSkillGaps",
          { targetRole: "Full-Stack Engineer", userId: "target_victim_id" } as any,
          { userId: "attacker_authenticated_id" }
        )
      ).rejects.toThrow(AIToolValidationError);
    });

    it("rejects execution when authenticated context userId is missing or empty", async () => {
      await expect(
        toolRegistry.execute("getCandidateProfile", {}, { userId: "" })
      ).rejects.toThrow(AIToolOwnershipError);

      await expect(
        toolRegistry.execute("getCandidateProfile", {}, null as any)
      ).rejects.toThrow(AIToolOwnershipError);
    });
  });

  describe("3. Cross-Candidate Resource Ownership Enforcement", () => {
    it("allows candidate to access their own resume", async () => {
      vi.spyOn(ResumeService.prototype, "getResumeById").mockResolvedValue({
        _id: "res_cand_a",
        userId: "candidate_a",
        title: "Candidate A Resume",
        isDefault: true,
        extractedData: { skills: ["TypeScript", "Node.js"] },
      } as any);

      const result: any = await toolRegistry.execute(
        "getActiveResume",
        { resumeId: "res_cand_a" },
        { userId: "candidate_a" }
      );

      expect(result.resumeId).toBe("res_cand_a");
      expect(result.title).toBe("Candidate A Resume");
    });

    it("rejects candidate attempting to access another candidate's resume with AIToolOwnershipError", async () => {
      vi.spyOn(ResumeService.prototype, "getResumeById").mockResolvedValue({
        _id: "res_cand_b",
        userId: "victim_candidate_b",
        title: "Victim Resume",
        isDefault: true,
      } as any);

      await expect(
        toolRegistry.execute(
          "getActiveResume",
          { resumeId: "res_cand_b" },
          { userId: "attacker_candidate_a" }
        )
      ).rejects.toThrow(AIToolOwnershipError);
    });

    it("rejects candidate accessing another candidate's resume intelligence with AIToolOwnershipError", async () => {
      vi.spyOn(ResumeService.prototype, "getResumeAtsScore").mockRejectedValue({
        statusCode: 403,
        code: "FORBIDDEN",
        message: "Unauthorized access to resume",
      });

      await expect(
        toolRegistry.execute(
          "getResumeIntelligence",
          { resumeId: "res_cand_b" },
          { userId: "attacker_candidate_a" }
        )
      ).rejects.toThrow(AIToolOwnershipError);
    });
  });

  describe("4. Tool Execution & Deterministic Service Reuse", () => {
    it("executes getCandidateProfile reusing ProfileService without direct DB queries", async () => {
      const profileSpy = vi.spyOn(ProfileService.prototype, "getMyProfile").mockResolvedValue({
        userId: "cand_1",
        headline: "Principal Engineer",
        bio: "Experienced developer",
        targetRole: "Full-Stack Engineer",
        skills: [{ name: "TypeScript", verified: true, level: 5 }],
        projects: [{ title: "Portfolio App", techStack: ["React", "Next.js"] }],
        education: [{ institution: "Tech Univ", degree: "B.S." }],
        experience: [{ companyName: "Skillezo", jobTitle: "Lead Engineer" }],
        location: { city: "San Francisco", country: "USA" },
        completionPercentage: 90,
      } as any);

      const result: any = await toolRegistry.execute(
        "getCandidateProfile",
        {},
        { userId: "cand_1" }
      );

      expect(profileSpy).toHaveBeenCalledWith("cand_1");
      expect(result.candidateId).toBe("cand_1");
      expect(result.headline).toBe("Principal Engineer");
      expect(result.completionPercentage).toBe(90);
      expect(result.skills[0].name).toBe("TypeScript");
      expect(result.skills[0].verified).toBe(true);
    });

    it("executes getSkillGaps with strict role string validation", async () => {
      const skillGapSpy = vi.spyOn(SkillGapService, "getCandidateSkillGap").mockResolvedValue({
        targetRole: "DevOps Engineer",
        availableRoles: ["DevOps Engineer"],
        overallMatchScore: 68,
        skillsAcquiredCount: 3,
        skillsRequiredCount: 5,
        skillsMissingCount: 2,
        radarCategories: [],
        competencies: [
          {
            id: "1",
            skill: "Kubernetes",
            category: "Cloud",
            currentLevel: "Beginner",
            requiredLevel: "Advanced",
            currentNumeric: 25,
            requiredNumeric: 80,
            gap: 55,
            priority: "High",
            status: "Gap",
          },
        ],
        priorityRecommendations: [
          {
            skill: "Kubernetes",
            currentLevel: "Beginner",
            requiredLevel: "Advanced",
            priority: "High",
            reason: "Core container orchestration",
            suggestedAction: "Complete certification",
          },
        ],
      });

      const result: any = await toolRegistry.execute(
        "getSkillGaps",
        { targetRole: "DevOps Engineer" },
        { userId: "cand_1" }
      );

      expect(skillGapSpy).toHaveBeenCalledWith("cand_1", "DevOps Engineer");
      expect(result.targetRole).toBe("DevOps Engineer");
      expect(result.overallMatchScore).toBe(68);
      expect(result.missingSkills).toEqual(["Kubernetes"]);
      expect(result.priorityRecommendations).toHaveLength(1);
    });

    it("executes getEmployabilityMetrics matching the service contract", async () => {
      const empSpy = vi.spyOn(EmployabilityService, "getCandidateEmployability").mockResolvedValue({
        overallScore: 84,
        tierStatus: "Top 15%",
        targetTier: "Top 5%",
        targetRole: "Full-Stack Engineer",
        metrics: {
          technicalReadiness: 88,
          resumeStrength: 82,
          projectStrength: 80,
          skillAlignment: 85,
          recruiterVisibility: 75,
        },
        factors: {} as any,
        strengths: ["Strong TypeScript"],
        improvementAreas: ["Cloud architecture"],
        actionList: [],
        careerGps: { ready: true, milestones: [{ id: "m1" } as any] },
      });

      const result: any = await toolRegistry.execute(
        "getEmployabilityMetrics",
        { targetRole: "Full-Stack Engineer" },
        { userId: "cand_1" }
      );

      expect(empSpy).toHaveBeenCalledWith("cand_1", "Full-Stack Engineer");
      expect(result.overallScore).toBe(84);
      expect(result.tierStatus).toBe("Top 15%");
      expect(result.metrics.technicalReadiness).toBe(88);
      expect(result.milestonesCount).toBe(1);
    });

    it("executes getMatchingJobs with bounded limit schema", async () => {
      const jobsSpy = vi.spyOn(JobsService.prototype, "searchJobs").mockResolvedValue({
        items: [
          {
            _id: "job_1",
            title: "Senior Full Stack Engineer",
            companyName: "Acme Corp",
            location: "Remote",
            workplaceType: "Remote",
            requiredSkills: ["React", "TypeScript", "Node.js"],
          },
        ] as any,
        pagination: { page: 1, limit: 5, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      });

      // Bounded default limit of 5 is applied when limit omitted
      const result: any = await toolRegistry.execute(
        "getMatchingJobs",
        { targetRole: "Full-Stack Engineer" },
        { userId: "cand_1" }
      );

      expect(jobsSpy).toHaveBeenCalledWith({
        keyword: "Full-Stack Engineer",
        location: undefined,
        limit: 5,
      });
      expect(result.jobs).toHaveLength(1);
      expect(result.jobs[0].title).toBe("Senior Full Stack Engineer");

      // Reject out of bounds limit (> 20)
      await expect(
        toolRegistry.execute(
          "getMatchingJobs",
          { limit: 50 },
          { userId: "cand_1" }
        )
      ).rejects.toThrow(AIToolValidationError);
    });
  });

  describe("5. ProposeCareerPlan Mutation Safety (Proposal-Only)", () => {
    it("generates deterministic proposal DTO without database mutations or LLM calls", async () => {
      vi.spyOn(SkillGapService, "getCandidateSkillGap").mockResolvedValue({
        targetRole: "Cloud Architect",
        availableRoles: ["Cloud Architect"],
        overallMatchScore: 60,
        skillsAcquiredCount: 3,
        skillsRequiredCount: 5,
        skillsMissingCount: 2,
        radarCategories: [],
        competencies: [
          {
            id: "1",
            skill: "AWS Architecture",
            category: "Cloud",
            currentLevel: "Beginner",
            requiredLevel: "Advanced",
            currentNumeric: 30,
            requiredNumeric: 85,
            gap: 55,
            priority: "High",
            status: "Gap",
          },
        ],
        priorityRecommendations: [],
      });

      vi.spyOn(EmployabilityService, "getCandidateEmployability").mockResolvedValue({
        overallScore: 65,
        tierStatus: "Top 30%",
        targetTier: "Top 5%",
        targetRole: "Cloud Architect",
        metrics: { technicalReadiness: 60, resumeStrength: 65, projectStrength: 70, skillAlignment: 60, recruiterVisibility: 65 },
        factors: {} as any,
        strengths: [],
        improvementAreas: [],
        actionList: [],
        careerGps: { ready: false, milestones: [] },
      });

      const result: any = await toolRegistry.execute(
        "proposeCareerPlan",
        { targetRole: "Cloud Architect", focusAreas: ["AWS Solutions Architect"] },
        { userId: "cand_1" }
      );

      expect(result.isProposal).toBe(true);
      expect(result.disclaimer).toContain("Proposal only");
      expect(result.targetRole).toBe("Cloud Architect");
      expect(result.currentOverallScore).toBe(60);
      expect(result.milestones.length).toBeGreaterThan(0);
      expect(result.estimatedDurationWeeks).toBeGreaterThan(0);
    });
  });

  describe("6. Bounded Telemetry & Cancellation", () => {
    it("tracks execution telemetry in a bounded ring-buffer (max 100 entries)", async () => {
      vi.spyOn(ProfileService.prototype, "getMyProfile").mockResolvedValue({
        userId: "cand_1",
        skills: [],
        projects: [],
      } as any);

      // Execute 105 tool calls
      for (let i = 0; i < 105; i++) {
        await toolRegistry.execute("getCandidateProfile", {}, { userId: "cand_1" });
      }

      const telemetry = toolRegistry.getTelemetry();
      // Verifies ring-buffer caps at 100 entries to prevent memory leak
      expect(telemetry.length).toBe(100);
      expect(telemetry[0].success).toBe(true);
      expect(telemetry[0].toolName).toBe("getCandidateProfile");
    });

    it("respects AbortSignal and aborts with AIToolTimeoutError", async () => {
      const controller = new AbortController();
      controller.abort(); // Abort before execution

      await expect(
        toolRegistry.execute(
          "getCandidateProfile",
          {},
          { userId: "cand_1", signal: controller.signal }
        )
      ).rejects.toThrow(AIToolTimeoutError);
    });
  });
});
