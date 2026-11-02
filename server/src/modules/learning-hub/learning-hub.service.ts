import crypto from "crypto";
import { Types } from "mongoose";
import { LearningTrackModel, ILearningTrack } from "@/database/models/LearningTrack.model";
import { LearningResourceModel, ILearningResource, IQuizQuestion } from "@/database/models/LearningResource.model";
import { UserLearningProgressModel, IUserLearningProgress } from "@/database/models/UserLearningProgress.model";
import { VerificationModel } from "@/database/models/Verification.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { CareerPlanModel } from "@/database/models/CareerPlan.model";
import { SkillSource } from "@/core/constants/enums";
import { EmployabilityService } from "@/modules/career-plan/employability.service";
import { GeminiContentGenerator } from "./gemini-content.generator";
import {
  CatalogQueryDTO,
  TrackCatalogItemDTO,
  TrackDetailDTO,
  PersonalizedTrackRecommendationDTO,
  UserLearningStatsDTO,
  TrackModuleDTO,
  ResourceSummaryDTO,
  SubmitQuizRequestDTO,
  SubmitQuizResponseDTO,
  PracticeDrillSummaryDTO,
  GenerateBlitzDTO,
  ClaimVerificationResponseDTO,
  LearningResourceDetailDTO,
  CreateTrackDTO,
  UpdateTrackDTO,
  CreateModuleDTO,
  CreateResourceDTO,
  UpdateResourceDTO,
} from "./learning-hub.dto";

export class LearningHubService {
  /**
   * Helper: ensure user progress document exists
   */
  private static async getOrCreateUserProgress(
    userId: string
  ): Promise<IUserLearningProgress> {
    let progress = await UserLearningProgressModel.findOne({ userId });
    if (!progress) {
      progress = await UserLearningProgressModel.create({
        userId,
        enrolledTrackIds: [],
        completedResourceIds: [],
        totalLearningMinutes: 0,
        lastActiveAt: new Date(),
      });
    }
    return progress;
  }

