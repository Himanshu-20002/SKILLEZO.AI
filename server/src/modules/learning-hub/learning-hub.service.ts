import { Types } from "mongoose";
import { LearningTrackModel, ILearningTrack } from "@/database/models/LearningTrack.model";
import { LearningResourceModel, ILearningResource, IQuizQuestion } from "@/database/models/LearningResource.model";
import { UserLearningProgressModel, IUserLearningProgress } from "@/database/models/UserLearningProgress.model";
import { ProfileModel } from "@/database/models/Profile.model";
import { CareerPlanModel } from "@/database/models/CareerPlan.model";
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
}
