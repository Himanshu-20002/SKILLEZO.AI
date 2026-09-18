import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActionRegistry } from "@/core/ai/actions/action-registry";
import { ActionStateMachine } from "@/core/ai/actions/action-state-machine";
import { ActionExecutor } from "@/core/ai/actions/action-executor";
import {
  ActionTypeEnum,
  ActionStatusEnum,
  ActionProposalDTO,
} from "@/core/ai/actions/action-types";
import {
  CreateActionProposalSchema,
  ResumeUpdatePayloadSchema,
  ProfileUpdatePayloadSchema,
} from "@/core/ai/actions/action-schemas";

describe("Phase 7: AI Action System & Safe Action Execution", () => {
  describe("1. Action Registry & Allowlist", () => {
    it("registers all 3 allowlisted action types", () => {
      const registry = ActionRegistry.getInstance();
      expect(registry.has(ActionTypeEnum.RESUME_UPDATE)).toBe(true);
      expect(registry.has(ActionTypeEnum.PROFILE_UPDATE)).toBe(true);
      expect(registry.has(ActionTypeEnum.CAREER_PLAN_CREATE)).toBe(true);
    });

    it("rejects unknown or arbitrary model-generated action types", () => {
      const registry = ActionRegistry.getInstance();
      expect(() => registry.get("ARBITRARY_DROP_DATABASE")).toThrow();
      expect(() => registry.get("AUTO_APPLY_ALL_JOBS")).toThrow();
    });
  });

  describe("2. Strict Schemas & Anti-Injection Defense", () => {
    it("rejects raw MongoDB operators in proposal payloads", () => {
      const injectionPayload = {
        changes: {
          $set: { "skills.0.name": "Hacked" },
        },
      };

      const result = ProfileUpdatePayloadSchema.safeParse(injectionPayload);
      expect(result.success).toBe(false);
    });

    it("validates safe profile update changes cleanly", () => {
      const safePayload = {
        changes: {
          headline: "Senior Staff Engineer",
          bio: "Passionate about scalable architectures.",
          skills: [{ name: "TypeScript", level: 5, proficiency: "Expert", score: 95 }],
        },
      };

      const result = ProfileUpdatePayloadSchema.safeParse(safePayload);
      expect(result.success).toBe(true);
    });

    it("enforces positive integer baseDocumentVersion for resume updates", () => {
      const invalidResumePayload = {
        resumeId: "res_123",
        sectionId: "experience",
        proposed: { items: [] },
        baseDocumentVersion: -1,
      };

      const result = ResumeUpdatePayloadSchema.safeParse(invalidResumePayload);
      expect(result.success).toBe(false);
    });
  });

  describe("3. Action State Machine & Transition Rules", () => {
    it("allows valid forward state transitions", () => {
      expect(ActionStateMachine.canTransition(ActionStatusEnum.PROPOSED, ActionStatusEnum.APPROVED)).toBe(true);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.PROPOSED, ActionStatusEnum.REJECTED)).toBe(true);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.PROPOSED, ActionStatusEnum.EXPIRED)).toBe(true);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.PROPOSED, ActionStatusEnum.STALE)).toBe(true);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.APPROVED, ActionStatusEnum.EXECUTING)).toBe(true);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.EXECUTING, ActionStatusEnum.COMPLETED)).toBe(true);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.EXECUTING, ActionStatusEnum.FAILED)).toBe(true);
    });

    it("rejects invalid transitions and backwards transitions", () => {
      expect(ActionStateMachine.canTransition(ActionStatusEnum.REJECTED, ActionStatusEnum.APPROVED)).toBe(false);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.COMPLETED, ActionStatusEnum.EXECUTING)).toBe(false);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.EXPIRED, ActionStatusEnum.APPROVED)).toBe(false);
      expect(ActionStateMachine.canTransition(ActionStatusEnum.STALE, ActionStatusEnum.EXECUTING)).toBe(false);

      expect(() => {
        ActionStateMachine.assertTransition(ActionStatusEnum.REJECTED, ActionStatusEnum.APPROVED);
      }).toThrow();
    });

    it("identifies terminal states correctly", () => {
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.COMPLETED)).toBe(true);
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.FAILED)).toBe(true);
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.REJECTED)).toBe(true);
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.EXPIRED)).toBe(true);
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.STALE)).toBe(true);
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.PROPOSED)).toBe(false);
      expect(ActionStateMachine.isTerminal(ActionStatusEnum.APPROVED)).toBe(false);
    });
  });

  describe("4. Ownership, Authorization & Boundary Security", () => {
    let mockRepo: any;
    let executor: ActionExecutor;

    beforeEach(() => {
      mockRepo = {
        create: vi.fn(),
        findByProposalId: vi.fn(),
        findByOwnerId: vi.fn(),
        findByIdempotencyKey: vi.fn(),
        atomicTransitionStatus: vi.fn(),
      };
      executor = new ActionExecutor(mockRepo);
    });

    it("rejects cross-candidate access when candidate does not own proposal", async () => {
      mockRepo.findByProposalId.mockResolvedValue({
        proposalId: "prop_123",
        ownerId: "legitimate_candidate_01",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        expiresAt: new Date(Date.now() + 100000),
        targetEntity: { type: "profile", id: "prof_01" },
        payload: { changes: { headline: "New Headline" } },
      });

      // Attacker tries to get someone else's proposal
      await expect(
        executor.getProposal("malicious_attacker_99", "prop_123")
      ).rejects.toThrow("Candidate is not authorized");
    });

    it("rejects cross-candidate approval of another candidate's proposal", async () => {
      mockRepo.findByProposalId.mockResolvedValue({
        proposalId: "prop_123",
        ownerId: "candidate_alice",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        expiresAt: new Date(Date.now() + 100000),
        targetEntity: { type: "profile", id: "prof_01" },
        payload: { changes: { headline: "New Headline" } },
      });

      await expect(
        executor.approveAndExecute("candidate_bob", "prop_123")
      ).rejects.toThrow("Candidate is not authorized to approve this action proposal");
    });

    it("rejects cross-candidate rejection of another candidate's proposal", async () => {
      mockRepo.findByProposalId.mockResolvedValue({
        proposalId: "prop_123",
        ownerId: "candidate_alice",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        expiresAt: new Date(Date.now() + 100000),
        targetEntity: { type: "profile", id: "prof_01" },
      });

      await expect(
        executor.rejectProposal("candidate_bob", "prop_123")
      ).rejects.toThrow("Candidate is not authorized to reject this action proposal");
    });
  });

  describe("5. Stale Proposal & Expiration Protection", () => {
    let mockRepo: any;
    let executor: ActionExecutor;

    beforeEach(() => {
      mockRepo = {
        create: vi.fn(),
        findByProposalId: vi.fn(),
        findByOwnerId: vi.fn(),
        findByIdempotencyKey: vi.fn(),
        atomicTransitionStatus: vi.fn(),
      };
      executor = new ActionExecutor(mockRepo);
    });

    it("marks and blocks expired proposals from execution", async () => {
      mockRepo.findByProposalId.mockResolvedValue({
        proposalId: "prop_expired_01",
        ownerId: "user_01",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        // Expired 1 hour ago
        expiresAt: new Date(Date.now() - 3600000),
        targetEntity: { type: "profile", id: "prof_01" },
        payload: { changes: { headline: "Old" } },
      });

      await expect(
        executor.approveAndExecute("user_01", "prop_expired_01")
      ).rejects.toThrow("This proposal has expired");

      expect(mockRepo.atomicTransitionStatus).toHaveBeenCalledWith(
        "prop_expired_01",
        ActionStatusEnum.PROPOSED,
        ActionStatusEnum.EXPIRED,
        expect.anything()
      );
    });

    it("detects stale resume proposals when current document version is newer than base version", async () => {
      const resumeUpdateExecutor = ActionRegistry.getInstance().get(ActionTypeEnum.RESUME_UPDATE).executor;

      // Mock repository returning resume with version 5
      const mockResumeRepo: any = {
        findById: vi.fn().mockResolvedValue({
          _id: "res_01",
          userId: "user_01",
          version: 5,
        }),
      };

      (resumeUpdateExecutor as any).resumeRepository = mockResumeRepo;

      const proposal: ActionProposalDTO = {
        proposalId: "prop_stale_res",
        ownerId: "user_01",
        actionType: ActionTypeEnum.RESUME_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        title: "Update Experience",
        description: "Test",
        rationale: "Test",
        evidenceIds: [],
        targetEntity: { type: "resume", id: "res_01", version: 4 }, // Base version is 4, but current is 5
        preview: { before: "Old", after: "New" },
        payload: { resumeId: "res_01", baseDocumentVersion: 4 },
        expiresAt: new Date(Date.now() + 100000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const staleCheck = await resumeUpdateExecutor.checkStale(proposal);
      expect(staleCheck.isStale).toBe(true);
      expect(staleCheck.reason).toContain("Resume has been modified since proposal was created");
    });
  });

  describe("6. Idempotency & Concurrency Protection", () => {
    let mockRepo: any;
    let executor: ActionExecutor;

    beforeEach(() => {
      mockRepo = {
        create: vi.fn(),
        findByProposalId: vi.fn(),
        findByOwnerId: vi.fn(),
        findByIdempotencyKey: vi.fn(),
        atomicTransitionStatus: vi.fn(),
      };
      executor = new ActionExecutor(mockRepo);
    });

    it("returns existing completed result without re-executing if already COMPLETED", async () => {
      const cachedResult = {
        proposalId: "prop_completed_01",
        status: "COMPLETED",
        summary: "Already finished",
        affectedEntity: { type: "profile", id: "prof_01" },
        verification: { verified: true },
        executedAt: "2026-09-18T12:00:00.000Z",
      };

      mockRepo.findByProposalId.mockResolvedValue({
        proposalId: "prop_completed_01",
        ownerId: "user_01",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.COMPLETED,
        expiresAt: new Date(Date.now() + 100000),
        result: cachedResult,
      });

      const result = await executor.approveAndExecute("user_01", "prop_completed_01");
      expect(result).toEqual(cachedResult);
      // Ensure no state transitions or double execution were called
      expect(mockRepo.atomicTransitionStatus).not.toHaveBeenCalled();
    });

    it("returns existing proposal when same idempotencyKey is supplied on creation", async () => {
      const existingDoc = {
        proposalId: "prop_idempotent_01",
        ownerId: "user_01",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        title: "Test",
        description: "Test",
        rationale: "Test",
        evidenceIds: [],
        targetEntity: { type: "profile", id: "prof_01" },
        preview: { before: null, after: null },
        payload: { changes: { headline: "Engineer" } },
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.findByIdempotencyKey.mockResolvedValue(existingDoc);

      const proposal = await executor.createProposal("user_01", {
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        title: "Test",
        description: "Test",
        rationale: "Test",
        evidenceIds: [],
        targetEntity: { type: "profile", id: "prof_01" },
        preview: { before: null, after: null },
        payload: { changes: { headline: "Engineer" } },
        idempotencyKey: "unique_client_key_123",
      });

      expect(proposal.proposalId).toBe("prop_idempotent_01");
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("7. Deterministic Execution & Read-back Verification", () => {
    let mockRepo: any;
    let executor: ActionExecutor;

    beforeEach(() => {
      mockRepo = {
        create: vi.fn(),
        findByProposalId: vi.fn(),
        findByOwnerId: vi.fn(),
        findByIdempotencyKey: vi.fn(),
        atomicTransitionStatus: vi.fn(),
      };
      executor = new ActionExecutor(mockRepo);
    });

    it("successfully coordinates approval, deterministic execution, and read-back verification", async () => {
      const proposalDoc = {
        proposalId: "prop_valid_01",
        ownerId: "user_01",
        actionType: ActionTypeEnum.PROFILE_UPDATE,
        status: ActionStatusEnum.PROPOSED,
        title: "Update Headline",
        description: "Update candidate headline",
        rationale: "Improves recruiter visibility",
        evidenceIds: ["ev_profile_01"],
        targetEntity: { type: "profile", id: "prof_01" },
        preview: { before: "Old", after: "New" },
        payload: { changes: { headline: "Staff Systems Engineer" } },
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.findByProposalId.mockResolvedValue(proposalDoc);
      mockRepo.atomicTransitionStatus.mockResolvedValue(proposalDoc);

      const profileExecutor = ActionRegistry.getInstance().get(ActionTypeEnum.PROFILE_UPDATE).executor;
      const mockProfileRepo: any = {
        findByUserId: vi.fn().mockResolvedValue({ _id: "prof_01", userId: "user_01" }),
      };
      (profileExecutor as any).profileRepository = mockProfileRepo;

      const mockProfileService: any = {
        updateProfile: vi.fn().mockResolvedValue({
          _id: "prof_01",
          headline: "Staff Systems Engineer",
          completionPercentage: 92,
        }),
      };
      (profileExecutor as any).profileService = mockProfileService;

      const result = await executor.approveAndExecute("user_01", "prop_valid_01");

      expect(result.status).toBe("COMPLETED");
      expect(result.affectedEntity.id).toBe("prof_01");
      expect(result.verification.verified).toBe(true);
      expect(result.verification.metrics).toEqual([
        { metric: "Profile Completion", value: 92 },
      ]);
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith("user_01", {
        headline: "Staff Systems Engineer",
      });
    });
  });
});
