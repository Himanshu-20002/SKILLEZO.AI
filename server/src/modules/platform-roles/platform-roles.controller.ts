import { Request, Response } from "express";
import { PlatformRolesService } from "./platform-roles.service";
import { CreatePlatformRoleSchema, UpdatePlatformRoleSchema } from "./platform-roles.dto";
import { successResponse, errorResponse } from "@/core/utils/apiResponse";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { ERROR_CODES } from "@/core/constants/error-codes";

export class PlatformRolesController {
  /**
   * GET /api/roles (Public / Candidate)
   */
  public static async getActiveRoles(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await PlatformRolesService.getActiveRoles();
      res.status(HTTP_STATUS.OK).json(successResponse(roles));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch platform roles")
      );
    }
  }

  /**
   * GET /api/admin/roles
   */
  public static async adminListRoles(_req: Request, res: Response): Promise<void> {
    try {
      const roles = await PlatformRolesService.adminListRoles();
      res.status(HTTP_STATUS.OK).json(successResponse(roles));
    } catch (err: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        errorResponse(ERROR_CODES.INTERNAL_SERVER_ERROR, err.message || "Failed to fetch admin roles")
      );
    }
  }

  /**
   * POST /api/admin/roles
   */
  public static async adminCreateRole(req: Request, res: Response): Promise<void> {
    try {
      const parsed = CreatePlatformRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(ERROR_CODES.VALIDATION_ERROR, parsed.error.issues[0]?.message || "Invalid role data")
        );
        return;
      }
      const role = await PlatformRolesService.adminCreateRole(parsed.data);
      res.status(HTTP_STATUS.CREATED).json(successResponse(role));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to create role")
      );
    }
  }

  /**
   * PUT /api/admin/roles/:id
   */
  public static async adminUpdateRole(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const parsed = UpdatePlatformRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          errorResponse(ERROR_CODES.VALIDATION_ERROR, parsed.error.issues[0]?.message || "Invalid update data")
        );
        return;
      }
      const updated = await PlatformRolesService.adminUpdateRole(id, parsed.data);
      res.status(HTTP_STATUS.OK).json(successResponse(updated));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to update role")
      );
    }
  }

  /**
   * DELETE /api/admin/roles/:id
   */
  public static async adminDeleteRole(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await PlatformRolesService.adminDeleteRole(id);
      if (!deleted) {
        res.status(HTTP_STATUS.NOT_FOUND).json(
          errorResponse(ERROR_CODES.NOT_FOUND, "Role not found or already deleted")
        );
        return;
      }
      res.status(HTTP_STATUS.OK).json(successResponse({ deleted: true, id }));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to delete role")
      );
    }
  }

  /**
   * PATCH /api/admin/roles/:id/toggle-status
   */
  public static async adminToggleStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updated = await PlatformRolesService.adminToggleStatus(id);
      res.status(HTTP_STATUS.OK).json(successResponse(updated));
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse(ERROR_CODES.BAD_REQUEST, err.message || "Failed to toggle role status")
      );
    }
  }
}

