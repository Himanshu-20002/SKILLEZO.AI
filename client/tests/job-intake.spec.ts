import { describe, it, expect, vi, beforeEach } from "vitest";
import { jobProfileService } from "@/services/job-profile.service";
import { JobProfile } from "@/types/job-profile.types";

describe("Phase 6A: Client Job Intake & JD Analysis Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockJobProfile: JobProfile = {
    id: "jp_12345",
    userId: "usr_67890",
    displayName: "Lead Distributed Systems Engineer - Stripe",
    jobTitle: "Lead Distributed Systems Engineer",
    company: "Stripe",
    jobUrl: "https://stripe.com/jobs/123",
    rawDescription:
      "We are hiring a Lead Distributed Systems Engineer. Must have 6+ years of Go or Rust experience. Experience with Raft or Paxos consensus is preferred. Knowledge of PCI-DSS compliance required. Responsibilities include architecting high-throughput payment pipelines.",
    normalizedDescription:
      "We are hiring a Lead Distributed Systems Engineer. Must have 6+ years of Go or Rust experience. Experience with Raft or Paxos consensus is preferred. Knowledge of PCI-DSS compliance required. Responsibilities include architecting high-throughput payment pipelines.",
    sourceHash: "abc123hash",
    jobFingerprint: "fingerprint_xyz",
    analysisStatus: "ANALYZED",
    analysisVersion: 1,
    analysisMetadata: {
      source: "AI",
      provider: "MockGemini",
      model: "gemini-2.0-flash",
      analyzedAt: "2026-09-23T10:00:00.000Z",
    },
    analysis: {
      normalizedRoleTitle: "Lead Distributed Systems Engineer",
      seniority: "LEAD",
      responsibilities: ["Architect high-throughput payment pipelines."],
      requirements: [
        {
          name: "Go / Rust",
          normalizedName: "go / rust",
          category: "SKILL",
          importance: "REQUIRED",
          evidence: {
            text: "Must have 6+ years of Go or Rust experience.",
            section: "Requirements",
          },
          confidence: 0.98,
        },
        {
          name: "Raft / Paxos Consensus",
          normalizedName: "raft / paxos consensus",
          category: "TECHNOLOGY",
          importance: "PREFERRED",
          evidence: {
            text: "Experience with Raft or Paxos consensus is preferred.",
            section: "Nice to Have",
          },
          confidence: 0.92,
        },
        {
          name: "PCI-DSS Compliance",
          normalizedName: "pci-dss compliance",
          category: "DOMAIN",
          importance: "UNKNOWN",
          evidence: {
            text: "Knowledge of PCI-DSS compliance required.",
            section: null,
          },
          confidence: 0.85,
        },
      ],
      experienceRequirements: ["6+ years of Go or Rust experience."],
      educationRequirements: [],
      domain: "FinTech / Distributed Systems",
      location: null,
      employmentType: "Full-Time",
      keywords: ["Go", "Rust", "Distributed Systems", "Raft", "Paxos", "PCI-DSS"],
    },
    createdAt: "2026-09-23T10:00:00.000Z",
    updatedAt: "2026-09-23T10:00:00.000Z",
  };

  it("createAndAnalyze sends payload and returns parsed JobProfile", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockJobProfile }),
    });

    const result = await jobProfileService.createAndAnalyze({
      jobTitle: "Lead Distributed Systems Engineer",
      company: "Stripe",
      jobUrl: "https://stripe.com/jobs/123",
      rawDescription: mockJobProfile.rawDescription,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/analyze"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Lead Distributed Systems Engineer"),
      })
    );
    expect(result.id).toBe("jp_12345");
    expect(result.analysisStatus).toBe("ANALYZED");
    expect(result.analysis?.seniority).toBe("LEAD");
  });

  it("preserves REQUIRED, PREFERRED, and UNKNOWN requirements with grounded citations", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockJobProfile }),
    });

    const result = await jobProfileService.createAndAnalyze({
      jobTitle: "Lead Distributed Systems Engineer",
      rawDescription: mockJobProfile.rawDescription,
    });

    const reqs = result.analysis?.requirements || [];
    expect(reqs).toHaveLength(3);

    const required = reqs.find((r) => r.importance === "REQUIRED");
    expect(required).toBeDefined();
    expect(required?.evidence.text).toContain("Must have 6+ years of Go or Rust experience.");

    const preferred = reqs.find((r) => r.importance === "PREFERRED");
    expect(preferred).toBeDefined();
    expect(preferred?.evidence.text).toContain("Experience with Raft or Paxos");

    // Explicitly verify UNKNOWN is NOT dropped!
    const unknown = reqs.find((r) => r.importance === "UNKNOWN");
    expect(unknown).toBeDefined();
    expect(unknown?.name).toBe("PCI-DSS Compliance");
    expect(unknown?.evidence.text).toContain("PCI-DSS");
  });

  it("reanalyze calls correct re-analysis endpoint", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { ...mockJobProfile, analysisVersion: 2 },
      }),
    });

    const result = await jobProfileService.reanalyze("jp_12345");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/jp_12345/analyze"),
      expect.objectContaining({ method: "POST" })
    );
    expect(result.analysisVersion).toBe(2);
  });

  it("getJobProfile retrieves an individual job profile", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockJobProfile }),
    });

    const result = await jobProfileService.getJobProfile("jp_12345");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/job-profiles/jp_12345"),
      expect.anything()
    );
    expect(result.jobTitle).toBe("Lead Distributed Systems Engineer");
  });
});
