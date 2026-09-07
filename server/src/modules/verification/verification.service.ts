import crypto from "crypto";
import { VerificationModel, IVerificationRecord, ProficiencyLevelType, VerificationStatusType } from "@/database/models/Verification.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { UserModel } from "@/database/models/User.model";
import { SkillSource } from "@/core/constants/enums";
import { ASSESSMENT_BANK, AssessmentTrack } from "./assessment-bank.data";
import {
  AssessmentCatalogItemDTO,
  AssessmentQuizDTO,
  SubmitAssessmentResponseDTO,
  QuestionEvaluationDTO,
  PublicCredentialDTO,
} from "./verification.dto";

export class VerificationService {
  /**
   * List all available assessment tracks with user verification statuses
   */
  public static async getAssessmentCatalog(userId: string): Promise<AssessmentCatalogItemDTO[]> {
    const records = await VerificationModel.find({ userId }).lean();
    const recordsByTopic = new Map<string, (typeof records)[0]>();
    records.forEach((r) => recordsByTopic.set(r.topicId.toLowerCase(), r));

    return Object.values(ASSESSMENT_BANK).map((track: AssessmentTrack) => {
      const record = recordsByTopic.get(track.id.toLowerCase());
      return {
        id: track.id,
        title: track.title,
        skillName: track.skillName,
        category: track.category,
        description: track.description,
        durationMinutes: track.durationMinutes,
        totalQuestions: track.questions.length,
        passingScore: track.passingScore,
        iconName: track.iconName,
        color: track.color,
        completed: !!record && record.status === "verified",
        lastScore: record ? record.score : null,
        status: record ? record.status : null,
        credentialHash: record ? record.credentialHash : null,
        verifiedDate: record?.issueDate ? record.issueDate.toISOString() : null,
      };
    });
  }

  /**
   * Retrieve quiz questions for an assessment track (without revealing answers)
   */
  public static async getAssessmentQuiz(topicId: string): Promise<AssessmentQuizDTO> {
    const track = ASSESSMENT_BANK[topicId.toLowerCase()];
    if (!track) {
      throw new Error(`Assessment track '${topicId}' not found`);
    }

    return {
      track: {
        id: track.id,
        title: track.title,
        skillName: track.skillName,
        category: track.category,
        durationMinutes: track.durationMinutes,
        totalQuestions: track.questions.length,
        passingScore: track.passingScore,
      },
      questions: track.questions.map((q) => ({
        id: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet,
        options: q.options,
        difficulty: q.difficulty,
      })),
    };
  }

