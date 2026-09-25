import { describe, it, expect, vi, beforeEach } from "vitest";
import { TailoredResumeService } from "../../src/modules/job-tailoring/tailored-resume.service";
import { ResumeDocument } from "../../src/modules/resume-intelligence/document/resume-document.types";
import { DEFAULT_BUILDER_CONFIG } from "../../src/modules/resume-intelligence/builder/builder.types";
import { JobProfileModel } from "../../src/database/models/JobProfile.model";
import { JobMatchResultModel } from "../../src/database/models/JobMatchResult.model";
import { TailoringPlanModel } from "../../src/database/models/TailoringPlan.model";
import { ProfileModel } from "../../src/database/models/Profile.model";
import { ResumeModel } from "../../src/database/models/Resume.model";

describe("Phase 6A → 6D End-to-End Contract Integration Test", () => {
  const userId = "usr_integration_123";
  const jobProfileId = "jp_integration_456";
  const masterResumeId = "res_master_789";
  const matchResultId = "mr_integration_101";
  const tailoringPlanId = "tp_integration_202";

  const originalMasterDoc: ResumeDocument = {
    id: "doc_master_integration",
    userId,
    title: "Master Resume",
    contact: {
      fullName: "Jane Developer",
      email: "jane@example.com",
      links: [],
    },
    summary: {
      text: "Full Stack Developer with 4 years experience.",
      targetRole: "Full Stack Engineer",
      yearsOfExperience: 4,
    },
    skills: [
      { id: "sk_python", name: "Python", category: "LANGUAGE", evidenceIds: [] },
      { id: "sk_react", name: "React", category: "FRONTEND", evidenceIds: [] },
      { id: "sk_django", name: "Django", category: "BACKEND", evidenceIds: [] },
    ],
    experience: [
      {
        id: "exp_company_a",
        companyName: "Company A",
        jobTitle: "Software Developer",
        isCurrent: true,
        bullets: [
          {
            id: "b_auth",
            text: "Implemented authentication flow in Django.",
            evidenceIds: [],
          },
          {
            id: "b_perf",
            text: "Optimized database queries decreasing page latency by 25%.",
            evidenceIds: [],
          },
        ],
      },
    ],
    projects: [
      {
        id: "proj_fintech",
        title: "FinTech Ledger",
        technologies: ["React", "Python"],
        bullets: ["Built audit-compliant transaction ledger."],
      },
    ],
    education: [
      {
        id: "edu_state",
        institution: "State University",
        degree: "B.S. Software Engineering",
      },
    ],
    achievements: [],
    evidence: [],
    templateConfig: {
      templateId: "classic",
      fontSize: "regular",
      margins: "normal",
    },
    currentVersion: {
      versionId: "ver_master_1",
      versionNumber: 1,
      name: "Initial Master Version",
      createdAt: "2026-02-01T00:00:00.000Z",
    },
    versions: [],
    schemaVersion: "1.0.0",
    isMaster: true,
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-01T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("orchestrates 6A (JobProfile) -> 6B (JobMatchResult) -> 6C (TailoringPlan) -> 6D (TailoredResume) end-to-end", async () => {
    // 1. Mock 6A JobProfile
    const mockJobProfile = {
      _id: jobProfileId,
      userId,
      jobTitle: "Lead Full Stack Architect",
      company: "FinTech Innovations",
      analysisVersion: 1,
    };
    vi.spyOn(JobProfileModel, "findOne").mockResolvedValue(mockJobProfile as any);

    // 2. Mock 6B JobMatchResult
    const mockMatchResult = {
      _id: matchResultId,
      userId,
      jobProfileId,
      sourceProfileVersion: 1,
      jobAnalysisVersion: 1,
    };
    vi.spyOn(JobMatchResultModel, "findOne").mockResolvedValue(mockMatchResult as any);

    // 3. Mock Profile
    const mockProfile = {
      userId,
      profileVersion: 1,
      skills: ["Python", "React", "Django"],
      experience: [
        {
          company: "Company A",
          title: "Software Developer",
          bullets: ["Optimized database queries decreasing page latency by 25%."],
        },
      ],
    };
    vi.spyOn(ProfileModel, "findOne").mockResolvedValue(mockProfile as any);

    // 4. Mock 6C TailoringPlan with:
    // - 1 ACCEPTED proposal (promoting React)
    // - 1 EDITED proposal (bullet update with candidate verified edit)
    // - 1 REJECTED proposal
    // - 1 DO_NOT_ADD proposal (shielding against unsupported AWS claims)
    const planSaveMock = vi.fn().mockResolvedValue(true);
    const mockTailoringPlan: any = {
      _id: tailoringPlanId,
      userId,
      jobProfileId,
      planVersion: 1,
      sourceProfileVersion: 1,
      jobAnalysisVersion: 1,
      jobMatchResultId: matchResultId,
      status: "APPROVED",
      summary: {
        totalProposals: 4,
        actionableTotal: 3,
        pending: 0,
        accepted: 1,
        edited: 1,
        rejected: 1,
        doNotAdd: 1,
      },
      proposals: [
        {
          id: "prop_1",
          action: "PROMOTE",
          target: { section: "SKILLS", field: "skills.list" },
          title: "Promote React",
          currentValue: "React",
          userDecision: "ACCEPTED",
        },
        {
          id: "prop_2",
          action: "REWRITE",
          target: {
            section: "EXPERIENCE",
            field: "experience.bullet",
            entityId: "exp_company_a",
            subEntityId: "b_perf",
          },
          title: "Highlight DB optimization",
          proposedValue: "AI proposed text",
          userDecision: "EDITED",
          userEditedValue: "Engineered database query optimizations decreasing latency by 25%.",
        },
        {
          id: "prop_3",
          action: "REWRITE",
          target: {
            section: "EXPERIENCE",
            field: "experience.bullet",
            entityId: "exp_company_a",
            subEntityId: "b_auth",
          },
          title: "Auth rewrite",
          proposedValue: "Replaced auth rewrite",
          userDecision: "REJECTED",
        },
        {
          id: "prop_4",
          action: "DO_NOT_ADD",
          target: { section: "SKILLS", field: "skills.list" },
          title: "Do not add Kubernetes",
          currentValue: "Kubernetes",
          isProtected: true,
          userDecision: "REJECTED",
        },
      ],
      save: planSaveMock,
    };
    vi.spyOn(TailoringPlanModel, "findOne").mockResolvedValue(mockTailoringPlan);

    // 5. Mock Master Resume
    const masterDocDeepCopy = JSON.parse(JSON.stringify(originalMasterDoc));
    vi.spyOn(ResumeModel, "findOne").mockImplementation(((query: any) => {
      if (query.variantType === "MASTER" || query.isDefault) {
        return Promise.resolve({
          _id: masterResumeId,
          userId,
          title: "Master Resume",
          variantType: "MASTER",
          resumeDocument: masterDocDeepCopy,
          builderConfig: DEFAULT_BUILDER_CONFIG,
        } as any);
      }
      if (query.variantType === "TAILORED") {
        return Promise.resolve(null);
      }
      return Promise.resolve(null);
    }) as any);

    // 6. Mock Resume Creation
    let createdTailoredDoc: any = null;
    vi.spyOn(ResumeModel, "create").mockImplementation(((payload: any) => {
      createdTailoredDoc = payload;
      return Promise.resolve({
        _id: "res_tailored_e2e",
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }) as any);

    // 7. Execute 6D Generation
    const result = await TailoredResumeService.generateTailoredResume(userId, jobProfileId);

    // 8. Assert Complete 6A -> 6D Contract
    expect(result.success).toBe(true);
    expect(result.appliedProposalsCount).toBe(2);
    expect(result.rejectedProposalsCount).toBe(1);
    expect(result.protectedExclusionsCount).toBe(1);

    // Check Tailored Resume Metadata & Variant Identity (Requirement 18)
    expect(createdTailoredDoc.variantType).toBe("TAILORED");
    expect(createdTailoredDoc.parentResumeId).toBe(masterResumeId);
    expect(createdTailoredDoc.targetJobId).toBe(jobProfileId);
    expect(createdTailoredDoc.isDefault).toBe(false);
    expect(createdTailoredDoc.sourceTailoringPlanId).toBe(tailoringPlanId);
    expect(createdTailoredDoc.sourceTailoringPlanVersion).toBe(1);

    // Check Materialized Document Content:
    // - Promoted skill React is at index 0
    expect(createdTailoredDoc.resumeDocument.skills[0].name).toBe("React");
    // - Edited bullet is applied authoritative
    const perfBullet = createdTailoredDoc.resumeDocument.experience[0].bullets.find(
      (b: any) => b.id === "b_perf"
    );
    expect(perfBullet.text).toBe("Engineered database query optimizations decreasing latency by 25%.");
    // - Rejected bullet is UNCHANGED
    const authBullet = createdTailoredDoc.resumeDocument.experience[0].bullets.find(
      (b: any) => b.id === "b_auth"
    );
    expect(authBullet.text).toBe("Implemented authentication flow in Django.");
    // - Protected DO_NOT_ADD (Kubernetes) is absent
    const fullDocString = JSON.stringify(createdTailoredDoc.resumeDocument);
    expect(fullDocString.toLowerCase()).not.toContain("kubernetes");

    // Check Source Records Immutability:
    // - Master resume in memory was NOT mutated
    expect(masterDocDeepCopy.skills[0].name).toBe("Python");
    expect(masterDocDeepCopy.summary.text).toBe(originalMasterDoc.summary.text);

    // Check Status Transition (Requirement 1 & 12)
    // - TailoringPlan is updated to APPLIED only after persistence
    expect(mockTailoringPlan.status).toBe("APPLIED");
    expect(planSaveMock).toHaveBeenCalled();
  });
});
