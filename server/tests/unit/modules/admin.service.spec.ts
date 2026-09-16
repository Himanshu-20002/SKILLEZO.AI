import { describe, it, expect, vi } from "vitest";
import mongoose from "mongoose";
import { AdminService } from "@/modules/admin/admin.service";
import { requireRole, SUPER_ADMIN_EMAIL } from "@/core/auth/middleware/requireRole";
import { UserRole } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";

describe("requireRole Middleware", () => {
  it("should block unauthenticated requests with 401", () => {
    const middleware = requireRole([UserRole.ADMIN]);
    const req: any = {};
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
  });

  it("should automatically elevate super admin email (admin@gmail.com) to admin role", () => {
    const middleware = requireRole([UserRole.ADMIN]);
    const req: any = {
      user: {
        id: "usr_admin_1",
        email: SUPER_ADMIN_EMAIL,
        role: UserRole.CANDIDATE,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user.role).toBe(UserRole.ADMIN);
  });

  it("should permit user who already has ADMIN role", () => {
    const middleware = requireRole([UserRole.ADMIN]);
    const req: any = {
      user: {
        id: "usr_admin_2",
        email: "staff@company.com",
        role: UserRole.ADMIN,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("should reject normal candidate with 403 Forbidden", () => {
    const middleware = requireRole([UserRole.ADMIN]);
    const req: any = {
      user: {
        id: "usr_cand_1",
        email: "candidate@gmail.com",
        role: UserRole.CANDIDATE,
      },
    };
    const res: any = {};
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });
});

describe("AdminService Query Helpers & Protection", () => {
  it("getUserQuery constructs query matching string id and ObjectId if valid hex", () => {
    const hexId = new mongoose.Types.ObjectId().toHexString();
    const query = AdminService.getUserQuery(hexId);
    expect(query.$or).toHaveLength(3);
    expect(query.$or).toEqual(
      expect.arrayContaining([
        { id: hexId },
        { _id: hexId },
        { _id: new mongoose.Types.ObjectId(hexId) },
      ])
    );

    const nonHexId = "custom_id_123";
    const nonHexQuery = AdminService.getUserQuery(nonHexId);
    expect(nonHexQuery.$or).toHaveLength(2);
  });
});
