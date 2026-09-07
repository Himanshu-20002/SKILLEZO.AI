import { Request, Response } from "express";
import { VerificationService } from "./verification.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";

export class VerificationController {
  public static async getCatalog(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
    const catalog = await VerificationService.getAssessmentCatalog(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(catalog));
  }

  public static async getQuiz(req: Request, res: Response): Promise<void> {
    const { topicId } = req.params;
    const quiz = await VerificationService.getAssessmentQuiz(topicId);
    res.status(HTTP_STATUS.OK).json(successResponse(quiz));
  }

  public static async submitQuiz(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
    const { topicId } = req.params;
    const { answers } = req.body;

    if (!answers || typeof answers !== "object") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid assessment answers format",
      });
      return;
    }

    const result = await VerificationService.submitAssessment(userId, topicId, answers);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async getUserRecords(req: Request, res: Response): Promise<void> {
    const userId = req.user?.id || (req.headers["x-user-id"] as string) || "candidate_demo";
    const records = await VerificationService.getUserRecords(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(records));
  }

  public static async verifyCredential(req: Request, res: Response): Promise<void> {
    const { credentialHash } = req.params;
    const credential = await VerificationService.getCredentialByHash(credentialHash);

    if (!credential) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: `Credential ${credentialHash} was not found or is invalid`,
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json(successResponse(credential));
  }
}
