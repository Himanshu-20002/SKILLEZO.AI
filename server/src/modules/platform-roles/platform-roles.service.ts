import { RoleModel, DEFAULT_PLATFORM_ROLES, IRole } from "@/database/models/Role.model";
import { RoleStatus } from "@/core/constants/enums";
import { CreatePlatformRoleDTO, UpdatePlatformRoleDTO } from "./platform-roles.dto";

export class PlatformRolesService {
  /**
   * Ensure default roles are seeded on first query
   */
  public static async ensureSeeded(): Promise<void> {
    const count = await RoleModel.countDocuments();
    if (count === 0) {
      await RoleModel.insertMany(DEFAULT_PLATFORM_ROLES);
    }
  }

  /**
   * Public: Get all active platform roles
   */
  public static async getActiveRoles(): Promise<IRole[]> {
    await this.ensureSeeded();
    return RoleModel.find({ status: RoleStatus.ACTIVE }).sort({ order: 1, name: 1 }).lean();
  }

  /**
   * Admin: List all roles (active & inactive)
   */
  public static async adminListRoles(): Promise<IRole[]> {
    await this.ensureSeeded();
    return RoleModel.find().sort({ order: 1, name: 1 }).lean();
  }

  /**
   * Admin: Create new role
   */
  public static async adminCreateRole(data: CreatePlatformRoleDTO): Promise<IRole> {
    const slug = (data.slug || data.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await RoleModel.findOne({ slug });
    if (existing) {
      throw new Error(`Role with slug '${slug}' already exists`);
    }

    const role = await RoleModel.create({
      name: data.name.trim(),
      slug,
      category: data.category.trim(),
      description: data.description?.trim() || null,
      defaultSkills: data.defaultSkills || [],
      icon: data.icon || "Briefcase",
      order: data.order ?? 0,
      isFeatured: data.isFeatured ?? false,
      status: (data.status as RoleStatus) || RoleStatus.ACTIVE,
    });

    return role;
  }

  /**
   * Admin: Update existing role
   */
  public static async adminUpdateRole(id: string, data: UpdatePlatformRoleDTO): Promise<IRole> {
    const role = await RoleModel.findById(id);
    if (!role) {
      throw new Error(`Role with id '${id}' not found`);
    }

    if (data.name !== undefined) role.name = data.name.trim();
    if (data.category !== undefined) role.category = data.category.trim();
    if (data.description !== undefined) role.description = data.description?.trim() || null;
    if (data.defaultSkills !== undefined) role.defaultSkills = data.defaultSkills;
    if (data.icon !== undefined) role.icon = data.icon;
    if (data.order !== undefined) role.order = data.order;
    if (data.isFeatured !== undefined) role.isFeatured = data.isFeatured;
    if (data.status !== undefined) role.status = data.status as RoleStatus;

    await role.save();
    return role;
  }

  /**
   * Admin: Delete role
   */
  public static async adminDeleteRole(id: string): Promise<boolean> {
    const deleted = await RoleModel.findByIdAndDelete(id);
    return Boolean(deleted);
  }

  /**
   * Admin: Toggle active status
   */
  public static async adminToggleStatus(id: string): Promise<IRole> {
    const role = await RoleModel.findById(id);
    if (!role) {
      throw new Error(`Role with id '${id}' not found`);
    }

    role.status = role.status === RoleStatus.ACTIVE ? RoleStatus.INACTIVE : RoleStatus.ACTIVE;
    await role.save();
    return role;
  }
}

