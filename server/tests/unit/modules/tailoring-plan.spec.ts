import { describe, it, expect, vi, beforeEach } from "vitest";
import { TailoringPlanEngine } from "../../../src/modules/job-tailoring/tailoring-plan.engine";
import { TailoringFactualValidator } from "../../../src/modules/job-tailoring/tailoring-factual.validator";
import { TailoringPlanService } from "../../../src/modules/job-tailoring/tailoring-plan.service";
import { IJobProfile } from "../../../src/database/models/JobProfile.model";
import { IJobMatchResult } from "../../../src/database/models/JobMatchResult.model";
import { ResumeDocument } from "../../../src/modules/resume-intelligence/document/resume-document.types";

describe("Phase 6C: Tailoring Plan + User Approval Unit Test Suite", () => {
  const mockJobProfile: any = {
    _id: "jp_mock_123",
    userId: "usr_mock_1",
    jobTitle: "Senior Frontend Engineer",
    company: "Stripe",
    analysisStatus: "ANALYZED",
    analysisVersion: 2,
    analysis: {
      requirements: [
        {
          name: "React",
          normalizedName: "react",
          category: "TECHNOLOGY",
          importance: "REQUIRED",
          evidence: { text: "Strong React skills required" },
          confidence: 1.0,
        },
        {
          name: "Next.js",
          normalizedName: "next.js",
          category: "TECHNOLOGY",
          importance: "REQUIRED",
          evidence: { text: "Experience with Next.js App Router" },
          confidence: 1.0,
        },
        {
          name: "TypeScript",
          normalizedName: "typescript",
          category: "TECHNOLOGY",
          importance: "REQUIRED",
          evidence: { text: "TypeScript expertise" },
          confidence: 1.0,
        },
        {
          name: "AWS",
          normalizedName: "aws",
          category: "TOOL",
          importance: "REQUIRED",
          evidence: { text: "AWS cloud infrastructure" },
          confidence: 1.0,
        },
        {
          name: "Docker",
          normalizedName: "docker",
          category: "TOOL",
          importance: "PREFERRED",
          evidence: { text: "Docker containerization" },
          confidence: 0.9,
        },
      ],
      keywords: ["React", "Next.js", "TypeScript", "AWS", "Docker"],
    },
  };

  const mockMatchResult: any = {
    _id: "match_mock_123",
    userId: "usr_mock_1",
    jobProfileId: "jp_mock_123",
    sourceProfileVersion: 3,
    jobAnalysisVersion: 2,
    requirementMatches: [
      {
        requirementId: "req_react",
        name: "React",
        normalizedName: "react",
        category: "TECHNOLOGY",
        importance: "REQUIRED",
        matchState: "PROVEN_RELEVANT",
        confidence: 1.0,
        explanation: "Verified React skills in experience.",
        evidence: [
          {
            sourceType: "EXPERIENCE",
            sourceId: "exp_1",
            label: "Frontend Dev at Acme",
            excerpt: "Built React dashboard components",
          },
        ],
      },
      {
        requirementId: "req_nextjs",
        name: "Next.js",
        normalizedName: "next.js",
        category: "TECHNOLOGY",
        importance: "REQUIRED",
        matchState: "PROVEN_UNDERREPRESENTED",
        confidence: 0.95,
        explanation: "Verified in projects, but missing in Master Resume skills.",
        evidence: [
          {
            sourceType: "PROJECT",
            sourceId: "proj_1",
            label: "EVENTO",
            excerpt: "Built with Next.js App Router",
          },
        ],
      },
      {
        requirementId: "req_typescript",
        name: "TypeScript",
        normalizedName: "typescript",
        category: "TECHNOLOGY",
        importance: "REQUIRED",
        matchState: "PROVEN_RELEVANT",
        confidence: 1.0,
        explanation: "Verified TypeScript experience.",
        evidence: [
          {
            sourceType: "SKILL",
            sourceId: "skill_ts",
            label: "TypeScript",
          },
        ],
      },
      {
        requirementId: "req_aws",
        name: "AWS",
        normalizedName: "aws",
        category: "TOOL",
        importance: "REQUIRED",
        matchState: "MISSING",
        confidence: 0.0,
        explanation: "No candidate evidence found for AWS.",
        evidence: [],
      },
      {
        requirementId: "req_docker",
        name: "Docker",
        normalizedName: "docker",
        category: "TOOL",
        importance: "PREFERRED",
        matchState: "RELATED_EVIDENCE",
        confidence: 0.5,
        explanation: "Kubernetes experience found, but does not prove Docker hands-on proficiency.",
        evidence: [
          {
            sourceType: "SKILL",
            sourceId: "skill_k8s",
            label: "Kubernetes",
          },
        ],
      },
    ],
    summary: {
      totalRequirements: 5,
      requiredTotal: 4,
      requiredProven: 2,
      proven: 2,
      underrepresented: 1,
      partial: 0,
      related: 1,
      missing: 1,
      insufficient: 0,
      needsReview: 0,
    },
    updatedAt: new Date(),
  };

  const mockProfile = {
    profileVersion: 3,
    skills: ["React", "TypeScript", "Next.js", "Kubernetes", "GraphQL"],
    experience: [
      {
        company: "Acme Corp",
        title: "Software Engineer",
        startDate: "2021-01-01",
        endDate: "2024-01-01",
        technologies: ["React", "TypeScript"],
        bullets: ["Built React dashboard components", "Optimized queries by 30%"],
      },
    ],
    projects: [
      {
        id: "proj_1",
        title: "EVENTO",
        technologies: ["Next.js", "TypeScript"],
        bullets: ["Full-stack event platform built with Next.js App Router"],
      },
    ],
  };

  const mockResumeDoc: any = {
    summary: {
      text: "Software engineer with experience building web applications with React.",
    },
    skills: [
      { id: "s1", name: "React", category: "FRONTEND", evidenceIds: [] },
      { id: "s2", name: "TypeScript", category: "LANGUAGE", evidenceIds: [] },
    ],
    experience: [
      {
        id: "exp_1",
        companyName: "Acme Corp",
        jobTitle: "Software Engineer",
        isCurrent: false,
        bullets: [
          { id: "b1", text: "Built React dashboard components", evidenceIds: [] },
        ],
        technologiesUsed: ["React", "TypeScript"],
      },
    ],
    projects: [
      {
        id: "proj_1",
        title: "EVENTO",
        technologies: ["Next.js", "TypeScript"],
        bullets: ["Event platform using Next.js App Router"],
      },
    ],
    metadata: {
      sectionOrder: ["contact", "summary", "skills", "experience", "projects", "education"],
    } as any,
  };

  describe("1. TailoringFactualValidator Guardrails", () => {
    const context = TailoringFactualValidator.buildVerificationContext(
      mockProfile,
      mockResumeDoc
    );

    it("accepts valid, fully-grounded text matching candidate facts", () => {
      const validText = "Software engineer specializing in React and TypeScript with 3 years of experience.";
      const res = TailoringFactualValidator.validateProposedText(validText, context);
      expect(res.isValid).toBe(true);
      expect(res.unsupportedClaims.length).toBe(0);
    });

    it("rejects metric fabrication (unsupported % or dollar claims)", () => {
      const fabricatedMetric = "Improved backend performance by 75% and saved $500,000 annually.";
      const res = TailoringFactualValidator.validateProposedText(fabricatedMetric, context);
      expect(res.isValid).toBe(false);
      expect(res.unsupportedClaims.some((c) => c.includes("UNSUPPORTED_METRIC"))).toBe(true);
    });

    it("accepts genuine verified metrics present in candidate experience", () => {
      const authenticMetric = "Optimized queries by 30% for improved latency.";
      const res = TailoringFactualValidator.validateProposedText(authenticMetric, context);
      expect(res.isValid).toBe(true);
    });

    it("rejects duration inflation beyond candidate verified career history", () => {
      const inflatedDuration = "Senior engineer with 10+ years of software experience.";
      const res = TailoringFactualValidator.validateProposedText(inflatedDuration, context);
      expect(res.isValid).toBe(false);
      expect(res.unsupportedClaims.some((c) => c.includes("DURATION_INFLATION"))).toBe(true);
    });

    it("rejects unverified leadership claims when candidate has no lead history", () => {
      const inflatedLeadership = "Managed a team of 12 engineers across distributed platforms.";
      const res = TailoringFactualValidator.validateProposedText(inflatedLeadership, context);
      expect(res.isValid).toBe(false);
      expect(res.unsupportedClaims.some((c) => c.includes("UNSUPPORTED_LEADERSHIP_CLAIM"))).toBe(true);
    });
  });

  describe("2. TailoringPlanEngine Deterministic Rules & Grounding", () => {
    it("generates PROMOTE for PROVEN_UNDERREPRESENTED skills (Next.js)", async () => {
      const { proposals } = await TailoringPlanEngine.generatePlan(
        mockJobProfile as IJobProfile,
        mockMatchResult as IJobMatchResult,
        mockProfile,
        mockResumeDoc as ResumeDocument,
        { intensity: "BALANCED" }
      );

      const nextjsProposal = proposals.find(
        (p) => p.action === "PROMOTE" && p.target.section === "SKILLS" && p.title.includes("Next.js")
      );
      expect(nextjsProposal).toBeDefined();
      expect(nextjsProposal?.requirementIds).toContain("req_nextjs");
      expect(nextjsProposal?.userDecision).toBe("PENDING");
    });

    it("generates system-protected DO_NOT_ADD for MISSING requirements (AWS)", async () => {
      const { proposals } = await TailoringPlanEngine.generatePlan(
        mockJobProfile as IJobProfile,
        mockMatchResult as IJobMatchResult,
        mockProfile,
        mockResumeDoc as ResumeDocument
      );

      const awsProposal = proposals.find(
        (p) => p.action === "DO_NOT_ADD" && p.title.includes("AWS")
      );
      expect(awsProposal).toBeDefined();
      expect(awsProposal?.isProtected).toBe(true);
      expect(awsProposal?.reason).toContain("No verified evidence found in your Career Profile");
      expect(awsProposal?.reason).toContain("SKILLEZO will not add this claim");
    });

    it("never claims Docker for RELATED_EVIDENCE (Kubernetes) and flags explicit non-proof warning", async () => {
      const { proposals } = await TailoringPlanEngine.generatePlan(
        mockJobProfile as IJobProfile,
        mockMatchResult as IJobMatchResult,
        mockProfile,
        mockResumeDoc as ResumeDocument
      );

      const dockerProposal = proposals.find(
        (p) => p.title.includes("Docker")
      );
      expect(dockerProposal).toBeDefined();
      expect(dockerProposal?.action).toBe("DO_NOT_ADD");
      expect(dockerProposal?.reason).toContain("does not prove hands-on proficiency in Docker");
    });

    it("does NOT mark skill underrepresented if naturally mentioned in Master Resume bullets", async () => {
      // Create a doc where Next.js is naturally prominent in experience bullet
      const resumeDocWithNaturalNext: ResumeDocument = {
        ...mockResumeDoc,
        experience: [
          {
            id: "exp_1",
            companyName: "Acme",
            jobTitle: "Software Engineer",
            isCurrent: false,
            bullets: [
              { id: "b1", text: "Architected enterprise applications using Next.js and React", evidenceIds: [] },
            ],
            technologiesUsed: ["Next.js", "React"],
          },
        ],
      } as any;

      const { proposals } = await TailoringPlanEngine.generatePlan(
        mockJobProfile as IJobProfile,
        mockMatchResult as IJobMatchResult,
        mockProfile,
        resumeDocWithNaturalNext
      );

      // Next.js should not be promoted as underrepresented because it's already in the experience bullet!
      const nextjsPromote = proposals.find(
        (p) => p.action === "PROMOTE" && p.title.includes("Next.js")
      );
      expect(nextjsPromote).toBeUndefined();
    });

    it("proposes promoting project EVENTO because it demonstrates Next.js target qualification", async () => {
      const { proposals } = await TailoringPlanEngine.generatePlan(
        mockJobProfile as IJobProfile,
        mockMatchResult as IJobMatchResult,
        mockProfile,
        mockResumeDoc as ResumeDocument
      );

      const projectProposal = proposals.find(
        (p) => p.target.section === "PROJECTS" && p.action === "PROMOTE"
      );
      expect(projectProposal).toBeDefined();
      expect(projectProposal?.title).toContain("EVENTO");
      expect(projectProposal?.target.entityId).toBe("proj_1");
    });

    it("AGGRESSIVE intensity preserves all truth rules and never invents ungrounded skills", async () => {
      const { proposals } = await TailoringPlanEngine.generatePlan(
        mockJobProfile as IJobProfile,
        mockMatchResult as IJobMatchResult,
        mockProfile,
        mockResumeDoc as ResumeDocument,
        { intensity: "AGGRESSIVE" }
      );

      // Even in AGGRESSIVE mode, AWS remains DO_NOT_ADD
      const awsProposal = proposals.find((p) => p.title.includes("AWS"));
      expect(awsProposal?.action).toBe("DO_NOT_ADD");
      expect(awsProposal?.isProtected).toBe(true);

      // Section reordering is proposed
      const reorderProposal = proposals.find((p) => p.target.section === "SECTION_ORDER");
      expect(reorderProposal).toBeDefined();
    });
  });

  describe("3. TailoringPlanService & Lifecycle Safety", () => {
    let mockPlanRepo: any;
    let mockJobProfileRepo: any;
    let mockMatchRepo: any;
    let mockProfileRepo: any;
    let mockResumeRepo: any;
    let service: TailoringPlanService;

    beforeEach(() => {
      mockPlanRepo = {
        findByUserAndJobProfile: vi.fn(),
        upsertPlan: vi.fn((_u, _j, data) => ({
          ...data,
          _id: "plan_123",
          userId: _u,
          jobProfileId: _j,
          planVersion: 1,
        })),
        updateProposalDecision: vi.fn(),
        batchUpdateDecisions: vi.fn(),
      };

      mockJobProfileRepo = {
        findById: vi.fn().mockResolvedValue(mockJobProfile),
      };

      mockMatchRepo = {
        findByUserAndJobProfile: vi.fn().mockResolvedValue(mockMatchResult),
      };

      mockProfileRepo = {
        findByUserId: vi.fn().mockResolvedValue(mockProfile),
      };

      mockResumeRepo = {
        findMasterByUserId: vi.fn().mockResolvedValue({ resumeDocument: mockResumeDoc }),
      };

      service = new TailoringPlanService(
        mockPlanRepo,
        mockJobProfileRepo,
        mockMatchRepo,
        mockProfileRepo,
        mockResumeRepo
      );
    });

    it("rejects plan generation if JobProfile is not ANALYZED", async () => {
      mockJobProfileRepo.findById.mockResolvedValueOnce({
        ...mockJobProfile,
        analysisStatus: "PENDING",
      });

      await expect(
        service.createOrGetPlan("usr_mock_1", "jp_mock_123")
      ).rejects.toThrow(/must be fully analyzed/i);
    });

    it("rejects plan generation if underlying JobMatchResult is stale", async () => {
      // Profile version incremented to 4, while match result was for version 3
      mockProfileRepo.findByUserId.mockResolvedValueOnce({
        ...mockProfile,
        profileVersion: 4,
      });

      await expect(
        service.createOrGetPlan("usr_mock_1", "jp_mock_123")
      ).rejects.toThrow(/Career Match data is outdated/i);
    });

    it("authoritatively computes isStale: true when source profile version increments", async () => {
      mockPlanRepo.findByUserAndJobProfile.mockResolvedValueOnce({
        userId: "usr_mock_1",
        jobProfileId: "jp_mock_123",
        jobMatchResultId: "match_mock_123",
        sourceProfileVersion: 3,
        jobAnalysisVersion: 2,
        proposals: [],
        summary: {},
      });

      // Profile was updated to version 4
      mockProfileRepo.findByUserId.mockResolvedValueOnce({
        ...mockProfile,
        profileVersion: 4,
      });

      const { isStale } = await service.getPlan("usr_mock_1", "jp_mock_123");
      expect(isStale).toBe(true);
    });

    it("requires force: true to regenerate plan if user decisions already exist", async () => {
      mockPlanRepo.findByUserAndJobProfile.mockResolvedValueOnce({
        userId: "usr_mock_1",
        jobProfileId: "jp_mock_123",
        intensity: "LIGHT",
        proposals: [
          {
            id: "prop_1",
            isProtected: false,
            userDecision: "ACCEPTED",
          },
        ],
      });

      await expect(
        service.regeneratePlan("usr_mock_1", "jp_mock_123", "BALANCED", false)
      ).rejects.toThrow(/existing accepted or edited decisions/i);
    });

    it("preserves source documents immutability throughout plan operations", async () => {
      const originalProfile = structuredClone(mockProfile);
      const originalResume = structuredClone(mockResumeDoc);
      const originalJobProfile = structuredClone(mockJobProfile);
      const originalMatch = structuredClone(mockMatchResult);

      await service.createOrGetPlan("usr_mock_1", "jp_mock_123");

      expect(mockProfile).toEqual(originalProfile);
      expect(mockResumeDoc).toEqual(originalResume);
      expect(mockJobProfile).toEqual(originalJobProfile);
      expect(mockMatchResult).toEqual(originalMatch);
    });
  });
});
