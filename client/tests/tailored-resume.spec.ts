import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  tailoredResumeService,
  TailoredResumeGenerationResultDTO,
  TailoredResumeMetadataDTO,
} from "@/services/tailored-resume.service";

describe("Phase 6D: Client Tailored Resume Generation & Service Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockResumeMetadata: TailoredResumeMetadataDTO = {
    id: "res_tailored_123",
    title: "Tailored — Senior Frontend Engineer @ Stripe",
    variantType: "TAILORED",
    parentResumeId: "res_master_789",
    targetJobId: "jp_stripe_456",
    targetJobTitle: "Senior Frontend Engineer",
    targetCompany: "Stripe",
    version: 1,
    sourceTailoringPlanId: "plan_stripe_001",
    sourceTailoringPlanVersion: 1,
    sourceProfileVersion: 2,
    createdAt: "2026-09-24T12:00:00.000Z",
    updatedAt: "2026-09-24T12:00:00.000Z",
    studioUrl: "/dashboard/resume-studio?resumeId=res_tailored_123",
  };

  const mockGenerationResult: TailoredResumeGenerationResultDTO = {
    success: true,
    resume: mockResumeMetadata,
    appliedProposalsCount: 3,
    rejectedProposalsCount: 1,
    protectedExclusionsCount: 1,
    studioUrl: "/dashboard/resume-studio?resumeId=res_tailored_123",
  };

  describe("1. Generate Tailored Resume API Calls", () => {
    it("calls POST /api/job-profiles/:id/tailoring-plan/generate with force=false by default", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockGenerationResult }),
      } as Response);

      const result = await tailoredResumeService.generateTailoredResume("jp_stripe_456", false);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/job-profiles/jp_stripe_456/tailoring-plan/generate"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ force: false }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.resume.variantType).toBe("TAILORED");
      expect(result.resume.parentResumeId).toBe("res_master_789");
      expect(result.resume.targetJobId).toBe("jp_stripe_456");
      expect(result.appliedProposalsCount).toBe(3);
      expect(result.rejectedProposalsCount).toBe(1);
      expect(result.protectedExclusionsCount).toBe(1);
      expect(result.studioUrl).toBe("/dashboard/resume-studio?resumeId=res_tailored_123");
    });

    it("calls POST /api/job-profiles/:id/tailoring-plan/generate with force=true when confirming overwrite", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            ...mockGenerationResult,
            resume: { ...mockResumeMetadata, version: 2 },
          },
        }),
      } as Response);

      const result = await tailoredResumeService.generateTailoredResume("jp_stripe_456", true);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/job-profiles/jp_stripe_456/tailoring-plan/generate"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ force: true }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.resume.version).toBe(2);
    });
  });

  describe("2. Get Tailored Resume Metadata API Calls", () => {
    it("calls GET /api/job-profiles/:id/tailored-resume and retrieves metadata", async () => {
      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { tailoredResume: mockResumeMetadata },
        }),
      } as Response);

      const data = await tailoredResumeService.getTailoredResume("jp_stripe_456");

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/job-profiles/jp_stripe_456/tailored-resume"),
        expect.anything()
      );
      expect(data).not.toBeNull();
      expect(data?.id).toBe("res_tailored_123");
      expect(data?.variantType).toBe("TAILORED");
      expect(data?.targetJobId).toBe("jp_stripe_456");
      expect(data?.targetCompany).toBe("Stripe");
    });

    it("returns null when no tailored resume variant exists for the job profile", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { tailoredResume: null },
        }),
      } as Response);

      const data = await tailoredResumeService.getTailoredResume("jp_stripe_nonexistent");
      expect(data).toBeNull();
    });
  });

  describe("3. Error Propagation and Structured Error Handling", () => {
    it("propagates structured conflict error when EXISTING_TAILORED_RESUME_EDITED is returned", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: "An existing tailored resume for this job already contains manual customizations.",
          code: "EXISTING_TAILORED_RESUME_EDITED",
          details: { requiresForce: true },
        }),
      } as Response);

      await expect(
        tailoredResumeService.generateTailoredResume("jp_stripe_456", false)
      ).rejects.toThrow();
    });

    it("propagates staleness error when TAILORING_PLAN_STALE is returned", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: "Candidate profile has updated since tailoring plan was created.",
          code: "TAILORING_PLAN_STALE",
        }),
      } as Response);

      await expect(
        tailoredResumeService.generateTailoredResume("jp_stripe_456", false)
      ).rejects.toThrow();
    });
  });
});