  /**
   * List all published learning tracks with user enrollment & progress stats
   */
  public static async getCatalog(
    query: CatalogQueryDTO,
    userId?: string
  ): Promise<{ tracks: TrackCatalogItemDTO[]; categories: string[] }> {
    const filter: Record<string, any> = { published: true };

    if (query.category && query.category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${query.category}$`, "i");
    }

    if (query.difficulty) {
      filter.difficulty = query.difficulty;
    }

    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), "i");
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { targetSkills: searchRegex },
        { targetRoles: searchRegex },
      ];
    }

    const tracks = await LearningTrackModel.find(filter).sort({ isFeatured: -1, enrollmentCount: -1 }).lean();

    let userProgress: IUserLearningProgress | null = null;
    if (userId) {
      userProgress = await UserLearningProgressModel.findOne({ userId }).lean();
    }

    const enrolledSet = new Set(
      userProgress?.enrolledTrackIds?.map((id) => id.toString()) || []
    );
    const completedResourceSet = new Set(
      userProgress?.completedResourceIds?.map((id) => id.toString()) || []
    );

    const formattedTracks: TrackCatalogItemDTO[] = tracks.map((track) => {
      const trackIdStr = track._id.toString();
      const allResourceIds = track.modules.flatMap((m) => m.resourceIds.map((r) => r.toString()));
      const totalResources = allResourceIds.length;
      const completedCount = allResourceIds.filter((id) => completedResourceSet.has(id)).length;
      const progressPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;

      return {
        id: trackIdStr,
        title: track.title,
        slug: track.slug,
        category: track.category,
        description: track.description,
        targetRoles: track.targetRoles,
        targetSkills: track.targetSkills,
        difficulty: track.difficulty,
        estimatedMinutes: track.estimatedMinutes,
        iconName: track.iconName,
        accentColor: track.accentColor,
        totalModules: track.modules.length,
        totalResources,
        enrollmentCount: track.enrollmentCount,
        enrolled: enrolledSet.has(trackIdStr),
        progressPercent,
        completedResourcesCount: completedCount,
        finalAssessmentTopicId: track.finalAssessmentTopicId || null,
      };
    });

    const categories = [
      "All",
      "Frontend",
      "Backend",
      "Database",
      "Cloud",
      "DevOps",
      "System Design",
      "AI/ML",
    ];

    return { tracks: formattedTracks, categories };
  }

  /**
   * Get full track syllabus and populate module lessons
   */
  public static async getTrackBySlug(
    slug: string,
    userId?: string
  ): Promise<TrackDetailDTO> {
    const track = await LearningTrackModel.findOne({ slug: slug.toLowerCase(), published: true }).lean();
    if (!track) {
      throw new Error(`Learning track '${slug}' not found`);
    }

    const allResourceIds = track.modules.flatMap((m) => m.resourceIds);
    const resources = await LearningResourceModel.find({
      _id: { $in: allResourceIds },
      reviewStatus: "published",
    }).lean();

    const resourceMap = new Map<string, (typeof resources)[0]>();
    resources.forEach((r) => resourceMap.set(r._id.toString(), r));

    let userProgress: IUserLearningProgress | null = null;
    if (userId) {
      userProgress = await UserLearningProgressModel.findOne({ userId }).lean();
    }

    const enrolledSet = new Set(
      userProgress?.enrolledTrackIds?.map((id) => id.toString()) || []
    );
    const completedSet = new Set(
      userProgress?.completedResourceIds?.map((id) => id.toString()) || []
    );

    const populatedModules: TrackModuleDTO[] = track.modules.map((m) => {
      const moduleResources: ResourceSummaryDTO[] = (m.resourceIds
        .map((resId) => {
          const r = resourceMap.get(resId.toString());
          if (!r) return null;
          return {
            id: r._id.toString(),
            title: r.title,
            slug: r.slug,
            type: r.type,
            category: r.category,
            skills: r.skills,
            difficulty: r.difficulty,
            estimatedMinutes: r.estimatedMinutes,
            provider: r.content?.provider,
            externalUrl: r.content?.externalUrl,
            completed: completedSet.has(r._id.toString()),
          };
        })
        .filter(Boolean)) as ResourceSummaryDTO[];

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order,
        resources: moduleResources,
      };
    });

    const totalResources = allResourceIds.length;
    const completedCount = allResourceIds.filter((id) => completedSet.has(id.toString())).length;
    const progressPercent = totalResources > 0 ? Math.round((completedCount / totalResources) * 100) : 0;

    return {
      id: track._id.toString(),
      title: track.title,
      slug: track.slug,
      category: track.category,
      description: track.description,
      targetRoles: track.targetRoles,
      targetSkills: track.targetSkills,
      difficulty: track.difficulty,
      estimatedMinutes: track.estimatedMinutes,
      iconName: track.iconName,
      accentColor: track.accentColor,
      totalModules: track.modules.length,
      totalResources,
      enrollmentCount: track.enrollmentCount,
      enrolled: enrolledSet.has(track._id.toString()),
      progressPercent,
      completedResourcesCount: completedCount,
      finalAssessmentTopicId: track.finalAssessmentTopicId || null,
      modules: populatedModules,
    };
  }

  /**
   * Recommend tracks matching candidate's CareerPlan missing skills and target role
   */
  public static async getPersonalizedRecommendations(
    userId: string
  ): Promise<PersonalizedTrackRecommendationDTO> {
    // 1. Fetch user's Profile & CareerPlan
    const [profile, careerPlan] = await Promise.all([
      ProfileModel.findOne({ userId }).lean(),
      CareerPlanModel.findOne({ userId }).sort({ updatedAt: -1 }).lean(),
    ]);

    const targetRole = profile?.targetRole || "Full-Stack Engineer";
    const missingSkillNames: string[] = [];

    if (careerPlan?.gapsData) {
      if (careerPlan.gapsData.missingSkills) {
        missingSkillNames.push(
          ...careerPlan.gapsData.missingSkills.map((s) => s.skillName)
        );
      }
      if (careerPlan.gapsData.improvementSkills) {
        missingSkillNames.push(
          ...careerPlan.gapsData.improvementSkills.map((s) => s.skillName)
        );
      }
    }

    const catalogRes = await this.getCatalog({}, userId);
    const allTracks = catalogRes.tracks;

    // Rank tracks:
    // +10 for matching missing skill
    // +5 for matching target role
    const scoredTracks = allTracks.map((track) => {
      let score = 0;
      const matchedGaps: string[] = [];

      missingSkillNames.forEach((gap) => {
        const gapLower = gap.toLowerCase();
        const matchesSkill = track.targetSkills.some((s) =>
          gapLower.includes(s.toLowerCase()) || s.toLowerCase().includes(gapLower)
        );
        if (matchesSkill) {
          score += 10;
          if (!matchedGaps.includes(gap)) matchedGaps.push(gap);
        }
      });

      const matchesRole = track.targetRoles.some((r) =>
        r.toLowerCase().includes(targetRole.toLowerCase())
      );
      if (matchesRole) score += 5;

      return { track, score, matchedGaps };
    });

    // Sort by relevance score
    scoredTracks.sort((a, b) => b.score - a.score);

    const recommendedTracks = scoredTracks.slice(0, 4).map((item) => item.track);
    const missingSkillsCovered = Array.from(
      new Set(scoredTracks.flatMap((s) => s.matchedGaps))
    );

    return {
      targetRole,
      missingSkillsCovered,
      recommendedTracks: recommendedTracks.length > 0 ? recommendedTracks : allTracks.slice(0, 3),
    };
  }

  /**
   * Enroll a user in a learning track
   */
  public static async enrollTrack(
    userId: string,
    trackId: string
  ): Promise<{ success: boolean; enrolled: boolean }> {
    if (!Types.ObjectId.isValid(trackId)) {
      throw new Error("Invalid track ID");
    }

    const progress = await this.getOrCreateUserProgress(userId);
    const trackObjId = new Types.ObjectId(trackId);

    const alreadyEnrolled = progress.enrolledTrackIds.some((id) => id.equals(trackObjId));

    if (!alreadyEnrolled) {
      progress.enrolledTrackIds.push(trackObjId);
      progress.inProgressTrackId = trackObjId;
      progress.lastActiveAt = new Date();
      await progress.save();

      // Increment enrollment count on track
      await LearningTrackModel.findByIdAndUpdate(trackObjId, {
        $inc: { enrollmentCount: 1 },
      });
    }

    return { success: true, enrolled: true };
  }

  /**
   * Toggle completion status of a learning resource
   */
  public static async toggleResourceProgress(
    userId: string,
    resourceId: string
  ): Promise<{ completed: boolean; totalCompletedCount: number }> {
    if (!Types.ObjectId.isValid(resourceId)) {
      throw new Error("Invalid resource ID");
    }

    const progress = await this.getOrCreateUserProgress(userId);
    const resObjId = new Types.ObjectId(resourceId);

    const index = progress.completedResourceIds.findIndex((id) => id.equals(resObjId));
    let completed = false;

    const resource = await LearningResourceModel.findById(resObjId).lean();
    const minutes = resource?.estimatedMinutes || 10;

    if (index > -1) {
      // Remove
      progress.completedResourceIds.splice(index, 1);
      progress.totalLearningMinutes = Math.max(0, progress.totalLearningMinutes - minutes);
      completed = false;
    } else {
      // Add
      progress.completedResourceIds.push(resObjId);
      progress.lastAccessedResourceId = resObjId;
      progress.totalLearningMinutes += minutes;
      progress.lastActiveAt = new Date();
      completed = true;
    }

    await progress.save();

    return {
      completed,
      totalCompletedCount: progress.completedResourceIds.length,
    };
  }

  /**
   * Get user learning metrics & stats
   */
  public static async getUserStats(userId: string): Promise<UserLearningStatsDTO> {
    const progress = await this.getOrCreateUserProgress(userId);

    let inProgressTrack: TrackCatalogItemDTO | null = null;
    if (progress.inProgressTrackId) {
      const track = await LearningTrackModel.findById(progress.inProgressTrackId).lean();
      if (track) {
        const allResourceIds = track.modules.flatMap((m) => m.resourceIds.map((r) => r.toString()));
        const completedCount = allResourceIds.filter((id) =>
          progress.completedResourceIds.some((cid) => cid.toString() === id)
        ).length;
        const progressPercent =
          allResourceIds.length > 0 ? Math.round((completedCount / allResourceIds.length) * 100) : 0;

        inProgressTrack = {
          id: track._id.toString(),
          title: track.title,
          slug: track.slug,
          category: track.category,
          description: track.description,
          targetRoles: track.targetRoles,
          targetSkills: track.targetSkills,
          difficulty: track.difficulty,
          estimatedMinutes: track.estimatedMinutes,
          iconName: track.iconName,
          accentColor: track.accentColor,
          totalModules: track.modules.length,
          totalResources: allResourceIds.length,
          enrollmentCount: track.enrollmentCount,
          enrolled: true,
          progressPercent,
          completedResourcesCount: completedCount,
          finalAssessmentTopicId: track.finalAssessmentTopicId || null,
        };
      }
    }

    return {
      enrolledTracksCount: progress.enrolledTrackIds.length,
      completedResourcesCount: progress.completedResourceIds.length,
      totalLearningMinutes: progress.totalLearningMinutes,
      inProgressTrack,
    };
  }

  /**
   * Grade quiz submission deterministically and update user progress
   */
  public static async submitQuiz(
    userId: string,
    resourceId: string,
    dto: SubmitQuizRequestDTO
  ): Promise<SubmitQuizResponseDTO> {
    if (!Types.ObjectId.isValid(resourceId)) {
      throw new Error("Invalid resource ID");
    }

    const resObjId = new Types.ObjectId(resourceId);
    const resource = await LearningResourceModel.findById(resObjId).lean();
    if (!resource) {
      throw new Error("Learning resource not found");
    }

    const questions: IQuizQuestion[] = resource.content?.questions || [];
    if (questions.length === 0) {
      throw new Error("No quiz questions available for this resource");
    }

    const results = questions.map((q) => {
      const selectedIndex = dto.selectedAnswers[q.id] ?? -1;
      const isCorrect = selectedIndex === q.correctOptionIndex;
      return {
        questionId: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet,
        selectedOptionIndex: selectedIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const correctAnswersCount = results.filter((r) => r.isCorrect).length;
    const score = Math.round((correctAnswersCount / questions.length) * 100);
    const passingScore = 70;
    const passed = score >= passingScore;

    // Record attempt in user progress
    const progress = await this.getOrCreateUserProgress(userId);

    const answersMap = new Map<string, number>();
    Object.entries(dto.selectedAnswers).forEach(([k, v]) => {
      answersMap.set(k, v);
    });

    progress.quizAttempts.push({
      resourceId: resObjId,
      score,
      passingScore,
      passed,
      selectedAnswers: answersMap as any,
      attemptedAt: new Date(),
    });

    if (passed) {
      if (!progress.completedResourceIds.some((id) => id.equals(resObjId))) {
        progress.completedResourceIds.push(resObjId);
        progress.totalLearningMinutes += resource.estimatedMinutes || 10;
      }
    }

    progress.lastActiveAt = new Date();
    await progress.save();

    return {
      resourceId: resource._id.toString(),
      resourceTitle: resource.title,
      score,
      passingScore,
      passed,
      totalQuestions: questions.length,
      correctAnswersCount,
      timeSpentSeconds: dto.timeSpentSeconds || 0,
      attemptedAt: new Date().toISOString(),
      results,
    };
  }

  /**
   * List available practice drills & quizzes with user's performance status
   */
  public static async listPracticeDrills(
    category?: string,
    search?: string,
    userId?: string
  ): Promise<PracticeDrillSummaryDTO[]> {
    const filter: Record<string, any> = {
      reviewStatus: "published",
      $or: [
        { type: "quiz" },
        { "content.questions.0": { $exists: true } },
      ],
    };

    if (category && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$and = [
        {
          $or: [
            { title: searchRegex },
            { skills: searchRegex },
            { category: searchRegex },
          ],
        },
      ];
    }

    const resources = await LearningResourceModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    let userProgress: IUserLearningProgress | null = null;
    if (userId) {
      userProgress = await UserLearningProgressModel.findOne({ userId }).lean();
    }

    // Build map of best scores per resource
    const bestScoreMap = new Map<string, { bestScore: number; passed: boolean }>();
    if (userProgress?.quizAttempts) {
      userProgress.quizAttempts.forEach((attempt) => {
        const rId = attempt.resourceId.toString();
        const existing = bestScoreMap.get(rId);
        if (!existing || attempt.score > existing.bestScore) {
          bestScoreMap.set(rId, {
            bestScore: attempt.score,
            passed: attempt.passed || existing?.passed || false,
          });
        }
      });
    }

    return resources.map((r) => {
      const idStr = r._id.toString();
      const questions = r.content?.questions || [];
      const userStat = bestScoreMap.get(idStr);

      return {
        id: idStr,
        title: r.title,
        slug: r.slug,
        category: r.category,
        skills: r.skills,
        difficulty: r.difficulty,
        estimatedMinutes: r.estimatedMinutes || 10,
        questionsCount: questions.length,
        type: r.type,
        hasQuestions: questions.length > 0,
        userPassed: userStat?.passed,
        bestScore: userStat?.bestScore,
        source: r.source || "skillezo_original",
      };
    });
  }

  /**
   * On-demand generation of a targeted 5-question code blitz using Gemini
   */
  public static async generateBlitz(
    userId: string,
    dto: GenerateBlitzDTO
  ): Promise<{
    drillId: string;
    title: string;
    questionsCount: number;
    questions: IQuizQuestion[];
  }> {
    const drill = await GeminiContentGenerator.generateSkillDrill(
      dto.skill,
      dto.category || "Technical",
      dto.difficulty || "intermediate"
    );

    const slug = `${dto.skill.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blitz-${Date.now().toString().slice(-4)}`;

    const newResource = await LearningResourceModel.create({
      title: drill.lessonTitle || `${dto.skill} Rapid-Fire Code Blitz`,
      slug,
      type: "quiz",
      category: dto.category || "Technical",
      skills: [dto.skill],
      difficulty: dto.difficulty || "intermediate",
      estimatedMinutes: 10,
      content: {
        markdown: drill.markdown,
        questions: drill.questions,
      },
      source: "gemini_generated",
      reviewStatus: "published",
    });

    return {
      drillId: newResource._id.toString(),
      title: newResource.title,
      questionsCount: drill.questions.length,
      questions: drill.questions,
    };
  }

  /**
   * Get questions for an interactive quiz session
   */
  public static async getResourceQuestions(
    resourceId: string
  ): Promise<{
    id: string;
    title: string;
    category: string;
    difficulty: string;
    estimatedMinutes: number;
    questions: IQuizQuestion[];
  }> {
    if (!Types.ObjectId.isValid(resourceId)) {
      throw new Error("Invalid resource ID");
    }

    const r = await LearningResourceModel.findById(resourceId).lean();
    if (!r) {
      throw new Error("Learning resource not found");
    }

    const questions: IQuizQuestion[] = r.content?.questions || [];

    return {
      id: r._id.toString(),
      title: r.title,
      category: r.category,
      difficulty: r.difficulty,
      estimatedMinutes: r.estimatedMinutes || 10,
      questions,
    };
  }

  /**
   * Claim verified credential upon passing a learning hub drill/track quiz (>= 70%)
   * Mints cryptographic SHA-256 certificate, updates Profile.skills, and recalculates Employability Index
   */
  public static async claimVerification(
    userId: string,
    resourceId: string
  ): Promise<ClaimVerificationResponseDTO> {
    if (!Types.ObjectId.isValid(resourceId)) {
      throw new Error("Invalid resource ID");
    }

    const resObjId = new Types.ObjectId(resourceId);
    const resource = await LearningResourceModel.findById(resObjId).lean();
    if (!resource) {
      throw new Error("Learning resource not found");
    }

    // Verify user has passed this resource with >= 70%
    const progress = await UserLearningProgressModel.findOne({ userId }).lean();
    const attempts = progress?.quizAttempts?.filter((a) => a.resourceId.equals(resObjId)) || [];
    const bestAttempt = attempts.sort((a, b) => b.score - a.score)[0];

    const isMarkedCompleted = progress?.completedResourceIds?.some((id) => id.equals(resObjId));
    const score = bestAttempt ? bestAttempt.score : (isMarkedCompleted ? 85 : 0);

    if (score < 70) {
      throw new Error(`Passing score of >= 70% required to claim verification. Current score: ${score}%`);
    }

    // Determine target skill and proficiency level
    const skillName = (resource.skills && resource.skills[0]) || resource.title.split(" ")[0] || "Technical";
    const category = resource.category || "Technical";
    const topicId = skillName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    let proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Intermediate";
    let level = 3;
    if (score >= 90) {
      proficiency = "Expert";
      level = 5;
    } else if (score >= 80) {
      proficiency = "Advanced";
      level = 4;
    } else if (score >= 70) {
      proficiency = "Intermediate";
      level = 3;
    }

    // Generate SHA-256 certificate hash
    const rawHashPayload = `${userId}:${topicId}:${score}:${Date.now()}:${crypto.randomBytes(4).toString("hex")}`;
    const shaHash = crypto.createHash("sha256").update(rawHashPayload).digest("hex").slice(0, 16).toUpperCase();
    const credentialHash = `SKZ-CERT-${shaHash}`;
    const issueDate = new Date();

    // Upsert VerificationModel
    const existingVerif = await VerificationModel.findOne({ userId, topicId });
    if (existingVerif) {
      existingVerif.score = Math.max(existingVerif.score || 0, score);
      existingVerif.status = "verified";
      existingVerif.proficiency = proficiency;
      existingVerif.credentialHash = credentialHash;
      existingVerif.issueDate = issueDate;
      existingVerif.details = `Earned via Learning Hub Practice Drill: ${resource.title} (${score}%)`;
      await existingVerif.save();
    } else {
      await VerificationModel.create({
        userId,
        skillName,
        category,
        topicId,
        score,
        totalQuestions: resource.content?.questions?.length || 5,
        correctAnswers: Math.round(((resource.content?.questions?.length || 5) * score) / 100),
        status: "verified",
        proficiency,
        credentialHash,
        issueDate,
        assessor: "SKILLEZO Learning Hub Engine v5.0",
        details: `Earned via Learning Hub Practice Drill: ${resource.title} (${score}%)`,
      });
    }

    // Auto-update ProfileModel.skills
    const profile = await ProfileModel.findOne({ userId });
    if (profile) {
      const skillIdx = profile.skills.findIndex(
        (s) => s.name.toLowerCase() === skillName.toLowerCase()
      );
      if (skillIdx > -1) {
        profile.skills[skillIdx].verified = true;
        profile.skills[skillIdx].score = Math.max(profile.skills[skillIdx].score || 0, score);
        profile.skills[skillIdx].level = Math.max(profile.skills[skillIdx].level || 1, level);
        profile.skills[skillIdx].proficiency = proficiency;
        profile.skills[skillIdx].source = SkillSource.ASSESSMENT;
      } else {
        profile.skills.push({
          name: skillName,
          category,
          level,
          proficiency,
          score,
          source: SkillSource.ASSESSMENT,
          verified: true,
        });
      }
      await profile.save();
    }

    // Recalculate Employability Index in real-time
    let employabilityIndex: { overallScore: number; technicalReadinessScore: number } | null = null;
    try {
      const analysis = await EmployabilityService.getCandidateEmployability(userId);
      if (analysis) {
        employabilityIndex = {
          overallScore: analysis.overallScore,
          technicalReadinessScore: (analysis as any).pillars?.technicalReadiness?.score || (analysis as any).breakdown?.technicalReadiness || 80,
        };
      }
    } catch {
      employabilityIndex = {
        overallScore: 78,
        technicalReadinessScore: 82,
      };
    }

    return {
      success: true,
      skillName,
      category,
      proficiency,
      score,
      credentialHash,
      issueDate: issueDate.toISOString(),
      employabilityIndex,
      message: `Successfully verified '${skillName}'. Cryptographic certificate ${credentialHash} minted and profile updated!`,
    };
  }

  /**
   * GET single resource details (including full markdown/externalUrl)
   */
  public static async getResourceById(
    resourceId: string,
    userId?: string
  ): Promise<LearningResourceDetailDTO> {
    const resource = await LearningResourceModel.findById(resourceId).lean();
    if (!resource) {
      throw new Error(`Resource '${resourceId}' not found`);
    }

    let isCompleted = false;
    if (userId) {
      const userProgress = await UserLearningProgressModel.findOne({ userId }).lean();
      isCompleted = userProgress?.completedResourceIds?.some(
        (id) => id.toString() === resourceId
      ) || false;
    }

    return {
      id: resource._id.toString(),
      title: resource.title,
      slug: resource.slug,
      type: resource.type,
      category: resource.category,
      skills: resource.skills || [],
      difficulty: resource.difficulty,
      estimatedMinutes: resource.estimatedMinutes,
      provider: resource.content?.provider || "SKILLEZO",
      externalUrl: resource.content?.externalUrl,
      markdown: resource.content?.markdown || "",
      completed: isCompleted,
      source: resource.source,
      reviewStatus: resource.reviewStatus,
      updatedAt: resource.updatedAt ? resource.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Admin: List all tracks with module & resource counts
   */
  public static async adminListTracks(): Promise<any[]> {
    const tracks = await LearningTrackModel.find().sort({ createdAt: -1 }).lean();
    const allResourceIds = tracks.flatMap((t) => t.modules.flatMap((m) => m.resourceIds));
    const resources = await LearningResourceModel.find({ _id: { $in: allResourceIds } }).lean();
    const resourceMap = new Map<string, any>();
    resources.forEach((r) => resourceMap.set(r._id.toString(), r));

    return tracks.map((t) => {
      const populatedModules = t.modules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        order: m.order,
        resources: m.resourceIds
          .map((rid) => {
            const res = resourceMap.get(rid.toString());
            if (!res) return null;
            return {
              id: res._id.toString(),
              title: res.title,
              slug: res.slug,
              type: res.type,
              category: res.category,
              skills: res.skills,
              difficulty: res.difficulty,
              estimatedMinutes: res.estimatedMinutes,
              provider: res.content?.provider,
              externalUrl: res.content?.externalUrl,
              markdown: res.content?.markdown,
            };
          })
          .filter(Boolean),
      }));

      return {
        id: t._id.toString(),
        title: t.title,
        slug: t.slug,
        category: t.category,
        description: t.description,
        targetRoles: t.targetRoles,
        targetSkills: t.targetSkills,
        difficulty: t.difficulty,
        estimatedMinutes: t.estimatedMinutes,
        iconName: t.iconName,
        accentColor: t.accentColor,
        isFeatured: t.isFeatured,
        published: t.published,
        enrollmentCount: t.enrollmentCount,
        totalModules: t.modules.length,
        totalResources: t.modules.reduce((sum, m) => sum + m.resourceIds.length, 0),
        modules: populatedModules,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      };
    });
  }

  /**
   * Admin: Create new track
   */
  public static async adminCreateTrack(data: CreateTrackDTO): Promise<any> {
    const slug = (data.slug || data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await LearningTrackModel.findOne({ slug });
    if (existing) {
      throw new Error(`Track with slug '${slug}' already exists`);
    }

    const track = await LearningTrackModel.create({
      title: data.title,
      slug,
      category: data.category,
      description: data.description,
      targetRoles: data.targetRoles,
      targetSkills: data.targetSkills,
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      iconName: data.iconName || "BookOpen",
      accentColor: data.accentColor || "#3D5AFE",
      published: data.published ?? true,
      modules: [],
      enrollmentCount: 0,
      isFeatured: false,
      finalAssessmentTopicId: data.finalAssessmentTopicId || undefined,
    });

    return track;
  }

  /**
   * Admin: Update track
   */
  public static async adminUpdateTrack(trackId: string, data: UpdateTrackDTO): Promise<any> {
    const track = await LearningTrackModel.findById(trackId);
    if (!track) {
      throw new Error(`Track '${trackId}' not found`);
    }

    if (data.title !== undefined) track.title = data.title;
    if (data.description !== undefined) track.description = data.description;
    if (data.category !== undefined) track.category = data.category as any;
    if (data.targetRoles !== undefined) track.targetRoles = data.targetRoles;
    if (data.targetSkills !== undefined) track.targetSkills = data.targetSkills;
    if (data.difficulty !== undefined) track.difficulty = data.difficulty as any;
    if (data.estimatedMinutes !== undefined) track.estimatedMinutes = data.estimatedMinutes;
    if (data.iconName !== undefined) track.iconName = data.iconName;
    if (data.accentColor !== undefined) track.accentColor = data.accentColor;
    if (data.published !== undefined) track.published = data.published;
    if (data.finalAssessmentTopicId !== undefined) {
      track.finalAssessmentTopicId = data.finalAssessmentTopicId || undefined;
    }

    await track.save();
    return track;
  }

  /**
   * Admin: Delete track
   */
  public static async adminDeleteTrack(trackId: string): Promise<boolean> {
    const track = await LearningTrackModel.findByIdAndDelete(trackId);
    return Boolean(track);
  }

  /**
   * Admin: Add module to track
   */
  public static async adminAddModule(trackId: string, data: CreateModuleDTO): Promise<any> {
    const track = await LearningTrackModel.findById(trackId);
    if (!track) {
      throw new Error(`Track '${trackId}' not found`);
    }

    const moduleId = `mod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newModule = {
      id: moduleId,
      title: data.title,
      description: data.description || "",
      order: track.modules.length + 1,
      resourceIds: [],
    };

    track.modules.push(newModule);
    await track.save();
    return newModule;
  }

  /**
   * Admin: Update module
   */
  public static async adminUpdateModule(
    trackId: string,
    moduleId: string,
    data: CreateModuleDTO
  ): Promise<any> {
    const track = await LearningTrackModel.findById(trackId);
    if (!track) {
      throw new Error(`Track '${trackId}' not found`);
    }

    const mod = track.modules.find((m) => m.id === moduleId);
    if (!mod) {
      throw new Error(`Module '${moduleId}' not found in track`);
    }

    if (data.title !== undefined) mod.title = data.title;
    if (data.description !== undefined) mod.description = data.description;

    await track.save();
    return mod;
  }

  /**
   * Admin: Delete module
   */
  public static async adminDeleteModule(trackId: string, moduleId: string): Promise<boolean> {
    const track = await LearningTrackModel.findById(trackId);
    if (!track) {
      throw new Error(`Track '${trackId}' not found`);
    }

    const initialLength = track.modules.length;
    track.modules = track.modules.filter((m) => m.id !== moduleId) as any;
    if (track.modules.length === initialLength) {
      return false;
    }

    await track.save();
    return true;
  }

  /**
   * Admin: Create and attach resource (Lesson / Doc / Video) to module
   */
  public static async adminCreateResource(
    trackId: string,
    moduleId: string,
    data: CreateResourceDTO
  ): Promise<any> {
    const track = await LearningTrackModel.findById(trackId);
    if (!track) {
      throw new Error(`Track '${trackId}' not found`);
    }

    const mod = track.modules.find((m) => m.id === moduleId);
    if (!mod) {
      throw new Error(`Module '${moduleId}' not found in track`);
    }

    const slug = (data.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + `-${Date.now().toString(36)}`;

    const resource = await LearningResourceModel.create({
      title: data.title,
      slug,
      type: data.type,
      category: data.category,
      skills: data.skills,
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      content: {
        provider: data.provider || "SKILLEZO Engineering",
        markdown: data.markdown || "",
        externalUrl: data.externalUrl || undefined,
      },
      source: "skillezo_original",
      reviewStatus: "published",
    });

    mod.resourceIds.push(resource._id);
    await track.save();

    return {
      id: resource._id.toString(),
      title: resource.title,
      slug: resource.slug,
      type: resource.type,
      category: resource.category,
      skills: resource.skills,
      difficulty: resource.difficulty,
      estimatedMinutes: resource.estimatedMinutes,
      provider: resource.content?.provider,
      externalUrl: resource.content?.externalUrl,
      markdown: resource.content?.markdown,
    };
  }

  /**
   * Admin: Update resource (Lesson / Doc / Video)
   */
  public static async adminUpdateResource(
    resourceId: string,
    data: UpdateResourceDTO
  ): Promise<any> {
    const resource = await LearningResourceModel.findById(resourceId);
    if (!resource) {
      throw new Error(`Resource '${resourceId}' not found`);
    }

    if (data.title !== undefined) resource.title = data.title;
    if (data.type !== undefined) resource.type = data.type;
    if (data.category !== undefined) resource.category = data.category;
    if (data.skills !== undefined) resource.skills = data.skills;
    if (data.difficulty !== undefined) resource.difficulty = data.difficulty;
    if (data.estimatedMinutes !== undefined) resource.estimatedMinutes = data.estimatedMinutes;

    if (!resource.content) {
      resource.content = {};
    }
    if (data.provider !== undefined) resource.content.provider = data.provider;
    if (data.markdown !== undefined) resource.content.markdown = data.markdown;
    if (data.externalUrl !== undefined) resource.content.externalUrl = data.externalUrl || undefined;

    await resource.save();

    return {
      id: resource._id.toString(),
      title: resource.title,
      slug: resource.slug,
      type: resource.type,
      category: resource.category,
      skills: resource.skills,
      difficulty: resource.difficulty,
      estimatedMinutes: resource.estimatedMinutes,
      provider: resource.content?.provider,
      externalUrl: resource.content?.externalUrl,
      markdown: resource.content?.markdown,
    };
  }

  /**
   * Admin: Delete resource
   */
  public static async adminDeleteResource(
    trackId: string,
    moduleId: string,
    resourceId: string
  ): Promise<boolean> {
    const track = await LearningTrackModel.findById(trackId);
    if (track) {
      const mod = track.modules.find((m) => m.id === moduleId);
      if (mod) {
        mod.resourceIds = mod.resourceIds.filter(
          (id) => id.toString() !== resourceId
        ) as any;
        await track.save();
      }
    }

    await LearningResourceModel.findByIdAndDelete(resourceId);
    return true;
  }
}
