import { Request, Response } from "express";
import { LearningHubService } from "./learning-hub.service";
import {
  CatalogQuerySchema,
  GenerateDrillSchema,
  SubmitQuizRequestSchema,
  GenerateBlitzSchema,
} from "./learning-hub.dto";
import { PdfVaultService } from "./pdf-vault.service";
import { GeminiContentGenerator } from "./gemini-content.generator";
import { successResponse, errorResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class LearningHubController {
  /**
   * GET /api/learning-hub/catalog
   */
  public static async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      const parsedQuery = CatalogQuerySchema.safeParse(req.query);
      const query = parsedQuery.success ? parsedQuery.data : {};
      const userId = req.user?.id || (req.headers["x-user-id"] as string);

      const result = await LearningHubService.getCatalog(query, userId);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch learning catalog")
      );
    }
  }

  /**
   * GET /api/learning-hub/tracks/:slug
   */
  public static async getTrack(req: Request, res: Response): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const userId = req.user?.id || (req.headers["x-user-id"] as string);

      const track = await LearningHubService.getTrackBySlug(slug, userId);
      res.status(HTTP_STATUS.OK).json(successResponse(track));
    } catch (err: any) {
      const isNotFound = err.message?.includes("not found");
      const status = isNotFound ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const code = isNotFound ? ERROR_CODES.NOT_FOUND : ERROR_CODES.INTERNAL_SERVER_ERROR;
      res.status(status).json(errorResponse(code, err.message || "Failed to fetch track"));
    }
  }

  /**
   * GET /api/learning-hub/personalized
   */
  public static async getPersonalized(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
      const recommendations = await LearningHubService.getPersonalizedRecommendations(userId);
      res.status(HTTP_STATUS.OK).json(successResponse(recommendations));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch recommendations")
      );
    }
  }

  /**
   * POST /api/learning-hub/tracks/:id/enroll
   */
  public static async enrollTrack(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
      const trackId = String(req.params.id);

      const result = await LearningHubService.enrollTrack(userId, trackId);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to enroll in track")
      );
    }
  }

  /**
   * POST /api/learning-hub/resources/:id/progress
   */
  public static async toggleResourceProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
      const resourceId = String(req.params.id);

      const result = await LearningHubService.toggleResourceProgress(userId, resourceId);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to update resource progress")
      );
    }
  }

  /**
   * GET /api/learning-hub/stats
   */
  public static async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
      const stats = await LearningHubService.getUserStats(userId);
      res.status(HTTP_STATUS.OK).json(successResponse(stats));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch user learning stats")
      );
    }
  }

  /**
   * GET /api/learning-hub/vault/pdfs
   */
  public static async listPdfs(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category ? String(req.query.category) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const pdfs = await PdfVaultService.listPdfs(category, search);
      res.status(HTTP_STATUS.OK).json(successResponse(pdfs));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to list PDF documents")
      );
    }
  }

  /**
   * GET /api/learning-hub/vault/pdfs/:id
   */
  public static async getPdf(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const pdf = await PdfVaultService.getPdfById(id);
      res.status(HTTP_STATUS.OK).json(successResponse(pdf));
    } catch (err: any) {
      const isNotFound = err.message?.includes("not found");
      const status = isNotFound ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const code = isNotFound ? ERROR_CODES.NOT_FOUND : ERROR_CODES.INTERNAL_SERVER_ERROR;
      res.status(status).json(errorResponse(code, err.message || "Failed to fetch PDF details"));
    }
  }

  /**
   * POST /api/learning-hub/vault/pdfs/:id/convert-to-quiz
   */
  public static async convertToQuiz(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const result = await PdfVaultService.convertToQuiz(id);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to convert PDF into interactive quiz")
      );
    }
  }

  /**
   * GET /api/learning-hub/vault/pdfs/:id/preview
   */
  public static async previewPdf(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const download = req.query.download === "true";
      const { buffer, filename } = await PdfVaultService.generatePdfBinary(id);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `${download ? "attachment" : "inline"}; filename="${encodeURIComponent(filename)}"`
      );
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
    } catch (err: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_CODES.NOT_FOUND, err.message || "PDF document not found")
      );
    }
  }

  /**
   * POST /api/learning-hub/admin/upload-pdf
   */
  public static async uploadPdf(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(ERROR_CODES.BAD_REQUEST, "No PDF file attached to request")
        );
        return;
      }

      const rawSkills = req.body.skills;
      const skillsArray = Array.isArray(rawSkills)
        ? rawSkills
        : typeof rawSkills === "string"
        ? rawSkills.split(",").map((s) => s.trim())
        : ["Technical"];

      const result = await PdfVaultService.uploadAndIndexPdf(file, {
        title: req.body.title || file.originalname.replace(/\.pdf$/i, ""),
        category: req.body.category || "General",
        skills: skillsArray,
        difficulty: req.body.difficulty || "intermediate",
      });

      res.status(HTTP_STATUS.CREATED).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to upload and index PDF")
      );
    }
  }

  /**
   * POST /api/learning-hub/admin/generate-drill
   */
  public static async generateSkillDrill(req: Request, res: Response): Promise<void> {
    try {
      const parsed = GenerateDrillSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(ERROR_CODES.VALIDATION_ERROR, parsed.error.issues[0]?.message || "Invalid drill parameters")
        );
        return;
      }

      const { skillName, category, difficulty } = parsed.data;
      const drill = await GeminiContentGenerator.generateSkillDrill(skillName, category, difficulty);
      res.status(HTTP_STATUS.OK).json(successResponse(drill));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to generate AI skill drill")
      );
    }
  }

  /**
   * POST /api/learning-hub/resources/:id/submit-quiz
   */
  public static async submitQuiz(req: Request, res: Response): Promise<void> {
    try {
      const parsed = SubmitQuizRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(ERROR_CODES.VALIDATION_ERROR, parsed.error.issues[0]?.message || "Invalid quiz submission data")
        );
        return;
      }

      const resourceId = String(req.params.id);
      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";

      const result = await LearningHubService.submitQuiz(userId, resourceId, parsed.data);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to grade quiz submission")
      );
    }
  }

  /**
   * GET /api/learning-hub/practice/drills
   */
  public static async listPracticeDrills(req: Request, res: Response): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const userId = req.user?.id || (req.headers["x-user-id"] as string);

      const drills = await LearningHubService.listPracticeDrills(category, search, userId);
      res.status(HTTP_STATUS.OK).json(successResponse(drills));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch practice drills")
      );
    }
  }

  /**
   * POST /api/learning-hub/practice/generate-blitz
   */
  public static async generateBlitz(req: Request, res: Response): Promise<void> {
    try {
      const parsed = GenerateBlitzSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(ERROR_CODES.VALIDATION_ERROR, parsed.error.issues[0]?.message || "Invalid blitz generation parameters")
        );
        return;
      }

      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
      const result = await LearningHubService.generateBlitz(userId, parsed.data);
      res.status(HTTP_STATUS.CREATED).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to generate AI blitz")
      );
    }
  }

  /**
   * GET /api/learning-hub/resources/:id/questions
   */
  public static async getResourceQuestions(req: Request, res: Response): Promise<void> {
    try {
      const resourceId = String(req.params.id);
      const result = await LearningHubService.getResourceQuestions(resourceId);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse(ERROR_CODES.NOT_FOUND, err.message || "Failed to fetch quiz questions")
      );
    }
  }

  /**
   * POST /api/learning-hub/resources/:id/claim-verification
   */
  public static async claimVerification(req: Request, res: Response): Promise<void> {
    try {
      const resourceId = String(req.params.id);
      const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";

      const result = await LearningHubService.claimVerification(userId, resourceId);
      res.status(HTTP_STATUS.OK).json(successResponse(result));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to claim verification")
      );
    }
  }
}
