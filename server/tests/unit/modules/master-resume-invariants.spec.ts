import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeService } from "@/modules/resume/resume.service";
import { MasterResumeBuilder } from "@/modules/resume-intelligence";
import { IProfile } from "@/database/models/Profile.model";
import { DEFAULT_BUILDER_CONFIG } from "@/modules/resume-intelligence/builder/builder.validator";

vi.mock("@/database/models/User.model", () => ({
  UserModel: {
    findById: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({ email: "candidate@skillezo.ai" }),
    }),
  },
}));

describe("Phase 4: Master Resume Domain & Invariant Tests", () => {
  let resumeService: ResumeService;
  let mockResumeRepository: any;
  let mockStorageService: any;
  let mockProfileService: any;

  const mockProfile: Partial<IProfile> = {
    userId: "usr_invariants_999",
    headline: "Senior Cloud Native Engineer",
    bio: "Passionate about Kubernetes, Go, and high-availability architectures.",
    profileVersion: 3,
    skills: [
      { name: "Kubernetes", category: "DEVOPS", level: 5, proficiency: "EXPERT", verified: true, source: "USER" as any, evidenceIds: ["ev_k8s"] },
      { name: "Go", category: "LANGUAGE", level: 4, proficiency: "ADVANCED", verified: false, source: "USER" as any, evidenceIds: ["ev_go"] },
    ],
    experience: [
      {
        companyName: "Nexus Systems",
        jobTitle: "Senior DevOps Engineer",
        startDate: new Date("2020-01-01"),
        isCurrent: true,
        bullets: ["Automated CI/CD pipelines across 50 clusters."],
        evidenceIds: ["ev_exp_nexus"],
      },
    ],
    education: [],
    projects: [],
  };

  beforeEach(() => {
    mockResumeRepository = {
      findByUserId: vi.fn(),
      findMasterByUserId: vi.fn(),
      findUserResumeById: vi.fn(),
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
      getMyProfile: vi.fn().mockResolvedValue(mockProfile),
      updateProfile: vi.fn(),
    };

    resumeService = new ResumeService(
      mockResumeRepository,
      mockStorageService,
      undefined,
      mockProfileService
    );
  });

  describe("Domain Invariant 1: Presentation updates do not mutate ProfileModel", () => {
    it("should save builder presentation config without calling profile service or modifying profileVersion", async () => {
      const existingMaster: any = {
        _id: "res_master_inv_1",
        userId: "usr_invariants_999",
        variantType: "MASTER",
        sourceProfileVersion: 3,
        builderConfig: DEFAULT_BUILDER_CONFIG,
      };

      mockResumeRepository.findUserResumeById.mockResolvedValue(existingMaster);
      mockResumeRepository.updateById.mockResolvedValue({
        ...existingMaster,
        builderConfig: {
          ...DEFAULT_BUILDER_CONFIG,
          fontFamily: "serif",
          templateId: "compact",
        },
      });

      const updatedConfig = await resumeService.saveBuilderConfig(
        "usr_invariants_999",
        "res_master_inv_1",
        {
          ...DEFAULT_BUILDER_CONFIG,
          fontFamily: "serif",
          templateId: "compact",
        }
      );

      expect(updatedConfig.fontFamily).toBe("serif");
      expect(updatedConfig.templateId).toBe("compact");

      // Verify ProfileModel was NOT modified
      expect(mockProfileService.updateProfile).not.toHaveBeenCalled();
      expect(mockResumeRepository.updateById).toHaveBeenCalledWith(
        "res_master_inv_1",
        expect.objectContaining({
          builderConfig: expect.objectContaining({
            fontFamily: "serif",
            templateId: "compact",
          }),
        })
      );
    });
  });

  describe("Domain Invariant 2: Profile facts updates trigger Master Resume staleness", () => {
    it("should flag isStale true when ProfileModel profileVersion increments past sourceProfileVersion", async () => {
      const existingMaster: any = {
        _id: "res_master_inv_2",
        userId: "usr_invariants_999",
        variantType: "MASTER",
        sourceProfileVersion: 2, // older than profile's current version (3)
        resumeDocument: {},
        builderConfig: DEFAULT_BUILDER_CONFIG,
      };

      mockResumeRepository.findMasterByUserId.mockResolvedValue(existingMaster);

      const result = await resumeService.getOrCreateMasterResume("usr_invariants_999");

      expect(result.isStale).toBe(true);
      expect(result.profileVersion).toBe(3);
      expect(result.resume.sourceProfileVersion).toBe(2);
    });

    it("should flag isStale false when Master Resume sourceProfileVersion matches ProfileModel version", async () => {
      const existingMaster: any = {
        _id: "res_master_inv_3",
        userId: "usr_invariants_999",
        variantType: "MASTER",
        sourceProfileVersion: 3, // exactly matches profileVersion (3)
        resumeDocument: {},
        builderConfig: DEFAULT_BUILDER_CONFIG,
      };

      mockResumeRepository.findMasterByUserId.mockResolvedValue(existingMaster);

      const result = await resumeService.getOrCreateMasterResume("usr_invariants_999");

      expect(result.isStale).toBe(false);
      expect(result.profileVersion).toBe(3);
    });
  });

  describe("Domain Invariant 3: Synchronization strictly preserves presentation customizations", () => {
    it("should re-derive career facts from ProfileModel while preserving custom template, typography, and builderConfig", async () => {
      const customPresentationConfig = {
        templateId: "executive" as const,
        primaryColor: "#0d9488",
        fontFamily: "Outfit" as const,
        fontSize: "spacious" as const,
        margins: "narrow" as const,
      };

      const existingMaster: any = {
        _id: "res_master_inv_4",
        userId: "usr_invariants_999",
        variantType: "MASTER",
        sourceProfileVersion: 1,
        resumeDocument: {
          id: "res_doc_1",
          templateConfig: customPresentationConfig,
          skills: [],
          experience: [],
        },
        builderConfig: {
          ...DEFAULT_BUILDER_CONFIG,
          templateId: "executive",
          primaryColor: "#0d9488",
          fontFamily: "Outfit",
        },
      };

      mockResumeRepository.findMasterByUserId.mockResolvedValue(existingMaster);
      mockResumeRepository.updateById.mockImplementation(async (id: string, update: any) => ({
        ...existingMaster,
        resumeDocument: update.resumeDocument,
        sourceProfileVersion: update.sourceProfileVersion,
        builderConfig: update.builderConfig,
      }));

      const syncResult = await resumeService.syncMasterResume("usr_invariants_999");

      expect(syncResult.isStale).toBe(false);
      expect(syncResult.profileVersion).toBe(3);

      const updatedDoc = syncResult.resume.resumeDocument as any;
      // Presentation configs preserved strictly
      expect(updatedDoc.templateConfig.templateId).toBe("executive");
      expect(updatedDoc.templateConfig.primaryColor).toBe("#0d9488");
      expect(updatedDoc.templateConfig.fontFamily).toBe("Outfit");
      expect(syncResult.resume.builderConfig?.templateId).toBe("executive");

      // Career facts derived deterministically from ProfileModel
      expect(updatedDoc.skills).toHaveLength(2);
      expect(updatedDoc.skills[0].name).toBe("Kubernetes");
      expect(updatedDoc.experience).toHaveLength(1);
      expect(updatedDoc.experience[0].companyName).toBe("Nexus Systems");
    });
  });

  describe("Domain Invariant 4: Master Resume lazy creation is concurrency-safe", () => {
    it("should catch duplicate key collision (E11000) and safely return the single winning Master Resume", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValueOnce(null);

      const winningMaster = {
        _id: "res_master_inv_winner",
        userId: "usr_invariants_999",
        variantType: "MASTER",
        sourceProfileVersion: 3,
        resumeDocument: {},
      };

      const collisionErr = new Error("E11000 duplicate key error collection: resumes index: userId_1_variantType_1 dup key");
      (collisionErr as any).code = 11000;
      mockResumeRepository.create.mockRejectedValueOnce(collisionErr);
      mockResumeRepository.findMasterByUserId.mockResolvedValueOnce(winningMaster);

      const result = await resumeService.getOrCreateMasterResume("usr_invariants_999");

      expect(result.resume._id).toBe("res_master_inv_winner");
      expect(result.resume.variantType).toBe("MASTER");
      expect(result.isStale).toBe(false);
    });
  });
});
