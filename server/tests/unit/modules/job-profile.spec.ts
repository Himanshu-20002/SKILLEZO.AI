import { describe, it, expect, vi, beforeEach } from "vitest";
import { JobProfileNormalizer } from "../../../src/modules/job-profile/job-profile.normalizer";
import { JobProfileService } from "../../../src/modules/job-profile/job-profile.service";
import {
  JobIntakeInputSchema,
  JobRequirementItemSchema,
  JobAnalysisOutputSchema,
} from "../../../src/modules/job-profile/job-profile.types";

describe("Phase 6A: Job Intake & JD Analysis Unit Test Suite", () => {
  describe("1. Input Validation & Zod Schemas", () => {
    it("validates a complete, valid job intake payload", () => {
      const input = {
        jobTitle: "Senior Frontend Engineer",
        company: "Acme Corp",
        jobUrl: "https://example.com/careers/frontend",
        rawDescription:
          "We are seeking a Senior Frontend Engineer with 4+ years of experience. Required: React, TypeScript, Next.js. Preferred: AWS, Docker. Responsibilities include building scalable web apps.",
      };

      const result = JobIntakeInputSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.jobTitle).toBe("Senior Frontend Engineer");
        expect(result.data.company).toBe("Acme Corp");
      }
    });

    it("rejects empty or whitespace-only job title", () => {
      const input = {
        jobTitle: "   ",
        rawDescription:
          "We are seeking a Senior Frontend Engineer with 4+ years of experience. Required: React, TypeScript, Next.js.",
      };
      const result = JobIntakeInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("rejects job description that is too short (< 50 characters)", () => {
      const input = {
        jobTitle: "Frontend Developer",
        rawDescription: "Too short job description.",
      };
      const result = JobIntakeInputSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("validates empty string or null for optional jobUrl gracefully", () => {
      const input1 = {
        jobTitle: "Frontend Developer",
        jobUrl: "",
        rawDescription:
          "We are seeking a Senior Frontend Engineer with 4+ years of experience. Required: React, TypeScript, Next.js.",
      };
      const result1 = JobIntakeInputSchema.safeParse(input1);
      expect(result1.success).toBe(true);

      const input2 = {
        jobTitle: "Frontend Developer",
        jobUrl: "not-a-url",
        rawDescription:
          "We are seeking a Senior Frontend Engineer with 4+ years of experience. Required: React, TypeScript, Next.js.",
      };
      const result2 = JobIntakeInputSchema.safeParse(input2);
      expect(result2.success).toBe(false);
    });
  });

  describe("2. JD Normalizer & Grounded Evidence Verification", () => {
    it("cleans excessive line breaks and whitespace while preserving bullets and casing", () => {
      const raw =
        "  Senior   Engineer \r\n\r\n\r\n\r\n•  React.js  and   TypeScript\r\n• Node.js  \n\n\n\n- Docker  ";
      const normalized = JobProfileNormalizer.normalizeDescription(raw);

      expect(normalized).not.toContain("\r");
      expect(normalized).not.toContain("\n\n\n");
      expect(normalized).toContain("• React.js and TypeScript");
      expect(normalized).toContain("• Node.js");
      expect(normalized).toContain("- Docker");
    });

    it("computes deterministic sourceHash and jobFingerprint", () => {
      const title = "Staff Engineer";
      const company = "Tech Innovations";
      const text = "A detailed job description containing over fifty characters for testing purposes.";

      const hash1 = JobProfileNormalizer.computeSourceHash(text);
      const hash2 = JobProfileNormalizer.computeSourceHash(text);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256

      const fp1 = JobProfileNormalizer.computeJobFingerprint(title, company, text);
      const fp2 = JobProfileNormalizer.computeJobFingerprint(" staff engineer  ", "TECH INNOVATIONS", text);
      expect(fp1).toBe(fp2); // Case and whitespace invariant
    });

    it("verifies grounded evidence when text genuinely exists in the JD", () => {
      const jd =
        "We require 4+ years of hands-on experience with React, Next.js and TypeScript in production.";

      expect(
        JobProfileNormalizer.verifyEvidenceGrounding(
          "4+ years of hands-on experience with React, Next.js and TypeScript in production",
          jd
        )
      ).toBe(true);

      expect(
        JobProfileNormalizer.verifyEvidenceGrounding(
          "React, Next.js and TypeScript",
          jd
        )
      ).toBe(true);
    });

    it("explicitly rejects hallucinated evidence text that does not exist in the source JD", () => {
      const jd =
        "We require 4+ years of hands-on experience with React, Next.js and TypeScript in production.";

      const hallucinatedEvidence =
        "5+ years of Python, Kubernetes and Microservices architecture experience.";

      expect(
        JobProfileNormalizer.verifyEvidenceGrounding(hallucinatedEvidence, jd)
      ).toBe(false);
    });
  });

  describe("3. Canonical Requirements Schema & AI Output Validation", () => {
    it("validates canonical requirement item structure with grounded evidence", () => {
      const item = {
        name: "Next.js",
        normalizedName: "next.js",
        category: "TECHNOLOGY",
        importance: "REQUIRED",
        evidence: {
          text: "Strong experience with Next.js App Router and React Server Components",
          section: "Requirements",
        },
        confidence: 0.95,
      };

      const result = JobRequirementItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it("accepts UNKNOWN importance without dropping it", () => {
      const item = {
        name: "GraphQL",
        normalizedName: "graphql",
        category: "SKILL",
        importance: "UNKNOWN",
        evidence: {
          text: "Exposure to GraphQL APIs or REST services is helpful",
        },
        confidence: 0.85,
      };

      const result = JobRequirementItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.importance).toBe("UNKNOWN");
      }
    });

    it("resiliently recovers requirement name from skill, requirement, or title aliases", () => {
      const itemWithSkill = {
        skill: "Docker",
        category: "TOOL",
        importance: "REQUIRED",
        evidence: { text: "Docker experience" },
      };
      const result = JobRequirementItemSchema.safeParse(itemWithSkill);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Docker");
      }

      const stringItem = "PostgreSQL";
      const resultStr = JobRequirementItemSchema.safeParse(stringItem);
      expect(resultStr.success).toBe(true);
      if (resultStr.success) {
        expect(resultStr.data.name).toBe("PostgreSQL");
      }
    });

    it("validates full structured AI analysis schema", () => {
      const analysisOutput = {
        normalizedRoleTitle: "Senior Frontend Engineer",
        seniority: "SENIOR",
        responsibilities: [
          "Architect, develop, and maintain responsive web applications using React and Next.js.",
          "Collaborate with backend engineers to consume RESTful and GraphQL APIs.",
        ],
        requirements: [
          {
            name: "React",
            normalizedName: "react",
            category: "TECHNOLOGY",
            importance: "REQUIRED",
            evidence: {
              text: "Must have at least 4 years of React experience.",
              section: "Requirements",
            },
            confidence: 0.99,
          },
          {
            name: "AWS",
            normalizedName: "aws",
            category: "TOOL",
            importance: "PREFERRED",
            evidence: {
              text: "Familiarity with AWS cloud deployments is a plus.",
              section: "Preferred Qualifications",
            },
            confidence: 0.9,
          },
        ],
        experienceRequirements: ["4+ years of professional web development experience"],
        educationRequirements: ["B.S. in Computer Science or equivalent practical experience"],
        domain: "FinTech",
        location: "Hybrid (New Delhi, India)",
        employmentType: "Full-time",
        keywords: ["React", "Next.js", "TypeScript", "Frontend", "FinTech"],
      };

      const result = JobAnalysisOutputSchema.safeParse(analysisOutput);
      expect(result.success).toBe(true);
    });
  });

  describe("4. JobProfileService Orchestration & Invariants", () => {
    let mockRepo: any;
    let mockAiService: any;
    let service: JobProfileService;

    beforeEach(() => {
      mockRepo = {
        findAnalyzedByFingerprint: vi.fn(),
        findByIdAndUserId: vi.fn(),
        listByUserId: vi.fn(),
        create: vi.fn(),
        updateAnalysis: vi.fn(),
        markFailed: vi.fn(),
      };

      mockAiService = {
        analyzeJobDescription: vi.fn(),
      };

      service = new JobProfileService(mockRepo, mockAiService);
    });

    it("returns existing analyzed profile without calling AI if identical fingerprint exists for user", async () => {
      const existingProfile = {
        _id: "job-profile-existing-123",
        userId: "user-1",
        displayName: "Frontend Dev — Acme",
        jobFingerprint: "fp-123",
        analysisStatus: "ANALYZED",
      };

      mockRepo.findAnalyzedByFingerprint.mockResolvedValue(existingProfile);

      const result = await service.createAndAnalyze("user-1", {
        jobTitle: "Frontend Dev",
        company: "Acme",
        rawDescription:
          "We are seeking a Frontend Developer with React, TypeScript and Next.js knowledge.",
      });

      expect(result.isExisting).toBe(true);
      expect(result.profile).toEqual(existingProfile);
      // Crucial: AI service was NOT invoked!
      expect(mockAiService.analyzeJobDescription).not.toHaveBeenCalled();
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it("creates, analyzes, and saves JobProfile when new fingerprint is submitted", async () => {
      mockRepo.findAnalyzedByFingerprint.mockResolvedValue(null);

      const initialDoc = {
        _id: "job-new-456",
        userId: "user-1",
        jobTitle: "Senior Frontend Engineer",
        analysisStatus: "ANALYZING",
      };
      mockRepo.create.mockResolvedValue(initialDoc);

      const fakeAnalysis = {
        normalizedRoleTitle: "Senior Frontend Engineer",
        seniority: "SENIOR",
        responsibilities: ["Build UI"],
        requirements: [
          {
            name: "React",
            normalizedName: "react",
            category: "TECHNOLOGY",
            importance: "REQUIRED",
            evidence: { text: "React required", section: "Reqs" },
            confidence: 1.0,
          },
        ],
        experienceRequirements: [],
        educationRequirements: [],
        keywords: ["React"],
      };

      const fakeMetadata = {
        source: "AI",
        provider: "gemini",
        analyzedAt: new Date(),
      };

      mockAiService.analyzeJobDescription.mockResolvedValue({
        analysis: fakeAnalysis,
        metadata: fakeMetadata,
      });

      const updatedDoc = {
        ...initialDoc,
        analysis: fakeAnalysis,
        analysisStatus: "ANALYZED",
        analysisMetadata: fakeMetadata,
      };
      mockRepo.updateAnalysis.mockResolvedValue(updatedDoc);

      const result = await service.createAndAnalyze("user-1", {
        jobTitle: "Senior Frontend Engineer",
        company: "Acme",
        rawDescription:
          "We are seeking a Senior Frontend Engineer with 4+ years experience. React required.",
      });

      expect(result.isExisting).toBe(false);
      expect(result.profile.analysisStatus).toBe("ANALYZED");
      expect(mockAiService.analyzeJobDescription).toHaveBeenCalledTimes(1);
      expect(mockRepo.updateAnalysis).toHaveBeenCalledTimes(1);
    });

    it("marks profile as FAILED with structured error code when AI fails, without silent fallback", async () => {
      mockRepo.findAnalyzedByFingerprint.mockResolvedValue(null);

      const initialDoc = {
        _id: "job-fail-789",
        userId: "user-1",
        analysisStatus: "ANALYZING",
      };
      mockRepo.create.mockResolvedValue(initialDoc);

      mockAiService.analyzeJobDescription.mockRejectedValue(
        new Error("AI Model provider timeout after 15000ms")
      );

      await expect(
        service.createAndAnalyze("user-1", {
          jobTitle: "Backend Developer",
          rawDescription:
            "A long enough job description for backend development with Node.js and PostgreSQL.",
        })
      ).rejects.toThrow("timeout");

      // Verify markFailed was called with MODEL_TIMEOUT code
      expect(mockRepo.markFailed).toHaveBeenCalledWith(
        "job-fail-789",
        "user-1",
        expect.objectContaining({
          code: "MODEL_TIMEOUT",
        })
      );
      // Verify analysis was NOT silently updated to ANALYZED
      expect(mockRepo.updateAnalysis).not.toHaveBeenCalled();
    });

    it("marks profile as FAILED with SCHEMA_VALIDATION_FAILED if evidence is ungrounded", async () => {
      mockRepo.findAnalyzedByFingerprint.mockResolvedValue(null);

      const initialDoc = {
        _id: "job-ungrounded-101",
        userId: "user-1",
        analysisStatus: "ANALYZING",
      };
      mockRepo.create.mockResolvedValue(initialDoc);

      mockAiService.analyzeJobDescription.mockRejectedValue(
        new Error("Evidence citation not grounded in source text: 'invented claim'")
      );

      await expect(
        service.createAndAnalyze("user-1", {
          jobTitle: "Data Engineer",
          rawDescription:
            "A valid job description for data engineer with SQL, Python, Spark, and BigQuery.",
        })
      ).rejects.toThrow("not grounded");

      expect(mockRepo.markFailed).toHaveBeenCalledWith(
        "job-ungrounded-101",
        "user-1",
        expect.objectContaining({
          code: "SCHEMA_VALIDATION_FAILED",
        })
      );
    });
  });
});
