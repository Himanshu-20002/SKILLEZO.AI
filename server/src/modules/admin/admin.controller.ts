import { Request, Response } from "express";
import { AdminService } from "./admin.service";
import { successResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";
import {
  adminUserQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  adminJobQuerySchema,
  updateJobStatusSchema,
  adminResumeQuerySchema,
} from "./admin.dto";

export class AdminController {
  public static async getMetrics(_req: Request, res: Response): Promise<void> {
    const metrics = await AdminService.getPlatformMetrics();
    res.status(HTTP_STATUS.OK).json(successResponse(metrics));
  }

  public static async getUsers(req: Request, res: Response): Promise<void> {
    const query = adminUserQuerySchema.parse(req.query);
    const result = await AdminService.listUsers(query);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async updateUserRole(req: Request, res: Response): Promise<void> {
    const userId = String(req.params.userId);
    const { role } = updateUserRoleSchema.parse(req.body);
    const result = await AdminService.updateUserRole(userId, role);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async updateUserStatus(req: Request, res: Response): Promise<void> {
    const userId = String(req.params.userId);
    const { status } = updateUserStatusSchema.parse(req.body);
    const result = await AdminService.updateUserStatus(userId, status);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = String(req.params.userId);
    const result = await AdminService.deleteUser(userId);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async getJobs(req: Request, res: Response): Promise<void> {
    const query = adminJobQuerySchema.parse(req.query);
    const result = await AdminService.listJobs(query);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async updateJobStatus(req: Request, res: Response): Promise<void> {
    const jobId = String(req.params.jobId);
    const { status } = updateJobStatusSchema.parse(req.body);
    const result = await AdminService.updateJobStatus(jobId, status);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async deleteJob(req: Request, res: Response): Promise<void> {
    const jobId = String(req.params.jobId);
    const result = await AdminService.deleteJob(jobId);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async triggerJobIngestion(_req: Request, res: Response): Promise<void> {
    const result = await AdminService.triggerJobIngestion();
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }

  public static async getResumes(req: Request, res: Response): Promise<void> {
    const query = adminResumeQuerySchema.parse(req.query);
    const result = await AdminService.listResumes(query);
    res.status(HTTP_STATUS.OK).json(successResponse(result));
  }
}
