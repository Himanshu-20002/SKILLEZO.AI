import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IResume, IResumeExtractedData } from "@/database/models/Resume.model";
import { UpdateResumeDTO, ResumeAtsResponseDTO } from "./resume.dto";
import { AppError } from "@/core/utils/AppError";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { ResumeStatus } from "@/core/constants/enums";
import { IResumeStorageService, resumeStorageService } from "@/core/storage/storage.service";
import { ResumeParserService, resumeParserService } from "./resume.parser";
import { resumeAtsEngine, ResumeAtsEngine } from "./resume.ats";
import { AIContextBuilder } from "@/core/ai/ai.context";
import { optimizationIntelligenceService, jobIntelligenceService } from "@/modules/resume-intelligence";
import { GeminiProvider } from "@/core/ai/providers/gemini.provider";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

const MAX_RESUMES_PER_USER = parseInt(process.env.MAX_RESUMES_PER_USER || "10", 10);

export class ResumeService {
  private readonly resumeRepository: ResumeRepository;
  private readonly storageService: IResumeStorageService;
  private readonly parserService: ResumeParserService;

  constructor(
    resumeRepository?: ResumeRepository,
    storageService?: IResumeStorageService,
    parserService?: ResumeParserService
  ) {
    this.resumeRepository = resumeRepository || new ResumeRepository();
    this.storageService = storageService || resumeStorageService;
    this.parserService = parserService || resumeParserService;
  }

