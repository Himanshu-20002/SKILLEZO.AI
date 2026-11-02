import { Router } from "express";
import { PlatformRolesController } from "./platform-roles.controller";
import { requireAuth } from "@/core/auth/middleware/requireAuth";
import { requireRole } from "@/core/auth/middleware/requireRole";
import { UserRole } from "@/core/constants/enums";

export const rolesRouter = Router();

// Public: Active platform job roles
rolesRouter.get("/", PlatformRolesController.getActiveRoles);

// Admin: Configure & moderate platform job roles
export const adminRolesRouter = Router();
adminRolesRouter.use(requireAuth, requireRole([UserRole.ADMIN]));

adminRolesRouter.get("/", PlatformRolesController.adminListRoles);
adminRolesRouter.post("/", PlatformRolesController.adminCreateRole);
adminRolesRouter.put("/:id", PlatformRolesController.adminUpdateRole);
adminRolesRouter.delete("/:id", PlatformRolesController.adminDeleteRole);
adminRolesRouter.patch("/:id/toggle-status", PlatformRolesController.adminToggleStatus);

