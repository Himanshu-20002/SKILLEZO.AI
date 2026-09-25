import { describe, it, expect, vi, beforeEach } from "vitest";
import { CareerJobMatcher } from "../../../src/modules/job-match/career-job-matcher";
import { JobMatchService } from "../../../src/modules/job-match/job-match.service";
import { IJobProfile } from "../../../src/database/models/JobProfile.model";
import { IProfile } from "../../../src/database/models/Profile.model";
import { IResume } from "../../../src/database/models/Resume.model";
import { SkillSource } from "../../../src/core/constants/enums";
import { Types } from "mongoose";

describe("Phase 6B: Career ↔ Job Evidence Matching Test Suite", () => {
  let mockJobProfile: Partial<IJobProfile>;
  let mockProfile: Partial<IProfile>;
  let mockMasterResume: Partial<IResume>;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.JOB_ANALYSIS_MODE = "mock";

    mockJobProfile = {
      _id: new Types.ObjectId("65a000000000000000000001"),
      userId: "user_test_123",
      displayName: "Senior Full Stack Engineer - Stripe",
      jobTitle: "Senior Full Stack Engineer",
      company: "Stripe",
      rawDescription: "Sample job description",
      normalizedDescription: "Sample job description",
      sourceHash: "samplehash",
      jobFingerprint: "samplefp",
      analysisStatus: "ANALYZED",
      analysisVersion: 1,
      analysis: {
        normalizedRoleTitle: "Senior Full Stack Engineer",
        seniority: "SENIOR",
        responsibilities: ["Build resilient payment gateways"],
        requirements: [
          {
            name: "React",
            normalizedName: "react",
            category: "SKILL",
            importance: "REQUIRED",
            evidence: { text: "Requires React frontend experience" },
            confidence: 0.95,
          },
          {
            name: "ReactJS",
            normalizedName: "reactjs",
            category: "SKILL",
            importance: "REQUIRED",
            evidence: { text: "Must know ReactJS framework" },
            confidence: 0.95,
          },
          {
            name: "Java",
            normalizedName: "java",
            category: "TECHNOLOGY",
            importance: "REQUIRED",
            evidence: { text: "Requires Java backend" },
            confidence: 0.9,
          },
          {
            name: "Docker",
            normalizedName: "docker",
            category: "TOOL",
            importance: "PREFERRED",
            evidence: { text: "Docker container experience preferred" },
            confidence: 0.85,
          },
          {
            name: "AWS",
            normalizedName: "aws",
            category: "TECHNOLOGY",
            importance: "REQUIRED",
            evidence: { text: "Experience with AWS Cloud required" },
            confidence: 0.9,
          },
          {
            name: "5+ years experience",
            normalizedName: "5+ years experience",
            category: "EXPERIENCE",
            importance: "REQUIRED",
            evidence: { text: "Requires 5+ years of software experience" },
            confidence: 0.9,
          },
          {
            name: "Bachelor's Degree in Computer Science",
            normalizedName: "bachelor's degree in computer science",
            category: "EDUCATION",
            importance: "REQUIRED",
            evidence: { text: "Bachelor's degree in Computer Science required" },
            confidence: 0.9,
          },
          {
            name: "GraphQL Architecture",
            normalizedName: "graphql architecture",
            category: "TECHNOLOGY",
            importance: "UNKNOWN",
            evidence: { text: "GraphQL schema design experience" },
            confidence: 0.8,
          },
        ],
        experienceRequirements: [],
        educationRequirements: [],
        domain: "FinTech",
        location: "Remote",
        employmentType: "Full-Time",
        keywords: ["React", "Java", "Docker", "AWS"],
      },
    };

    mockProfile = {
      _id: new Types.ObjectId("65b000000000000000000001"),
      userId: "user_test_123",
      profileVersion: 1,
      skills: [
        {
          name: "React",
          category: "Frontend",
          level: 4,
          source: SkillSource.PROFILE,
          verified: true,
        },
        {
          name: "JavaScript",
          category: "Languages",
          level: 5,
          source: SkillSource.PROFILE,
          verified: true,
        },
        {
          name: "Kubernetes",
          category: "DevOps",
          level: 3,
          source: SkillSource.PROFILE,
          verified: true,
        },
        {
          name: "GraphQL",
          category: "API",
          level: 4,
          source: SkillSource.PROFILE,
          verified: true,
        },
      ],
      experience: [
        {
          companyName: "Acme Corp",
          jobTitle: "Senior Software Engineer",
          startDate: new Date("2020-01-01"),
          endDate: new Date("2024-01-01"),
          isCurrent: false,
          technologiesUsed: ["React", "JavaScript", "Kubernetes"],
          bullets: ["Engineered React web interfaces and deployed with Kubernetes."],
        },
        {
          companyName: "Beta Startup",
          jobTitle: "Software Developer",
          startDate: new Date("2018-01-01"),
          endDate: new Date("2020-01-01"),
          isCurrent: false,
          technologiesUsed: ["JavaScript", "HTML/CSS"],
          bullets: ["Developed responsive client-side applications."],
        },
      ],
      projects: [
        {
          title: "EVENTO Platform",
          description: "Full-stack event management platform using React, GraphQL, and Node.",
          techStack: ["React", "GraphQL", "Node.js"],
        },
      ],
      education: [
        {
          institution: "Delhi Technological University",
          degree: "B.Tech",
          fieldOfStudy: "Computer Science",
          startYear: 2014,
          endYear: 2018,
        },
      ],
    };

    mockMasterResume = {
      _id: new Types.ObjectId("65c000000000000000000001"),
      userId: "user_test_123",
      variantType: "MASTER",
      extractedData: {
        skills: [{ name: "React" }, { name: "JavaScript" }],
        experience: [],
        projects: [],
        education: [],
        certifications: [],
      },
    };
  });

  describe("1. Deterministic Matching & Technology Boundaries", () => {
    it("matches exact skill and alias (React / ReactJS) as PROVEN_RELEVANT", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const reactMatch = result.requirementMatches.find((m) => m.name === "React");
      expect(reactMatch).toBeDefined();
      expect(reactMatch?.matchState).toBe("PROVEN_RELEVANT");
      expect(reactMatch?.evidence.length).toBeGreaterThan(0);
      expect(reactMatch?.evidence[0].sourceType).toBe("SKILL");

      const reactJsMatch = result.requirementMatches.find((m) => m.name === "ReactJS");
      expect(reactJsMatch).toBeDefined();
      expect(reactJsMatch?.matchState).toBe("PROVEN_RELEVANT");
    });

    it("strictly preserves technology boundary: Java !== JavaScript", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const javaMatch = result.requirementMatches.find((m) => m.name === "Java");
      expect(javaMatch).toBeDefined();
      // Candidate has JavaScript, but NOT Java
      expect(javaMatch?.matchState).toBe("MISSING");
      expect(javaMatch?.evidence).toHaveLength(0);
    });

    it("assigns RELATED_EVIDENCE for Docker when candidate has Kubernetes (strictly NOT PROVEN_RELEVANT)", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const dockerMatch = result.requirementMatches.find((m) => m.name === "Docker");
      expect(dockerMatch).toBeDefined();
      expect(dockerMatch?.matchState).toBe("RELATED_EVIDENCE");
      expect(dockerMatch?.matchState).not.toBe("PROVEN_RELEVANT");
      expect(dockerMatch?.explanation).toContain("Does not prove");
    });

    it("marks missing requirement (AWS) as MISSING with zero invented evidence", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const awsMatch = result.requirementMatches.find((m) => m.name === "AWS");
      expect(awsMatch).toBeDefined();
      expect(awsMatch?.matchState).toBe("MISSING");
      expect(awsMatch?.evidence).toHaveLength(0);
      expect(awsMatch?.explanation).toContain("SKILLEZO will not add this claim");
    });
  });

  describe("2. PROVEN_UNDERREPRESENTED Invariant", () => {
    it("marks GraphQL as PROVEN_UNDERREPRESENTED when verified in Career Profile but omitted in Master Resume", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const graphqlMatch = result.requirementMatches.find((m) => m.name === "GraphQL Architecture");
      expect(graphqlMatch).toBeDefined();
      // GraphQL is in profile skills & projects, but not in masterResume.extractedData.skills
      expect(graphqlMatch?.matchState).toBe("PROVEN_UNDERREPRESENTED");
      expect(graphqlMatch?.explanation).toContain("not prominently showcased in your current Master Resume");
    });
  });

  describe("3. Education & Experience Duration Evaluation", () => {
    it("confirms B.Tech in Computer Science satisfies Bachelor's in CS requirement", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const eduMatch = result.requirementMatches.find((m) => m.category === "EDUCATION");
      expect(eduMatch).toBeDefined();
      expect(eduMatch?.matchState).toBe("PROVEN_RELEVANT");
      expect(eduMatch?.evidence[0].sourceType).toBe("EDUCATION");
      expect(eduMatch?.evidence[0].label).toContain("B.Tech in Computer Science");
    });

    it("verifies 5+ years experience when complete dates support 6 years total", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const expMatch = result.requirementMatches.find((m) => m.name === "5+ years experience");
      expect(expMatch).toBeDefined();
      // 2018-2020 (2 yrs) + 2020-2024 (4 yrs) = 6 yrs >= 5 yrs
      expect(expMatch?.matchState).toBe("PROVEN_RELEVANT");
    });

    it("flags INSUFFICIENT_EVIDENCE if experience dates are missing or incomplete", async () => {
      const profileWithIncompleteDates: Partial<IProfile> = {
        ...mockProfile,
        experience: [
          {
            companyName: "Incomplete Corp",
            jobTitle: "Developer",
            startDate: null, // missing date
            endDate: null,
            isCurrent: false,
            technologiesUsed: ["React"],
            bullets: ["Building apps"],
          },
        ],
      };

      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        profileWithIncompleteDates as IProfile,
        mockMasterResume as IResume
      );

      const expMatch = result.requirementMatches.find((m) => m.name === "5+ years experience");
      expect(expMatch).toBeDefined();
      expect(expMatch?.matchState).toBe("INSUFFICIENT_EVIDENCE");
    });
  });

  describe("4. Preservation of UNKNOWN Importance", () => {
    it("preserves UNKNOWN importance from Phase 6A without downgrading", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      const unknownReq = result.requirementMatches.find((m) => m.name === "GraphQL Architecture");
      expect(unknownReq).toBeDefined();
      expect(unknownReq?.importance).toBe("UNKNOWN");
    });
  });

  describe("5. Summary Metrics & Explicit Coverage Representation", () => {
    it("computes explicit requirement counts accurately", async () => {
      const result = await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      expect(result.summary.totalRequirements).toBe(8);
      expect(result.summary.requiredTotal).toBe(6);
      expect(result.summary.requiredProven).toBe(4); // React, ReactJS, 5+ yrs, Bachelor CS
      expect(result.summary.missing).toBe(2); // Java, AWS
      expect(result.summary.related).toBe(1); // Docker (related to K8s)
      expect(result.summary.underrepresented).toBe(1); // GraphQL
    });
  });

  describe("6. Service Staleness & Invariant Integrity", () => {
    it("flags match result as isStale when profileVersion increments", async () => {
      const mockMatchRepo: any = {
        findByUserAndJobProfile: vi.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          userId: "user_test_123",
          jobProfileId: mockJobProfile._id,
          sourceProfileVersion: 1, // generated at v1
          jobAnalysisVersion: 1,
          requirementMatches: [],
          summary: {
            totalRequirements: 8,
            proven: 4,
            underrepresented: 1,
            partial: 0,
            related: 1,
            missing: 2,
            insufficient: 0,
            needsReview: 0,
            requiredTotal: 6,
            requiredProven: 4,
          },
        }),
      };

      const mockJobProfileRepo: any = {
        findByIdAndUserId: vi.fn().mockResolvedValue(mockJobProfile),
      };

      const service = new JobMatchService(mockMatchRepo, mockJobProfileRepo);

      // Candidate Profile has now evolved to profileVersion 2
      (service as any).profileRepo = {
        findByUserId: vi.fn().mockResolvedValue({
          ...mockProfile,
          profileVersion: 2,
        }),
      };

      const { isStale } = await service.getMatchResult("user_test_123", mockJobProfile._id!.toString());
      expect(isStale).toBe(true);
    });

    it("guarantees ProfileModel and ResumeModel are never mutated during matching", async () => {
      const profileSnapshot = JSON.stringify(mockProfile);
      const resumeSnapshot = JSON.stringify(mockMasterResume);

      await CareerJobMatcher.match(
        mockJobProfile as IJobProfile,
        mockProfile as IProfile,
        mockMasterResume as IResume
      );

      // Verify exact JSON parity before and after matching
      expect(JSON.stringify(mockProfile)).toBe(profileSnapshot);
      expect(JSON.stringify(mockMasterResume)).toBe(resumeSnapshot);
    });
  });
});