  async uploadResume(
    userId: string,
    file: Express.Multer.File,
    titleRequested?: string,
    isDefaultRequested = false
  ): Promise<IResume> {
    if (!file) {
      throw new AppError("No file uploaded", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    }

    // Check user resume count limit
    const currentCount = await this.resumeRepository.countUserResumes(userId);
    if (currentCount >= MAX_RESUMES_PER_USER) {
      // Clean up multer temp file if written
      if (file.path && fs.existsSync(file.path)) {
        try { fs.unlinkSync(file.path); } catch (e) {}
      }
      throw new AppError(
        `Resume limit reached. Maximum ${MAX_RESUMES_PER_USER} resumes allowed per candidate.`,
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.RESUME_LIMIT_EXCEEDED
      );
    }

    const existingResumes = await this.resumeRepository.findByUserId(userId);
    const isFirstResume = existingResumes.length === 0;
    const makeDefault = isFirstResume || isDefaultRequested;

    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const storageKey = `resumes/${userId}/${uniqueId}${ext}`;
    const title = titleRequested || file.originalname;

    let savedStorageKey: string;
    try {
      savedStorageKey = await this.storageService.save(file, storageKey);
    } catch (err: any) {
      throw new AppError(
        "Failed to save resume file to storage",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.RESUME_STORAGE_ERROR
      );
    }

    // Extract structured data from uploaded resume buffer
    let extractedData: IResumeExtractedData | null = null;
    let rawText: string | null = null;
    let status: ResumeStatus = ResumeStatus.UPLOADED;
    let parsingError: string | null = null;

    try {
      let fileBuffer: Buffer | null = file.buffer || null;
      if (!fileBuffer && savedStorageKey) {
        const absPath = this.storageService.getAbsolutePath(savedStorageKey);
        if (fs.existsSync(absPath)) {
          fileBuffer = fs.readFileSync(absPath);
        }
      }

      const isPdf =
        file.mimetype === "application/pdf" ||
        file.originalname.toLowerCase().endsWith(".pdf");

      if (fileBuffer && isPdf) {
        rawText = await this.parserService.extractRawTextFromBuffer(fileBuffer);
        extractedData = await this.parserService.parseResumeBuffer(fileBuffer);
        status = ResumeStatus.PARSED;
      }
    } catch (parseErr: any) {
      parsingError = parseErr?.message || "Failed to parse resume text";
      status = ResumeStatus.UPLOADED;
    }

    try {
      if (makeDefault) {
        await this.resumeRepository.clearDefaultFlag(userId);
      }

      const fileUrl = `/api/resumes/download-ref/${path.basename(storageKey)}`;

      const newResume = await this.resumeRepository.create({
        userId,
        title,
        originalFileName: file.originalname,
        fileName: path.basename(storageKey),
        storageKey: savedStorageKey,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        isDefault: makeDefault,
        status,
        version: 1,
        extractedData,
        rawText,
        parsingError,
        uploadedAt: new Date(),
      } as any);

      return newResume;
    } catch (dbErr: any) {
      // Clean up orphan file if DB creation fails
      await this.storageService.delete(savedStorageKey);
      throw new AppError(
        "Failed to record resume in database",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.RESUME_UPLOAD_FAILED
      );
    }
  }

  async getUserResumes(userId: string): Promise<IResume[]> {
    return await this.resumeRepository.findByUserId(userId);
  }

  async getResumeById(userId: string, resumeId: string): Promise<IResume> {
    const resume = await this.resumeRepository.findUserResumeById(userId, resumeId);
    if (!resume) {
      throw new AppError(
        "Resume not found or access denied",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESUME_NOT_FOUND
      );
    }
    return resume;
  }

  async getResumeStream(userId: string, resumeId: string): Promise<{ stream: Readable; fileName: string; mimeType: string; fileSize: number }> {
    const resume = await this.getResumeById(userId, resumeId);
    const exists = await this.storageService.exists(resume.storageKey);

    if (!exists) {
      throw new AppError(
        "Resume file not found on storage",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.RESUME_FILE_NOT_FOUND
      );
    }

    const stream = await this.storageService.getStream(resume.storageKey);
    return {
      stream,
      fileName: resume.originalFileName || resume.fileName,
      mimeType: resume.mimeType,
      fileSize: resume.fileSize,
    };
  }

  async setDefaultResume(userId: string, resumeId: string): Promise<IResume> {
    const resume = await this.getResumeById(userId, resumeId);
    const updated = await this.resumeRepository.setDefaultResume(userId, resume._id.toString());
    if (!updated) {
      throw new AppError(
        "Failed to set default resume",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.DEFAULT_RESUME_ERROR
      );
    }
    return updated;
  }

  async updateResume(userId: string, resumeId: string, updateDTO: UpdateResumeDTO): Promise<IResume> {
    const resume = await this.getResumeById(userId, resumeId);

    if (updateDTO.isDefault) {
      await this.resumeRepository.clearDefaultFlag(userId);
    }

    const updatePayload: Partial<IResume> = {};
    if (updateDTO.title !== undefined) updatePayload.title = updateDTO.title;
    if (updateDTO.isDefault !== undefined) updatePayload.isDefault = updateDTO.isDefault;

    const updated = await this.resumeRepository.updateById(resume._id.toString(), updatePayload);
    if (!updated) {
      throw new AppError(
        "Failed to update resume",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INVALID_RESUME_METADATA
      );
    }
    return updated;
  }

  async deleteResume(userId: string, resumeId: string): Promise<void> {
    const resume = await this.getResumeById(userId, resumeId);

    await this.storageService.delete(resume.storageKey);
    await this.resumeRepository.deleteUserResume(userId, resume._id.toString());

    // If deleted resume was default, set newest remaining resume as default
    if (resume.isDefault) {
      const remaining = await this.resumeRepository.findByUserId(userId);
      if (remaining.length > 0) {
        await this.resumeRepository.setDefaultResume(userId, remaining[0]._id.toString());
      }
    }
  }

  async getResumeAtsScore(
    userId: string,
    resumeId?: string,
    targetRole = "Full-Stack Engineer",
    jobDescription?: string
  ): Promise<ResumeAtsResponseDTO> {
    let resume: IResume | null = null;
    if (resumeId) {
      resume = await this.resumeRepository.findById(resumeId);
      if (!resume) {
        throw new AppError("Resume not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESUME_NOT_FOUND);
      }
      if (resume.userId !== userId) {
        throw new AppError("Unauthorized access to resume", HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
      }
    } else {
      resume = await this.resumeRepository.findDefaultByUserId(userId);
      if (!resume) {
        const resumes = await this.resumeRepository.findByUserId(userId);
        if (resumes.length > 0) {
          resume = resumes[0];
        }
      }
      if (!resume) {
        throw new AppError("No resume found for candidate. Please upload a resume first.", HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESUME_NOT_FOUND);
      }
    }

    let extractedData = resume.extractedData || {
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
    };
    let rawText = resume.rawText || "";

    // Auto re-parse from file storage if rawText is short or projects were not extracted
    if (
      (!rawText || rawText.length < 200 || !extractedData.projects || extractedData.projects.length === 0) &&
      resume.storageKey
    ) {
      try {
        const absPath = this.storageService.getAbsolutePath(resume.storageKey);
        if (fs.existsSync(absPath)) {
          const fileBuffer = fs.readFileSync(absPath);
          const isPdf =
            resume.mimeType === "application/pdf" ||
            (resume.originalFileName && resume.originalFileName.toLowerCase().endsWith(".pdf")) ||
            resume.storageKey.toLowerCase().endsWith(".pdf");

          if (isPdf && fileBuffer) {
            const freshRawText = await this.parserService.extractRawTextFromBuffer(fileBuffer);
            const freshExtractedData = await this.parserService.parseResumeBuffer(fileBuffer);
            if (freshRawText && freshRawText.trim().length > 0) {
              rawText = freshRawText;
              extractedData = freshExtractedData;
              // Silently persist upgraded extraction in database
              this.resumeRepository.updateById(resume._id.toString(), {
                rawText: freshRawText,
                extractedData: freshExtractedData,
                status: ResumeStatus.PARSED,
              }).catch(() => {});
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    if (
      resume.rawText &&
      (!extractedData?.experience ||
        extractedData.experience.length === 0 ||
        extractedData.experience[0]?.description?.toLowerCase()?.startsWith("summary") ||
        extractedData.experience[0]?.jobTitle?.toLowerCase()?.includes("summary"))
    ) {
      try {
        extractedData = resumeParserService.parseResumeText(resume.rawText);
        await this.resumeRepository.updateById(resume._id.toString(), { extractedData });
      } catch {
        // Fallback
      }
    }

    const effectiveText =
      (rawText && rawText.length > 50)
        ? rawText
        : [
            extractedData.summary,
            ...(extractedData.skills || []).map((s: any) => (typeof s === "string" ? s : s.name)),
            ...(extractedData.experience || []).map(
              (e: any) => `${e.jobTitle || ""} ${e.companyName || ""} ${e.description || ""}`
            ),
            ...(extractedData.projects || []).map(
              (p: any) => `${p.title || ""} ${(p.technologies || []).join(" ")} ${p.description || ""}`
            ),
            ...(extractedData.certifications || []).map(
              (c: any) => `${c.name || ""} ${c.issuer || ""}`
            ),
            ...(extractedData.education || []).map(
              (ed: any) => `${ed.degree || ""} ${ed.institution || ""}`
            ),
          ]
            .filter(Boolean)
            .join(" ");

    const analysis = resumeAtsEngine.analyze(extractedData, effectiveText);

    // Build comprehensive AI context (Phases 1-6)
    const context = AIContextBuilder.buildContext(
      extractedData,
      effectiveText,
      analysis,
      targetRole,
      jobDescription,
      resume._id.toString(),
      resume.version || 1
    );

    return {
      resumeId: resume._id.toString(),
      resumeVersion: resume.version || 1,
      fileName: resume.originalFileName || resume.fileName || "resume.pdf",
      overallScore: analysis.overallScore,
      atsScore: analysis.atsScore,
      matchScore: context.matchResult?.overallMatchScore ?? 75,
      contentScore: context.contentResult?.contentScore ?? 70,
      impactScore: analysis.impactScore,
      brevityScore: analysis.brevityScore,
      level: analysis.level,
      breakdown: analysis.breakdown,
      categories: analysis.categories,
      auditPillars: analysis.auditPillars,
      atsCompatibility: analysis.atsCompatibility,
      keywords: analysis.keywords,
      missingKeywords: analysis.missingKeywords,
      missingSkills:
        context.skillsProfile?.notDetectedTargetSkills?.map((s) => ({
          skill: s,
          category: "Required",
          impactLevel: "High" as const,
          recommendation: `Add verifiable project experience with ${s}`,
        })) || analysis.missingKeywords,
      recommendations: context.recommendationResult?.recommendations || analysis.recommendations,
      topAction: context.recommendationResult?.topAction,
      recommendationSummary: context.recommendationResult?.summary,
      contentResult: context.contentResult,
      skillsProfile: context.skillsProfile,
      roleProfile: context.roleProfile,
    };
  }

  async proposeOptimization(
    userId: string,
    resumeId: string,
    recommendationId: string,
    targetRole = "Full-Stack Engineer",
    jobDescription?: string,
    targetBulletId?: string
  ) {
    const resume = await this.getResumeById(userId, resumeId);
    const intelligence = await this.getResumeAtsScore(userId, resumeId, targetRole, jobDescription);
    const rec = (intelligence.recommendations || []).find((r: any) => r.id === recommendationId) || {
      id: recommendationId,
      category: "IMPACT",
      title: "Improve bullet impact",
      actionability: "FIX_NOW",
    };

    let effectiveExtractedData = resume.extractedData;
    if (
      resume.rawText &&
      (!effectiveExtractedData?.experience ||
        effectiveExtractedData.experience.length === 0 ||
        effectiveExtractedData.experience[0]?.description?.toLowerCase()?.startsWith("summary") ||
        effectiveExtractedData.experience[0]?.jobTitle?.toLowerCase()?.includes("summary"))
    ) {
      try {
        effectiveExtractedData = resumeParserService.parseResumeText(resume.rawText);
      } catch {
        // Fallback
      }
    }

    const draft = await optimizationIntelligenceService.proposeOptimization({
      resumeId: resume._id.toString(),
      baseResumeVersionId: `v${resume.version || 1}`,
      recommendation: rec,
      targetBulletId,
      extractedData: effectiveExtractedData,
      rawText: resume.rawText || undefined,
      beforeScores: {
        atsScore: intelligence.atsScore,
        matchScore: intelligence.matchScore,
        contentScore: intelligence.contentScore,
        timestamp: new Date().toISOString(),
      },
      targetRole,
      roleBenchmark: intelligence.roleProfile,
      jobProfile: jobDescription ? jobIntelligenceService.parseJobDescription(jobDescription) : undefined,
      contentResult: intelligence.contentResult,
      aiProvider: {
        generateCompletion: async (systemPrompt: string, userPrompt: string) => {
          const gemini = new GeminiProvider();
          if (gemini.isAvailable()) {
            const prompt = `${systemPrompt}\n\n${userPrompt}`;
            const res = await gemini.generateStructured<any>(prompt, "Optimization Proposal");
            if (res) return res;
          }
          throw new Error("Gemini AI provider unavailable or key missing");
        },
      },
    });

    return draft;
  }

  async acceptOptimization(
    userId: string,
    resumeId: string,
    draft: any
  ) {
    const resume = await this.getResumeById(userId, resumeId);
    const { newVersionId, updatedExtractedData, historyEntry } = optimizationIntelligenceService.acceptDraft(
      draft,
      resume.extractedData
    );

    const newVersion = (resume.version || 1) + 1;
    const updated = await this.resumeRepository.updateById(resume._id.toString(), {
      extractedData: updatedExtractedData,
      version: newVersion,
    });

    const freshIntelligence = await this.getResumeAtsScore(userId, resumeId);

    return {
      success: true,
      newVersionId,
      version: newVersion,
      resume: updated,
      historyEntry,
      freshIntelligence,
    };
  }

  async rejectOptimization(draft: any) {
    return optimizationIntelligenceService.rejectDraft(draft);
  }
}

