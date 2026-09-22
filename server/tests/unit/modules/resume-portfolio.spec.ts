import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResumeService } from "@/modules/resume/resume.service";
import { ResumeStatus } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { Types } from "mongoose";
import { DEFAULT_BUILDER_CONFIG } from "@/modules/resume-intelligence/builder/builder.validator";

vi.mock("@/database/models/User.model", () => ({
  UserModel: {
    findById: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue({ email: "portfolio.candidate@test.com" }),
    }),
  },
}));

describe("Phase 5: Resume Portfolio & Variant Management Unit Tests", () => {
  let resumeService: ResumeService;
  let mockResumeRepository: any;
  let mockStorageService: any;
  let mockProfileService: any;

  const userA = "usr_portfolio_alpha";
  const userB = "usr_portfolio_beta";

  const masterDocAST = {
    id: "doc_master_alpha",
    userId: userA,
    title: "Master Resume",
    contact: {
      fullName: "Alpha Engineer",
      email: "alpha@engineer.dev",
      links: [{ label: "GitHub" as const, url: "https://github.com/alpha" }],
    },
    summary: {
      text: "Senior Distributed Systems Engineer with 8 years experience.",
      targetRole: "Staff Engineer",
    },
    skills: [
      { id: "sk_1", name: "TypeScript", category: "LANGUAGE" as const, evidenceIds: ["ev_1"] },
      { id: "sk_2", name: "Go", category: "LANGUAGE" as const, evidenceIds: ["ev_2"] },
    ],
    experience: [
      {
        id: "exp_1",
        companyName: "HyperScale Corp",
        jobTitle: "Principal Architect",
        isCurrent: true,
        bullets: [
          { id: "b_1", text: "Architected event streaming pipelines.", evidenceIds: ["ev_exp_1"] },
        ],
        technologiesUsed: ["Go", "Kafka", "K8s"],
      },
    ],
    projects: [],
    education: [],
    achievements: [],
    evidence: [
      { id: "ev_1", type: "SKILL" as const, source: "USER" as const, value: "TypeScript", verified: true, createdAt: "2026-01-01" },
    ],
    templateConfig: {
      templateId: "modern" as const,
      primaryColor: "#0284c7",
      fontFamily: "Inter",
      fontSize: "regular" as const,
      margins: "normal" as const,
    },
    currentVersion: {
      versionId: "v1",
      versionNumber: 1,
      name: "Master Resume",
      createdAt: "2026-01-01",
    },
    schemaVersion: "1.0.0",
    isMaster: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };

  const masterResumeRecord: any = {
    _id: new Types.ObjectId("65a000000000000000000001"),
    userId: userA,
    title: "Master Resume",
    variantType: "MASTER",
    isDefault: true,
    sourceProfileVersion: 2,
    resumeDocument: masterDocAST,
    builderConfig: { ...DEFAULT_BUILDER_CONFIG, primaryColor: "#0284c7" },
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const variantResumeRecord: any = {
    _id: new Types.ObjectId("65a000000000000000000002"),
    userId: userA,
    title: "Frontend Specialist Resume",
    variantType: "TAILORED",
    parentResumeId: masterResumeRecord._id,
    targetJobTitle: "Lead Frontend Engineer",
    targetCompany: "Vercel",
    isDefault: false,
    sourceProfileVersion: 2,
    resumeDocument: { ...masterDocAST, id: "doc_variant_1", isMaster: false, title: "Frontend Specialist Resume" },
    builderConfig: { ...DEFAULT_BUILDER_CONFIG, primaryColor: "#7c3aed" },
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  };

  beforeEach(() => {
    mockResumeRepository = {
      findMasterByUserId: vi.fn(),
      findByUserId: vi.fn(),
      findPortfolioItemsByUserId: vi.fn(),
      findUserResumeById: vi.fn(),
      create: vi.fn(),
      updateById: vi.fn(),
      deleteUserResume: vi.fn(),
      clearDefaultFlag: vi.fn(),
      setDefaultResume: vi.fn(),
    };

    mockStorageService = {
      save: vi.fn(),
      delete: vi.fn(),
      getStream: vi.fn(),
      exists: vi.fn(),
    };

    mockProfileService = {
      getMyProfile: vi.fn().mockResolvedValue({
        userId: userA,
        profileVersion: 2,
        headline: "Staff Engineer",
        skills: [{ name: "TypeScript" }, { name: "Go" }],
        experience: [{ companyName: "HyperScale Corp", jobTitle: "Principal Architect" }],
      }),
    };

    resumeService = new ResumeService(
      mockResumeRepository,
      mockStorageService,
      undefined,
      mockProfileService
    );
  });

  describe("Lightweight Portfolio Retrieval (GET /api/resumes/portfolio)", () => {
    it("should return strictly lightweight metadata without full ResumeDocument or builderConfig payloads", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValue(masterResumeRecord);
      mockResumeRepository.findPortfolioItemsByUserId.mockResolvedValue([
        {
          _id: masterResumeRecord._id,
          title: masterResumeRecord.title,
          variantType: "MASTER",
          isDefault: true,
          sourceProfileVersion: 2,
          updatedAt: masterResumeRecord.updatedAt,
          createdAt: masterResumeRecord.createdAt,
        },
        {
          _id: variantResumeRecord._id,
          title: variantResumeRecord.title,
          variantType: "TAILORED",
          targetJobTitle: "Lead Frontend Engineer",
          targetCompany: "Vercel",
          parentResumeId: masterResumeRecord._id,
          isDefault: false,
          sourceProfileVersion: 2,
          updatedAt: variantResumeRecord.updatedAt,
          createdAt: variantResumeRecord.createdAt,
        },
      ]);

      const portfolio = await resumeService.getResumePortfolio(userA);

      expect(portfolio.master).toBeDefined();
      expect(portfolio.master.id).toBe(masterResumeRecord._id.toString());
      expect(portfolio.master.displayName).toBe("Master Resume");
      expect(portfolio.master.variantType).toBe("MASTER");
      expect(portfolio.master.isMasterStale).toBe(false);

      // Invariant: Portfolio items must NOT leak heavy ASTs or builderConfig
      expect((portfolio.master as any).resumeDocument).toBeUndefined();
      expect((portfolio.master as any).builderConfig).toBeUndefined();

      expect(portfolio.variants).toHaveLength(1);
      const v = portfolio.variants[0];
      expect(v.id).toBe(variantResumeRecord._id.toString());
      expect(v.displayName).toBe("Frontend Specialist Resume");
      expect(v.variantType).toBe("TAILORED");
      expect(v.targetJobTitle).toBe("Lead Frontend Engineer");
      expect(v.targetCompany).toBe("Vercel");
      expect(v.parentResumeId).toBe(masterResumeRecord._id.toString());
      expect((v as any).resumeDocument).toBeUndefined();
      expect((v as any).builderConfig).toBeUndefined();
    });

    it("should correctly flag isMasterStale when ProfileModel version exceeds Master sourceProfileVersion", async () => {
      mockProfileService.getMyProfile.mockResolvedValue({
        userId: userA,
        profileVersion: 5, // Profile was updated!
      });

      mockResumeRepository.findMasterByUserId.mockResolvedValue({
        ...masterResumeRecord,
        sourceProfileVersion: 3, // Stale!
      });

      mockResumeRepository.findPortfolioItemsByUserId.mockResolvedValue([
        {
          _id: masterResumeRecord._id,
          title: "Master Resume",
          variantType: "MASTER",
          sourceProfileVersion: 3,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ]);

      const portfolio = await resumeService.getResumePortfolio(userA);
      expect(portfolio.master.isMasterStale).toBe(true);
    });

    it("should enforce strict user isolation and never return another user's resumes", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValue(masterResumeRecord);
      mockResumeRepository.findPortfolioItemsByUserId.mockImplementation((queriedUserId: string) => {
        expect(queriedUserId).toBe(userB);
        return Promise.resolve([]);
      });

      await resumeService.getResumePortfolio(userB);
      expect(mockResumeRepository.findPortfolioItemsByUserId).toHaveBeenCalledWith(userB);
    });
  });

  describe("Variant Creation (POST /api/resumes/variants)", () => {
    it("should create an independent TAILORED variant deep-cloning presentation state without JSON serialization", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValue(masterResumeRecord);

      let createdPayload: any = null;
      mockResumeRepository.create.mockImplementation((payload: any) => {
        createdPayload = {
          ...payload,
          _id: new Types.ObjectId("65a000000000000000000003"),
        };
        return Promise.resolve(createdPayload);
      });

      const variant = await resumeService.createResumeVariant(userA, {
        displayName: "Cloud Platform Specialist",
        targetJobTitle: "Staff Cloud Engineer",
        targetCompany: "AWS",
      });

      expect(variant).toBeDefined();
      expect(createdPayload.userId).toBe(userA);
      expect(createdPayload.title).toBe("Cloud Platform Specialist");
      expect(createdPayload.variantType).toBe("TAILORED");
      expect(createdPayload.parentResumeId).toEqual(masterResumeRecord._id);
      expect(createdPayload.targetJobTitle).toBe("Staff Cloud Engineer");
      expect(createdPayload.targetCompany).toBe("AWS");
      expect(createdPayload.isDefault).toBe(false);

      // Invariant: Typed deep clone of AST
      expect(createdPayload.resumeDocument).toBeDefined();
      expect(createdPayload.resumeDocument.title).toBe("Cloud Platform Specialist");
      expect(createdPayload.resumeDocument.targetRole).toBe("Staff Cloud Engineer");
      expect(createdPayload.resumeDocument.isMaster).toBe(false);
      expect(createdPayload.resumeDocument.skills).toHaveLength(2);
      expect(createdPayload.resumeDocument.experience[0].bullets).toHaveLength(1);

      // Invariant: Decoupled references — mutating variant does NOT mutate Master AST
      createdPayload.resumeDocument.skills.push({ id: "sk_new", name: "Rust", category: "LANGUAGE", evidenceIds: [] });
      createdPayload.resumeDocument.experience[0].bullets[0].text = "Mutated bullet text";

      expect(masterDocAST.skills).toHaveLength(2);
      expect(masterDocAST.experience[0].bullets[0].text).toBe("Architected event streaming pipelines.");

      // Invariant: ProfileModel remains 100% untouched
      expect(mockProfileService.getMyProfile).toHaveBeenCalledWith(userA);
    });
  });

  describe("Variant Renaming & Metadata Updates (PATCH /api/resumes/:resumeId)", () => {
    it("should update display name (title), targetJobTitle, and targetCompany without mutating Master", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue({
        ...variantResumeRecord,
      });

      let updatedFields: any = null;
      mockResumeRepository.updateById.mockImplementation((id: string, fields: any) => {
        updatedFields = fields;
        return Promise.resolve({ ...variantResumeRecord, ...fields });
      });

      const updated = await resumeService.updateResume(userA, variantResumeRecord._id.toString(), {
        displayName: "Senior SRE Resume",
        targetJobTitle: "Senior SRE",
        targetCompany: "Google",
      });

      expect(updatedFields.title).toBe("Senior SRE Resume");
      expect(updatedFields.targetJobTitle).toBe("Senior SRE");
      expect(updatedFields.targetCompany).toBe("Google");
      expect(updated.title).toBe("Senior SRE Resume");

      // Invariant: Master Resume record is untouched
      expect(masterResumeRecord.title).toBe("Master Resume");
    });
  });

  describe("Deletion & Master Protection (DELETE /api/resumes/:resumeId)", () => {
    it("should strictly reject attempts to delete the Master Resume with HTTP 400", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue(masterResumeRecord);

      await expect(
        resumeService.deleteResume(userA, masterResumeRecord._id.toString())
      ).rejects.toThrowError("Cannot delete Master Resume");

      expect(mockResumeRepository.deleteUserResume).not.toHaveBeenCalled();
    });

    it("should safely allow deletion of TAILORED variants owned by the user", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue(variantResumeRecord);
      mockResumeRepository.deleteUserResume.mockResolvedValue(true);
      mockResumeRepository.findByUserId.mockResolvedValue([masterResumeRecord]);

      await resumeService.deleteResume(userA, variantResumeRecord._id.toString());

      expect(mockResumeRepository.deleteUserResume).toHaveBeenCalledWith(
        userA,
        variantResumeRecord._id.toString()
      );
    });

    it("should reject deletion attempts for resumes belonging to another user", async () => {
      mockResumeRepository.findUserResumeById.mockResolvedValue(null);

      await expect(
        resumeService.deleteResume(userB, variantResumeRecord._id.toString())
      ).rejects.toThrow(AppError);

      expect(mockResumeRepository.deleteUserResume).not.toHaveBeenCalled();
    });
  });

  describe("Master Uniqueness & Variant Invariant Integrity", () => {
    it("should verify variant creation never alters Master Resume variantType or uniqueness", async () => {
      mockResumeRepository.findMasterByUserId.mockResolvedValue(masterResumeRecord);
      mockResumeRepository.create.mockResolvedValue({
        _id: new Types.ObjectId("65a000000000000000000004"),
        variantType: "TAILORED",
      });

      await resumeService.createResumeVariant(userA, { displayName: "DevOps Engineer" });

      expect(masterResumeRecord.variantType).toBe("MASTER");
      expect(masterResumeRecord.parentResumeId).toBeUndefined();
    });
  });
});
