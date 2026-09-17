import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContextComposer } from "@/core/ai/context/context-composer";
import { CandidateContextCache, candidateContextCache } from "@/core/ai/context/context-cache";
import { CandidateContextService } from "@/core/ai/context/candidate-context.service";
import { CandidateEvidenceBundle } from "@/core/ai/evidence/types";
import { EvidenceBundleService } from "@/core/ai/evidence/evidence-bundle";
import { EvidenceOwnershipError } from "@/core/ai/evidence/evidence-errors";
import { ProfileModel } from "@/database/models/Profile.model";
import { ResumeModel } from "@/database/models/Resume.model";

describe("Phase 2: Candidate Context Snapshot & Caching Unit Tests", () => {
  const mockEvidenceBundle: CandidateEvidenceBundle = {
    candidateId: "cand_test_1",
    targetRole: "Full-Stack Engineer",
    verifiedAt: new Date("2026-09-17T12:00:00.000Z"),
    items: [
      {
        id: "ev_1",
        sourceEngine: "SkillGapEngine",
        sourceEntity: "SkillGapAnalysis",
        metric: "skillGapMatchScore",
        value: 85,
        evidenceType: "DETERMINISTIC",
        verificationStatus: "VERIFIED",
        extractedAt: new Date("2026-09-17T12:00:00.000Z"),
      },
      {
        id: "ev_2",
        sourceEngine: "ResumeAtsEngine",
        sourceEntity: "Resume",
        metric: "atsCompatibilityScore",
        value: 90,
        evidenceType: "DETERMINISTIC",
        verificationStatus: "VERIFIED",
        extractedAt: new Date("2026-09-17T12:00:00.000Z"),
      },
    ],
    stats: {
      total: 2,
      deterministicCount: 2,
      extractedCount: 0,
      reviewRequiredCount: 0,
    },
  };

  const mockProfile = {
    _id: "prof_test_1",
    userId: "cand_test_1",
    headline: "Senior Software Engineer",
    bio: "Passionate engineer",
    skills: [{ name: "TypeScript" }, { name: "React" }],
    projects: [{ title: "App 1" }, { title: "App 2" }],
    location: { city: "San Francisco", country: "USA" },
  };

  const mockResume = {
    _id: "res_test_1",
    userId: "cand_test_1",
    title: "Primary Resume",
    atsScore: 90,
    isDefault: true,
    extractedData: { skills: ["TypeScript", "React", "Node.js"] },
  };

  beforeEach(() => {
    candidateContextCache.clear();
    vi.restoreAllMocks();
  });

  describe("Context Composer", () => {
    it("composes serializable CandidateContextSnapshot with version v1", () => {
      const snapshot = ContextComposer.compose({
        candidateId: "cand_test_1",
        targetRole: "Full-Stack Engineer",
        profile: mockProfile,
        resume: mockResume,
        evidenceBundle: mockEvidenceBundle,
        generationLatencyMs: 42,
      });

      expect(snapshot.version).toBe("v1");
      expect(snapshot.candidateId).toBe("cand_test_1");
      expect(snapshot.targetRole).toBe("Full-Stack Engineer");
      expect(snapshot.profile?.headline).toBe("Senior Software Engineer");
      expect(snapshot.resume?.atsScore).toBe(90);
      expect(snapshot.evidence.items).toHaveLength(2);
      expect(snapshot.metadata.evidenceCount).toBe(2);
      expect(snapshot.metadata.sourceCount).toBe(2);
      expect(snapshot.metadata.generationLatencyMs).toBe(42);
      expect(snapshot.metadata.byteSize).toBeGreaterThan(0);
      expect(snapshot.metadata.snapshotHash).toBeDefined();
    });

    it("generates deterministic SHA-256 hash invariant to object key order", () => {
      const hash1 = ContextComposer.calculateDeterministicHash({
        candidateId: "cand_1",
        role: "Engineer",
        skills: ["React", "TypeScript"],
      });

      const hash2 = ContextComposer.calculateDeterministicHash({
        skills: ["React", "TypeScript"],
        role: "Engineer",
        candidateId: "cand_1",
      });

      expect(hash1).toBe(hash2);
    });
  });

  describe("Candidate Context Cache", () => {
    it("returns null on cache miss and increments telemetry miss count", async () => {
      const result = await candidateContextCache.get("cand_unknown", "Full-Stack Engineer");
      expect(result).toBeNull();

      const telemetry = candidateContextCache.getTelemetry();
      expect(telemetry.misses).toBe(1);
      expect(telemetry.hits).toBe(0);
    });

    it("stores and retrieves snapshot on cache hit, incrementing hit count", async () => {
      const snapshot = ContextComposer.compose({
        candidateId: "cand_test_1",
        targetRole: "Full-Stack Engineer",
        profile: mockProfile,
        resume: mockResume,
        evidenceBundle: mockEvidenceBundle,
      });

      await candidateContextCache.set("cand_test_1", snapshot, 60);

      const cached = await candidateContextCache.get("cand_test_1", "Full-Stack Engineer");
      expect(cached).not.toBeNull();
      expect(cached?.candidateId).toBe("cand_test_1");
      expect(cached?.metadata.snapshotHash).toBe(snapshot.metadata.snapshotHash);

      const telemetry = candidateContextCache.getTelemetry();
      expect(telemetry.hits).toBe(1);
    });

    it("prevents collision between different candidates and different target roles", async () => {
      const snapshot1 = ContextComposer.compose({
        candidateId: "user_a",
        targetRole: "Frontend Engineer",
        evidenceBundle: mockEvidenceBundle,
      });
      const snapshot2 = ContextComposer.compose({
        candidateId: "user_b",
        targetRole: "Frontend Engineer",
        evidenceBundle: mockEvidenceBundle,
      });
      const snapshot3 = ContextComposer.compose({
        candidateId: "user_a",
        targetRole: "Backend Engineer",
        evidenceBundle: mockEvidenceBundle,
      });

      await candidateContextCache.set("user_a", snapshot1);
      await candidateContextCache.set("user_b", snapshot2);
      await candidateContextCache.set("user_a", snapshot3);

      const resA_Frontend = await candidateContextCache.get("user_a", "Frontend Engineer");
      const resB_Frontend = await candidateContextCache.get("user_b", "Frontend Engineer");
      const resA_Backend = await candidateContextCache.get("user_a", "Backend Engineer");

      expect(resA_Frontend?.targetRole).toBe("Frontend Engineer");
      expect(resA_Frontend?.candidateId).toBe("user_a");

      expect(resB_Frontend?.targetRole).toBe("Frontend Engineer");
      expect(resB_Frontend?.candidateId).toBe("user_b");

      expect(resA_Backend?.targetRole).toBe("Backend Engineer");
      expect(resA_Backend?.candidateId).toBe("user_a");
    });

    it("invalidates all target roles for a specific candidate on mutation", async () => {
      const snap1 = ContextComposer.compose({
        candidateId: "user_mutating",
        targetRole: "Role1",
        evidenceBundle: mockEvidenceBundle,
      });
      const snap2 = ContextComposer.compose({
        candidateId: "user_mutating",
        targetRole: "Role2",
        evidenceBundle: mockEvidenceBundle,
      });
      const snapOther = ContextComposer.compose({
        candidateId: "user_untouched",
        targetRole: "Role1",
        evidenceBundle: mockEvidenceBundle,
      });

      await candidateContextCache.set("user_mutating", snap1);
      await candidateContextCache.set("user_mutating", snap2);
      await candidateContextCache.set("user_untouched", snapOther);

      const invalidatedCount = await candidateContextCache.invalidate("user_mutating");
      expect(invalidatedCount).toBe(2);

      expect(await candidateContextCache.get("user_mutating", "Role1")).toBeNull();
      expect(await candidateContextCache.get("user_mutating", "Role2")).toBeNull();
      expect(await candidateContextCache.get("user_untouched", "Role1")).not.toBeNull();
    });

    it("expires entries after TTL expiration", async () => {
      const snapshot = ContextComposer.compose({
        candidateId: "cand_expiring",
        targetRole: "Engineer",
        evidenceBundle: mockEvidenceBundle,
      });

      // Set TTL to 1 millisecond by passing 0.001 seconds (effective Math.max(1) in seconds, or mock Date.now)
      await candidateContextCache.set("cand_expiring", snapshot, 1);

      // Fast-forward Date.now
      const originalNow = Date.now;
      try {
        Date.now = () => originalNow() + 2000; // 2 seconds later
        const expired = await candidateContextCache.get("cand_expiring", "Engineer");
        expect(expired).toBeNull();
      } finally {
        Date.now = originalNow;
      }
    });
  });

  describe("CandidateContextService", () => {
    it("enforces candidate identity ownership (rejects missing/empty userId)", async () => {
      await expect(
        CandidateContextService.getContextSnapshot({ userId: "" })
      ).rejects.toThrow(EvidenceOwnershipError);

      await expect(
        CandidateContextService.invalidateCandidateContext("")
      ).rejects.toThrow(EvidenceOwnershipError);
    });

    it("reuses cached snapshot on subsequent calls and avoids redundant generation", async () => {
      vi.spyOn(ProfileModel, "findOne").mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockProfile),
      } as any);

      vi.spyOn(ResumeModel, "findOne").mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockResume),
      } as any);

      const buildEvidenceSpy = vi
        .spyOn(EvidenceBundleService, "buildCandidateEvidence")
        .mockResolvedValue(mockEvidenceBundle);

      // Call 1: Cache Miss
      const snapshot1 = await CandidateContextService.getContextSnapshot({
        userId: "cand_test_1",
        targetRole: "Full-Stack Engineer",
      });

      expect(snapshot1).toBeDefined();
      expect(buildEvidenceSpy).toHaveBeenCalledTimes(1);

      // Call 2: Cache Hit
      const snapshot2 = await CandidateContextService.getContextSnapshot({
        userId: "cand_test_1",
        targetRole: "Full-Stack Engineer",
      });

      expect(snapshot2).toBeDefined();
      expect(snapshot2.metadata.snapshotHash).toBe(snapshot1.metadata.snapshotHash);
      // Evidence service should NOT have been called again on cache hit!
      expect(buildEvidenceSpy).toHaveBeenCalledTimes(1);

      const telemetry = CandidateContextService.getTelemetry();
      expect(telemetry.hits).toBe(1);
      expect(telemetry.misses).toBe(1);
      expect(telemetry.hitRate).toBe(0.5);
    });

    it("regenerates snapshot when forceRefresh is true", async () => {
      vi.spyOn(ProfileModel, "findOne").mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockProfile),
      } as any);

      vi.spyOn(ResumeModel, "findOne").mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockResume),
      } as any);

      const buildEvidenceSpy = vi
        .spyOn(EvidenceBundleService, "buildCandidateEvidence")
        .mockResolvedValue(mockEvidenceBundle);

      await CandidateContextService.getContextSnapshot({
        userId: "cand_test_1",
        targetRole: "Full-Stack Engineer",
      });
      expect(buildEvidenceSpy).toHaveBeenCalledTimes(1);

      // Call with forceRefresh = true
      await CandidateContextService.getContextSnapshot({
        userId: "cand_test_1",
        targetRole: "Full-Stack Engineer",
        forceRefresh: true,
      });
      expect(buildEvidenceSpy).toHaveBeenCalledTimes(2);
    });
  });
});
