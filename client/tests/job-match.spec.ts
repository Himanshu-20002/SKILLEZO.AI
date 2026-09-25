import { describe, it, expect, vi, beforeEach } from "vitest";
import { jobMatchService } from "@/services/job-match.service";
import { JobMatchResultDTO } from "@/types/job-match.types";

describe("Phase 6B: Client Career ↔ Job Evidence Match Test Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockMatchResult: JobMatchResultDTO = {
    id: "jmr_12345",
    userId: "user_test_123",
    jobProfileId: "jp_67890",
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    isStale: false,
    requirementMatches: [
      {
        requirementId: "req_0",
        name: "React",
        normalizedName: "react",
        category: "SKILL",
        importance: "REQUIRED",
        matchState: "PROVEN_RELEVANT",
        evidence: [
          {
            sourceType: "SKILL",
            sourceId: "React",
            label: "Skill: React",
            excerpt: "Proficiency level: 4/5",
          },
          {
            sourceType: "PROJECT",
            sourceId: "EVENTO",
            label: "Project: EVENTO",
            excerpt: "Built React web application",
          },
        ],
        confidence: 0.98,
        explanation: "Verified across 2 authentic Career Profile sources.",
      },
      {
        requirementId: "req_1",
        name: "GraphQL Architecture",
        normalizedName: "graphql architecture",
        category: "TECHNOLOGY",
        importance: "UNKNOWN",
        matchState: "PROVEN_UNDERREPRESENTED",
        evidence: [
          {
            sourceType: "PROJECT",
            sourceId: "EVENTO",
            label: "Project: EVENTO",
            excerpt: "Designed GraphQL schema",
          },
        ],
        confidence: 0.95,
        explanation: "Verified in your Career Profile, but not prominently showcased in your current Master Resume.",
      },
      {
        requirementId: "req_2",
        name: "Docker",
        normalizedName: "docker",
        category: "TOOL",
        importance: "PREFERRED",
        matchState: "RELATED_EVIDENCE",
        evidence: [
          {
            sourceType: "SKILL",
            sourceId: "Kubernetes",
            label: "Related Skill: Kubernetes",
            excerpt: "Candidate possesses related competency. Note: Does not prove Docker.",
          },
        ],
        confidence: 0.85,
        explanation: "Related technology experience (Kubernetes) found in your Career Profile. ⚠ Does not prove Docker.",
      },
      {
        requirementId: "req_3",
        name: "AWS",
        normalizedName: "aws",
        category: "TECHNOLOGY",
        importance: "REQUIRED",
        matchState: "MISSING",
        evidence: [],
        confidence: 1.0,
        explanation: "No verified evidence found in your Career Profile. SKILLEZO will not add this claim.",
      },
      {
        requirementId: "req_4",
        name: "5+ years experience",
        normalizedName: "5+ years experience",
        category: "EXPERIENCE",
        importance: "REQUIRED",
        matchState: "INSUFFICIENT_EVIDENCE",
        evidence: [
          {
            sourceType: "EXPERIENCE",
            sourceId: "Startup",
            label: "Developer at Startup",
            excerpt: "Dates are incomplete in Career Profile.",
          },
        ],
        confidence: 0.75,
        explanation: "Candidate has professional experience records, but dates are incomplete or missing to safely establish duration.",
      },
    ],
    summary: {
      totalRequirements: 5,
      proven: 1,
      underrepresented: 1,
      partial: 0,
      related: 1,
      missing: 1,
      insufficient: 1,
      needsReview: 0,
      requiredTotal: 3,
      requiredProven: 1,
    },
    overallMatch: {
      score: 65,
      label: "Moderate Match",
    },
    createdAt: "2026-09-23T11:00:00.000Z",
    updatedAt: "2026-09-23T11:00:00.000Z",
  };

  it("runJobMatch triggers matching endpoint and returns parsed MatchResult", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockMatchResult }),
    });

    const result = await jobMatchService.runJobMatch("jp_67890");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/jp_67890/match"),
      expect.objectContaining({ method: "POST" })
    );
    expect(result.id).toBe("jmr_12345");
    expect(result.summary.requiredTotal).toBe(3);
    expect(result.summary.requiredProven).toBe(1);
  });

  it("getJobMatch fetches existing match result with isStale status", async () => {
    const staleResult = { ...mockMatchResult, isStale: true };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: staleResult }),
    });

    const result = await jobMatchService.getJobMatch("jp_67890");

    expect(result.isStale).toBe(true);
    expect(result.summary.proven).toBe(1);
    expect(result.summary.underrepresented).toBe(1);
  });

  it("preserves UNKNOWN importance from Phase 6A without alteration", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockMatchResult }),
    });

    const result = await jobMatchService.runJobMatch("jp_67890");
    const unknownItem = result.requirementMatches.find((m) => m.name === "GraphQL Architecture");

    expect(unknownItem).toBeDefined();
    expect(unknownItem?.importance).toBe("UNKNOWN");
    expect(unknownItem?.matchState).toBe("PROVEN_UNDERREPRESENTED");
  });

  it("enforces boundary warning for RELATED_EVIDENCE and explicit disclaimer for MISSING", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockMatchResult }),
    });

    const result = await jobMatchService.runJobMatch("jp_67890");

    const related = result.requirementMatches.find((m) => m.name === "Docker");
    expect(related?.matchState).toBe("RELATED_EVIDENCE");
    expect(related?.explanation).toContain("Does not prove Docker");

    const missing = result.requirementMatches.find((m) => m.name === "AWS");
    expect(missing?.matchState).toBe("MISSING");
    expect(missing?.evidence).toHaveLength(0);
    expect(missing?.explanation).toContain("SKILLEZO will not add this claim");
  });
});
