import { describe, it, expect, vi, beforeEach } from "vitest";
import { VerificationService } from "@/modules/verification/verification.service";
import { ASSESSMENT_BANK } from "@/modules/verification/assessment-bank.data";
import { VerificationModel } from "@/database/models/Verification.model";
import { ProfileModel } from "@/database/models/Profile.model";

vi.mock("@/database/models/Verification.model", () => ({
  VerificationModel: {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/database/models/Profile.model", () => ({
  ProfileModel: {
    findOne: vi.fn(),
  },
}));

vi.mock("@/database/models/User.model", () => ({
  UserModel: {
    findById: vi.fn(),
  },
}));

describe("VerificationService & Assessment Bank (BE-502)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have all 5 core technical assessment tracks loaded in the bank", () => {
    const requiredTracks = ["react", "typescript", "nodejs", "cloud", "python"];
    requiredTracks.forEach((trackId) => {
      const track = ASSESSMENT_BANK[trackId];
      expect(track).toBeDefined();
      expect(track.questions.length).toBeGreaterThanOrEqual(5);
      expect(track.passingScore).toBe(70);
      expect(track.skillName).toBeTruthy();
    });
  });

  it("should return sanitized assessment quiz questions without revealing answers", async () => {
    const quiz = await VerificationService.getAssessmentQuiz("react");
    expect(quiz.track.id).toBe("react");
    expect(quiz.track.skillName).toBe("React");
    expect(quiz.questions.length).toBe(ASSESSMENT_BANK["react"].questions.length);

    // Verify answers & explanations are stripped
    quiz.questions.forEach((q) => {
      expect((q as any).correctOptionIndex).toBeUndefined();
      expect((q as any).explanation).toBeUndefined();
      expect(q.options.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("should throw an error for non-existent assessment track", async () => {
    await expect(VerificationService.getAssessmentQuiz("invalid_track")).rejects.toThrow(
      "Assessment track 'invalid_track' not found"
    );
  });

  it("should evaluate a 100% score correctly and mint a cryptographic credential badge", async () => {
    const track = ASSESSMENT_BANK["typescript"];
    const perfectAnswers: Record<string, number> = {};
    track.questions.forEach((q) => {
      perfectAnswers[q.id] = q.correctOptionIndex;
    });

    (VerificationModel.findOne as any).mockResolvedValue(null);
    (VerificationModel.create as any).mockImplementation((doc: any) => Promise.resolve(doc));

    const mockProfile = {
      skills: [] as any[],
      save: vi.fn().mockResolvedValue(true),
    };
    (ProfileModel.findOne as any).mockResolvedValue(mockProfile);

    const result = await VerificationService.submitAssessment("user_123", "typescript", perfectAnswers);

    expect(result.verified).toBe(true);
    expect(result.score).toBe(100);
    expect(result.correctAnswers).toBe(track.questions.length);
    expect(result.proficiency).toBe("Expert");
    expect(result.credentialHash).toMatch(/^SKZ-CERT-[A-F0-9]{16}$/);
    expect(result.evaluations.length).toBe(track.questions.length);
    expect(result.evaluations.every((e) => e.isCorrect)).toBe(true);
    expect(result.profileUpdated).toBe(true);

    // Profile skill sync validation
    expect(mockProfile.skills.length).toBe(1);
    expect(mockProfile.skills[0].name).toBe("TypeScript");
    expect(mockProfile.skills[0].verified).toBe(true);
    expect(mockProfile.skills[0].score).toBe(100);
    expect(mockProfile.skills[0].level).toBe(5);
    expect(mockProfile.save).toHaveBeenCalled();
  });

  it("should fail validation when score is below passing threshold (70%)", async () => {
    const track = ASSESSMENT_BANK["nodejs"];
    const failingAnswers: Record<string, number> = {};
    track.questions.forEach((q, idx) => {
      // Intentionally pick wrong answers for all except 1
      failingAnswers[q.id] = (q.correctOptionIndex + 1) % q.options.length;
    });

    (VerificationModel.findOne as any).mockResolvedValue(null);
    (VerificationModel.create as any).mockImplementation((doc: any) => Promise.resolve(doc));

    const result = await VerificationService.submitAssessment("user_123", "nodejs", failingAnswers);

    expect(result.verified).toBe(false);
    expect(result.score).toBeLessThan(70);
    expect(result.profileUpdated).toBe(false);
  });
});
