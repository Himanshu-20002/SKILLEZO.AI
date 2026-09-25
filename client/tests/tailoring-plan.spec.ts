import { describe, it, expect, vi, beforeEach } from "vitest";
import { tailoringPlanService } from "@/services/tailoring-plan.service";
import { TailoringPlanDTO } from "@/types/tailoring-plan.types";

describe("Phase 6C: Client Tailoring Plan & User Approval Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockPlan: TailoringPlanDTO = {
    id: "plan_12345",
    userId: "usr_test_123",
    jobProfileId: "jp_67890",
    sourceProfileVersion: 2,
    jobAnalysisVersion: 2,
    intensity: "BALANCED",
    status: "DRAFT",
    planVersion: 1,
    isStale: false,
    proposals: [
      {
        id: "prop_1",
        action: "PROMOTE",
        target: { section: "SKILLS", field: "skills.list" },
        title: "Promote Underrepresented Skills: Next.js",
        currentValue: "Not in technical skills",
        proposedValue: "Add Next.js",
        reason: "Required for target role and verified in Career Profile.",
        requirementIds: ["req_nextjs"],
        evidence: [
          {
            sourceType: "PROJECT",
            sourceId: "proj_1",
            label: "EVENTO",
            excerpt: "Built with Next.js App Router",
          },
        ],
        confidence: 0.95,
        priority: "HIGH",
        userDecision: "PENDING",
        isProtected: false,
        createdAt: "2026-09-24T10:00:00.000Z",
        updatedAt: "2026-09-24T10:00:00.000Z",
      },
      {
        id: "prop_2",
        action: "DO_NOT_ADD",
        target: { section: "SKILLS", field: "skills.list" },
        title: 'Protected Exclusion: Do Not Add "AWS"',
        currentValue: null,
        proposedValue: null,
        reason: "No verified evidence found in your Career Profile. SKILLEZO will not add this claim.",
        requirementIds: ["req_aws"],
        evidence: [],
        confidence: 1.0,
        priority: "HIGH",
        userDecision: "ACCEPTED",
        isProtected: true,
        createdAt: "2026-09-24T10:00:00.000Z",
        updatedAt: "2026-09-24T10:00:00.000Z",
      },
      {
        id: "prop_3",
        action: "REWRITE",
        target: { section: "SUMMARY", field: "summary.text" },
        title: "Tailor Professional Summary",
        currentValue: "Software engineer building web apps.",
        proposedValue: "Full Stack Engineer with proven expertise in React and Next.js.",
        reason: "Highlights verified capabilities matching target requirements.",
        requirementIds: ["req_react", "req_nextjs"],
        evidence: [],
        confidence: 0.9,
        priority: "HIGH",
        userDecision: "PENDING",
        isProtected: false,
        createdAt: "2026-09-24T10:00:00.000Z",
        updatedAt: "2026-09-24T10:00:00.000Z",
      },
    ],
    summary: {
      totalProposals: 3,
      pendingCount: 2,
      acceptedCount: 1, // DO_NOT_ADD is system-accepted
      rejectedCount: 0,
      editedCount: 0,
      protectedCount: 1,
      actionBreakdown: { PROMOTE: 1, DO_NOT_ADD: 1, REWRITE: 1 },
      sectionBreakdown: { SKILLS: 2, SUMMARY: 1 },
    },
    createdAt: "2026-09-24T10:00:00.000Z",
    updatedAt: "2026-09-24T10:00:00.000Z",
  };

  it("fetches or creates tailoring plan successfully", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockPlan }),
    } as Response);

    const plan = await tailoringPlanService.createOrGetPlan("jp_67890", "BALANCED");

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/jp_67890/tailoring-plan"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ intensity: "BALANCED" }),
      })
    );
    expect(plan.id).toBe("plan_12345");
    expect(plan.intensity).toBe("BALANCED");
    expect(plan.proposals.length).toBe(3);
  });

  it("updates individual proposal decision to ACCEPTED", async () => {
    const updatedPlan: TailoringPlanDTO = {
      ...mockPlan,
      proposals: mockPlan.proposals.map((p) =>
        p.id === "prop_1" ? { ...p, userDecision: "ACCEPTED" } : p
      ),
      summary: {
        ...mockPlan.summary,
        pendingCount: 1,
        acceptedCount: 2,
      },
    };

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: updatedPlan }),
    } as Response);

    const result = await tailoringPlanService.updateDecision("jp_67890", "prop_1", {
      decision: "ACCEPTED",
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/jp_67890/tailoring-plan/proposals/prop_1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ decision: "ACCEPTED" }),
      })
    );
    expect(result.summary.acceptedCount).toBe(2);
    expect(result.summary.pendingCount).toBe(1);
  });

  it("updates individual proposal decision with custom user edit (EDITED)", async () => {
    const customText = "Lead Engineer specializing in React, Next.js, and distributed apps.";
    const updatedPlan: TailoringPlanDTO = {
      ...mockPlan,
      proposals: mockPlan.proposals.map((p) =>
        p.id === "prop_3"
          ? { ...p, userDecision: "EDITED", userEditedValue: customText }
          : p
      ),
      summary: {
        ...mockPlan.summary,
        pendingCount: 1,
        editedCount: 1,
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: updatedPlan }),
    } as Response);

    const result = await tailoringPlanService.updateDecision("jp_67890", "prop_3", {
      decision: "EDITED",
      editedValue: customText,
    });

    expect(result.summary.editedCount).toBe(1);
    const editedProp = result.proposals.find((p) => p.id === "prop_3");
    expect(editedProp?.userDecision).toBe("EDITED");
    expect(editedProp?.userEditedValue).toBe(customText);
  });

  it("batch updates multiple proposals", async () => {
    const updatedPlan: TailoringPlanDTO = {
      ...mockPlan,
      proposals: mockPlan.proposals.map((p) =>
        !p.isProtected ? { ...p, userDecision: "ACCEPTED" } : p
      ),
      summary: {
        ...mockPlan.summary,
        pendingCount: 0,
        acceptedCount: 3,
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: updatedPlan }),
    } as Response);

    const result = await tailoringPlanService.batchUpdateDecisions("jp_67890", {
      decisions: [
        { proposalId: "prop_1", decision: "ACCEPTED" },
        { proposalId: "prop_3", decision: "ACCEPTED" },
      ],
    });

    expect(result.summary.pendingCount).toBe(0);
    expect(result.summary.acceptedCount).toBe(3);
  });

  it("regenerates tailoring plan with specified intensity and force flag", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: { ...mockPlan, intensity: "AGGRESSIVE", planVersion: 2 },
      }),
    } as Response);

    const result = await tailoringPlanService.regeneratePlan("jp_67890", "AGGRESSIVE", true);

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/jp_67890/tailoring-plan/regenerate"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ intensity: "AGGRESSIVE", force: true }),
      })
    );
    expect(result.intensity).toBe("AGGRESSIVE");
    expect(result.planVersion).toBe(2);
  });

  it("preserves DO_NOT_ADD proposal as protected anti-hallucination shield", () => {
    const doNotAddProposal = mockPlan.proposals.find((p) => p.action === "DO_NOT_ADD");
    expect(doNotAddProposal).toBeDefined();
    expect(doNotAddProposal?.isProtected).toBe(true);
    expect(doNotAddProposal?.userDecision).toBe("ACCEPTED");
    expect(doNotAddProposal?.reason).toContain("SKILLEZO will not add this claim");
  });
});