  /**
   * Grade assessment submission, mint cryptographic credential, and auto-sync Profile
   */
  public static async submitAssessment(
    userId: string,
    topicId: string,
    answers: Record<string, number>
  ): Promise<SubmitAssessmentResponseDTO> {
    const track = ASSESSMENT_BANK[topicId.toLowerCase()];
    if (!track) {
      throw new Error(`Assessment track '${topicId}' not found`);
    }

    let correctCount = 0;
    const evaluations: QuestionEvaluationDTO[] = [];

    track.questions.forEach((q) => {
      const selectedIndex = answers[q.id] !== undefined ? answers[q.id] : null;
      const isCorrect = selectedIndex !== null && selectedIndex === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      evaluations.push({
        questionId: q.id,
        question: q.question,
        selectedOption: selectedIndex,
        correctOption: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const totalQuestions = track.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const verified = score >= track.passingScore;
    const status: VerificationStatusType = verified ? "verified" : "failed";

    let proficiency: ProficiencyLevelType = "Beginner";
    let level = 1;
    if (score >= 90) {
      proficiency = "Expert";
      level = 5;
    } else if (score >= 75) {
      proficiency = "Advanced";
      level = 4;
    } else if (score >= 60) {
      proficiency = "Intermediate";
      level = 3;
    } else if (score >= 40) {
      proficiency = "Beginner";
      level = 2;
    }

    // Generate unique SHA-256 cryptographic verification hash
    const rawHashPayload = `${userId}:${track.id}:${score}:${Date.now()}:${crypto.randomBytes(4).toString("hex")}`;
    const shaHash = crypto.createHash("sha256").update(rawHashPayload).digest("hex").slice(0, 16).toUpperCase();
    const credentialHash = `SKZ-CERT-${shaHash}`;
    const issueDate = new Date();

    // Upsert or create verification record
    const existingRecord = await VerificationModel.findOne({ userId, topicId: track.id });
    if (existingRecord) {
      existingRecord.score = score;
      existingRecord.totalQuestions = totalQuestions;
      existingRecord.correctAnswers = correctCount;
      existingRecord.status = status;
      existingRecord.proficiency = proficiency;
      existingRecord.credentialHash = credentialHash;
      existingRecord.issueDate = issueDate;
      existingRecord.details = `Scored ${score}% (${correctCount}/${totalQuestions} correct) on ${track.title}`;
      await existingRecord.save();
    } else {
      await VerificationModel.create({
        userId,
        skillName: track.skillName,
        category: track.category,
        topicId: track.id,
        score,
        totalQuestions,
        correctAnswers: correctCount,
        status,
        proficiency,
        credentialHash,
        issueDate,
        assessor: "SKILLEZO AI Engine v4.2",
        details: `Scored ${score}% (${correctCount}/${totalQuestions} correct) on ${track.title}`,
      });
    }

    // Auto-sync into candidate's Profile.skills
    let profileUpdated = false;
    if (verified) {
      const profile = await ProfileModel.findOne({ userId });
      if (profile) {
        const skillIndex = profile.skills.findIndex(
          (s) => s.name.toLowerCase() === track.skillName.toLowerCase()
        );

        if (skillIndex > -1) {
          profile.skills[skillIndex].verified = true;
          profile.skills[skillIndex].score = Math.max(profile.skills[skillIndex].score || 0, score);
          profile.skills[skillIndex].level = Math.max(profile.skills[skillIndex].level || 1, level);
          profile.skills[skillIndex].proficiency = proficiency;
          profile.skills[skillIndex].source = SkillSource.ASSESSMENT;
        } else {
          profile.skills.push({
            name: track.skillName,
            category: track.category,
            level,
            proficiency,
            score,
            source: SkillSource.ASSESSMENT,
            verified: true,
          });
        }
        await profile.save();
        profileUpdated = true;
      }
    }

    return {
      verified,
      score,
      passingScore: track.passingScore,
      correctAnswers: correctCount,
      totalQuestions,
      proficiency,
      credentialHash,
      issueDate: issueDate.toISOString(),
      skillName: track.skillName,
      category: track.category,
      topicId: track.id,
      evaluations,
      profileUpdated,
    };
  }

  /**
   * Retrieve all verification records for a candidate
   */
  public static async getUserRecords(userId: string): Promise<IVerificationRecord[]> {
    return VerificationModel.find({ userId }).sort({ updatedAt: -1 });
  }

  /**
   * Public validation of a cryptographic credential hash
   */
  public static async getCredentialByHash(credentialHash: string): Promise<PublicCredentialDTO | null> {
    const record = await VerificationModel.findOne({
      credentialHash: credentialHash.trim().toUpperCase(),
    }).lean();

    if (!record) {
      return null;
    }

    let candidateName = "Verified Candidate";
    try {
      const user = await UserModel.findById(record.userId).lean();
      if (user && user.name) {
        candidateName = user.name;
      }
    } catch {
      // Fallback
    }

    return {
      credentialHash: record.credentialHash,
      skillName: record.skillName,
      category: record.category,
      topicId: record.topicId,
      score: record.score,
      proficiency: record.proficiency,
      status: record.status,
      issueDate: record.issueDate.toISOString(),
      assessor: record.assessor,
      candidateName,
      isValid: record.status === "verified",
    };
  }
}
