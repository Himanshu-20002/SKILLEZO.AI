import { RoleNormalizer } from "./role.normalizer";
import { NormalizedRole, RoleProfile } from "./role.types";
import { CANONICAL_ROLE_CATALOG } from "./role.catalog";

export class RoleIntelligenceService {
  private static instance: RoleIntelligenceService;

  public static getInstance(): RoleIntelligenceService {
    if (!RoleIntelligenceService.instance) {
      RoleIntelligenceService.instance = new RoleIntelligenceService();
    }
    return RoleIntelligenceService.instance;
  }

  public normalizeRole(rawTitle: string): NormalizedRole {
    return RoleNormalizer.normalize(rawTitle);
  }

  public getRoleBenchmark(targetRole: string): RoleProfile {
    return RoleNormalizer.getByTitle(targetRole);
  }

  public getRoleById(roleId: string): RoleProfile | null {
    return RoleNormalizer.getById(roleId);
  }

  public getAllRoles(): RoleProfile[] {
    return CANONICAL_ROLE_CATALOG;
  }
}

export const roleIntelligenceService = RoleIntelligenceService.getInstance();
