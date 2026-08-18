import { BaseRepository } from "../base";
import { RoleModel, IRole } from "@/database/models/Role.model";
import { RoleStatus } from "@/core/constants/enums";

export class RoleRepository extends BaseRepository<IRole> {
  constructor() {
    super(RoleModel, "Role");
  }

  async findBySlug(slug: string): Promise<IRole | null> {
    return await this.findOne({ slug: slug.toLowerCase().trim() });
  }

  async findByName(name: string): Promise<IRole | null> {
    return await this.findOne({ name: new RegExp(`^${name.trim()}$`, "i") });
  }

  async findActiveRoles(): Promise<IRole[]> {
    return await this.findMany({ status: RoleStatus.ACTIVE }, { sort: { name: 1 } });
  }

  async findInactiveRoles(): Promise<IRole[]> {
    return await this.findMany({ status: RoleStatus.INACTIVE }, { sort: { name: 1 } });
  }
}
