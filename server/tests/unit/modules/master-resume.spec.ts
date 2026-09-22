import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeService } from "@/modules/resume/resume.service";
import { MasterResumeBuilder } from "@/modules/resume-intelligence";
import { IProfile } from "@/database/models/Profile.model";
import { DEFAULT_BUILDER_CONFIG } from "@/modules/resume-intelligence/builder/builder.validator";

vi.mock("@/database/models/User.model", () => ({
  UserModel: {
    findById: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({ email: "alex@architect.dev" }),
    }),
  },
}));

describe("Phase 3: Master Resume Generation & UI Integration Unit Tests", () => {
  describe("MasterResumeBuilder", () => {
    const mockProfile: any = {
      userId: "user_p3_test",
      headline: "Senior Distributed Systems Architect",
      bio: "10+ years engineering high-scale distributed systems and real-time streaming engines.",
      phone: "+1-555-0199",
      targetRole: "Staff Software Engineer",
      location: {
        city: "San Francisco",
        state: "CA",
        country: "USA",
      },
      links: {
        github: "https://github.com/architect",
        linkedin: "https://linkedin.com/in/architect",
        portfolio: "https://architect.dev",
      },
      skills: [
        {
          name: "TypeScript",
          category: "LANGUAGE",
          level: 5,
          proficiency: "EXPERT",
          verified: true,
          evidenceId: "ev_skill_ts_123",
        },
        {
          name: "Kubernetes",
          category: "DEVOPS",
          level: 4,
          proficiency: "ADVANCED",
          verified: false,
          evidenceId: "ev_skill_k8s_456",
        },
        {
          name: "Go",
          // category and proficiency omitted intentionally to test zero-inference
          level: 4,
          verified: false,
        } as any,
      ],
      experience: [
        {
          companyName: "CloudScale Inc",
          jobTitle: "Lead Infrastructure Architect",
          startDate: new Date("2021-03-01"),
          endDate: null,
          isCurrent: true,
          description: "Spearheaded cloud-native service mesh transformation.",
          bullets: [
            "Reduced p99 network latency by 42% across 250 microservices.",
            "Architected multi-region failover automation achieving 99.999% uptime.",
          ],
          technologiesUsed: ["Kubernetes", "Go", "gRPC", "Envoy"],
          evidenceId: "ev_exp_cloudscale_789",
        },
      ],
      education: [
        {
          institution: "University of California, Berkeley",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          startYear: 2013,
          endYear: 2017,
          evidenceId: "ev_edu_cal_101",
        },
      ],
      projects: [
        {
          title: "Distributed Raft Engine",
          description: "Consensus state machine written in Go with zero external dependencies.",
          techStack: ["Go", "Raft", "gRPC"],
          githubUrl: "https://github.com/architect/raft-go",
          evidenceId: "ev_proj_raft_202",
        },
      ],
      profileVersion: 3,
    };

    it("should deterministically map profile facts to ResumeDocument presentation AST", () => {
      const ast = MasterResumeBuilder.buildFromProfile(mockProfile, {
        email: "alex@architect.dev",
        candidateName: "Alex Vance",
      });

      expect(ast.contact.fullName).toBe("Alex Vance");
      expect(ast.contact.email).toBe("alex@architect.dev");
      expect(ast.contact.phone).toBe("+1-555-0199");
      expect(ast.contact.location).toBe("San Francisco, CA, USA");
      expect(ast.contact.links).toHaveLength(3);

      expect(ast.summary.text).toContain("10+ years engineering high-scale");
      expect(ast.summary.targetRole).toBe("Staff Software Engineer");

      expect(ast.experience).toHaveLength(1);
      expect(ast.experience[0].companyName).toBe("CloudScale Inc");
      expect(ast.experience[0].jobTitle).toBe("Lead Infrastructure Architect");
      expect(ast.experience[0].bullets).toHaveLength(2);
      expect((ast.experience[0] as any).evidenceId).toBe("ev_exp_cloudscale_789");

      expect(ast.education).toHaveLength(1);
      expect(ast.education[0].institution).toBe("University of California, Berkeley");
      expect(ast.education[0].degree).toBe("Bachelor of Science");
      expect(ast.education[0].fieldOfStudy).toBe("Computer Science");
      expect((ast.education[0] as any).evidenceId).toBe("ev_edu_cal_101");

      expect(ast.projects).toHaveLength(1);
      expect(ast.projects[0].title).toBe("Distributed Raft Engine");
      expect((ast.projects[0] as any).evidenceId).toBe("ev_proj_raft_202");
    });

    it("should never infer or fabricate categories or proficiencies when absent in profile", () => {
      const ast = MasterResumeBuilder.buildFromProfile(mockProfile);
      const goSkill = ast.skills.find((s) => s.name === "Go");

      expect(goSkill).toBeDefined();
      expect(goSkill?.name).toBe("Go");
      // Must NOT fabricate or hallucinate a category or proficiency level
      expect(goSkill?.category).toBeUndefined();
      expect((goSkill as any)?.proficiencyLevel).toBeUndefined();
    });

    it("should preserve Phase 1 evidence IDs across skills, experiences, projects, and education", () => {
      const ast = MasterResumeBuilder.buildFromProfile(mockProfile);

      const tsSkill = ast.skills.find((s) => s.name === "TypeScript");
      expect((tsSkill as any)?.evidenceId).toBe("ev_skill_ts_123");

      expect((ast.experience[0] as any).evidenceId).toBe("ev_exp_cloudscale_789");
      expect((ast.education[0] as any).evidenceId).toBe("ev_edu_cal_101");
      expect((ast.projects[0] as any).evidenceId).toBe("ev_proj_raft_202");
    });

    it("should strictly preserve presentation customizations from an existing document during regeneration", () => {
      const initialAst = MasterResumeBuilder.buildFromProfile(mockProfile);
      
      // User customized presentation in Resume Studio
      const customizedAst = {
        ...initialAst,
        templateConfig: {
          templateId: "compact" as const,
          primaryColor: "#7c3aed",
          fontFamily: "Roboto",
          fontSize: "small" as const,
          margins: "tight" as const,
        },
      };

      // Regenerate AST with an updated profile fact
      const updatedProfile: Partial<IProfile> = {
        ...mockProfile,
        headline: "Principal Cloud Engineer",
      };

      const reGeneratedAst = MasterResumeBuilder.buildFromProfile(updatedProfile, {
        existingDoc: customizedAst as any,
      });

      // Presentation customizations must be strictly preserved
      expect(reGeneratedAst.templateConfig.templateId).toBe("compact");
      expect(reGeneratedAst.templateConfig.primaryColor).toBe("#7c3aed");
      expect(reGeneratedAst.templateConfig.fontFamily).toBe("Roboto");
      expect(reGeneratedAst.templateConfig.fontSize).toBe("small");
      expect(reGeneratedAst.templateConfig.margins).toBe("tight");
    });

    it("should never fabricate missing facts (no placeholder strings)", () => {
      const bareProfile: Partial<IProfile> = {
        userId: "user_bare",
        headline: "",
        bio: "",
        skills: [],
        experience: [],
        education: [],
        projects: [],
      };

      const ast = MasterResumeBuilder.buildFromProfile(bareProfile);
      expect(ast.experience).toEqual([]);
      expect(ast.skills).toEqual([]);
      expect(ast.education).toEqual([]);
      expect(ast.projects).toEqual([]);
      expect(ast.contact.phone).toBeUndefined();
      expect(ast.contact.location).toBeUndefined();
    });
  });

  describe("ResumeService Master Resume Lifecycle", () => {
    let resumeService: ResumeService;
    let mockResumeRepository: any;
    let mockStorageService: any;
    let mockProfileService: any;

    const testProfile: any = {
      userId: "user_test_lifecycle",
      headline: "Staff Engineer",
      bio: "Distributed systems builder",
      profileVersion: 4,
      skills: [{ name: "TypeScript", level: 5, category: "LANGUAGE", proficiency: "EXPERT" }],
      experience: [],
      education: [],
      projects: [],
    };

    beforeEach(() => {
      mockResumeRepository = {
        findMasterByUserId: vi.fn(),
        create: vi.fn(),
        updateById: vi.fn(),
      };

      mockStorageService = {
        save: vi.fn(),
        getStream: vi.fn(),
        delete: vi.fn(),
        exists: vi.fn(),
      };

      mockProfileService = {
        getMyProfile: vi.fn().mockResolvedValue(testProfile),
      };

      resumeService = new ResumeService(
        mockResumeRepository,
        mockStorageService,
        undefined,
        mockProfileService
      );
    });

    it("should lazily create a Master Resume with variantType 'MASTER' and isDefault true if none exists", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValue(null);
      mockResumeRepository.create.mockImplementation(async (data: any) => ({
        _id: "res_master_1",
        ...data,
      }));

      const result = await resumeService.getOrCreateMasterResume("user_test_lifecycle");

      expect(result.resume).toBeDefined();
      expect(result.resume.variantType).toBe("MASTER");
      expect(result.resume.isDefault).toBe(true);
      expect(result.resume.sourceProfileVersion).toBe(4);
      expect(result.isStale).toBe(false);
      expect(result.profileVersion).toBe(4);
      expect(mockResumeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user_test_lifecycle",
          variantType: "MASTER",
          isDefault: true,
          sourceProfileVersion: 4,
        })
      );
    });

    it("should return existing Master Resume without recreation if already present", async () => {
      const existingMaster = {
        _id: "res_master_existing",
        userId: "user_test_lifecycle",
        variantType: "MASTER",
        sourceProfileVersion: 4,
        resumeDocument: {},
        builderConfig: DEFAULT_BUILDER_CONFIG,
      };
      mockResumeRepository.findMasterByUserId.mockResolvedValue(existingMaster);

      const result = await resumeService.getOrCreateMasterResume("user_test_lifecycle");

      expect(result.resume._id).toBe("res_master_existing");
      expect(result.isStale).toBe(false);
      expect(mockResumeRepository.create).not.toHaveBeenCalled();
    });

    it("should detect staleness when profileVersion exceeds sourceProfileVersion", async () => {
      const staleMaster = {
        _id: "res_master_stale",
        userId: "user_test_lifecycle",
        variantType: "MASTER",
        sourceProfileVersion: 2, // older than profileVersion (4)
        resumeDocument: {},
      };
      mockResumeRepository.findMasterByUserId.mockResolvedValue(staleMaster);

      const result = await resumeService.getOrCreateMasterResume("user_test_lifecycle");

      expect(result.isStale).toBe(true);
      expect(result.profileVersion).toBe(4);
    });

    it("should safely handle concurrent creation races by catching duplicate key (E11000) and returning the winner", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValueOnce(null);

      const winningMaster = {
        _id: "res_master_winner",
        userId: "user_test_lifecycle",
        variantType: "MASTER",
        sourceProfileVersion: 4,
        resumeDocument: {},
      };

      // Simulate MongoDB unique constraint collision on concurrent request
      const duplicateKeyError = new Error("E11000 duplicate key error collection: resumes index: userId_1_variantType_1 dup key");
      (duplicateKeyError as any).code = 11000;
      mockResumeRepository.create.mockRejectedValueOnce(duplicateKeyError);

      // On duplicate key, repository query for the winning document
      mockResumeRepository.findMasterByUserId.mockResolvedValueOnce(winningMaster);

      const result = await resumeService.getOrCreateMasterResume("user_test_lifecycle");

      expect(result.resume._id).toBe("res_master_winner");
      expect(result.isStale).toBe(false);
    });

    it("should synchronize Master Resume with latest profile and preserve layout/styling", async () => {
      const existingMaster = {
        _id: "res_master_to_sync",
        userId: "user_test_lifecycle",
        variantType: "MASTER",
        sourceProfileVersion: 2,
        resumeDocument: {
          templateConfig: {
            templateId: "executive",
            primaryColor: "#059669",
            fontFamily: "Outfit",
          },
        },
        builderConfig: {
          templateId: "executive",
          primaryColor: "#059669",
        },
      };

      mockResumeRepository.findMasterByUserId.mockResolvedValue(existingMaster);
      mockResumeRepository.updateById.mockImplementation(async (id: string, update: any) => ({
        ...existingMaster,
        ...update,
        sourceProfileVersion: update.sourceProfileVersion,
      }));

      const syncResult = await resumeService.syncMasterResume("user_test_lifecycle");

      expect(syncResult.isStale).toBe(false);
      expect(syncResult.profileVersion).toBe(4);
      expect(mockResumeRepository.updateById).toHaveBeenCalledWith(
        "res_master_to_sync",
        expect.objectContaining({
          sourceProfileVersion: 4,
          builderConfig: expect.objectContaining({
            templateId: "executive",
            primaryColor: "#059669",
          }),
        })
      );
    });

    it("should ensure synchronization is idempotent", async () => {
      const master = {
        _id: "res_master_idempotent",
        userId: "user_test_lifecycle",
        variantType: "MASTER",
        sourceProfileVersion: 4,
        resumeDocument: { templateConfig: { templateId: "modern" } },
        builderConfig: DEFAULT_BUILDER_CONFIG,
      };

      mockResumeRepository.findMasterByUserId.mockResolvedValue(master);
      mockResumeRepository.updateById.mockResolvedValue({
        ...master,
        sourceProfileVersion: 4,
      });

      const firstSync = await resumeService.syncMasterResume("user_test_lifecycle");
      const secondSync = await resumeService.syncMasterResume("user_test_lifecycle");

      expect(firstSync.isStale).toBe(false);
      expect(secondSync.isStale).toBe(false);
      expect(firstSync.profileVersion).toBe(secondSync.profileVersion);
    });

    it("should ensure multiple simultaneous creation requests resolve to the exact same Master Resume record", async () => {
      let createdDoc: any = null;
      mockResumeRepository.findMasterByUserId.mockImplementation(async () => createdDoc);

      mockResumeRepository.create.mockImplementation(async (data: any) => {
        if (createdDoc) {
          const err = new Error("E11000 duplicate key error collection: resumes index: userId_1_variantType_1 dup key");
          (err as any).code = 11000;
          throw err;
        }
        createdDoc = {
          _id: "res_master_concurrent_single",
          ...data,
        };
        return createdDoc;
      });

      // Fire 5 simultaneous requests
      const results = await Promise.all([
        resumeService.getOrCreateMasterResume("user_test_lifecycle"),
        resumeService.getOrCreateMasterResume("user_test_lifecycle"),
        resumeService.getOrCreateMasterResume("user_test_lifecycle"),
        resumeService.getOrCreateMasterResume("user_test_lifecycle"),
        resumeService.getOrCreateMasterResume("user_test_lifecycle"),
      ]);

      // All 5 must resolve to the identical single Master Resume
      expect(results).toHaveLength(5);
      for (const res of results) {
        expect(res.resume._id).toBe("res_master_concurrent_single");
        expect(res.resume.variantType).toBe("MASTER");
      }
    });
  });
});
