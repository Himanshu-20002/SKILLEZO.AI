import { CANONICAL_ROLE_CATALOG } from "./role.catalog";
import { NormalizedRole, RoleProfile, SeniorityLevel, SeniorityProfile } from "./role.types";

export class RoleNormalizer {
  private static roleAliasMap = new Map<string, RoleProfile>();
  private static initialized = false;

  private static initialize() {
    if (this.initialized) return;
    for (const role of CANONICAL_ROLE_CATALOG) {
      this.roleAliasMap.set(role.title.toLowerCase(), role);
      for (const alias of role.aliases) {
        this.roleAliasMap.set(alias.toLowerCase(), role);
      }
    }
    this.initialized = true;
  }

  /**
   * Normalizes raw role input text into a canonical role benchmark and seniority profile.
   */
  public static normalize(rawTitle: string): NormalizedRole {
    this.initialize();
    if (!rawTitle || rawTitle.trim().length === 0) {
      const fallback = this.getFallbackRole();
      return {
        roleId: fallback.roleId,
        canonicalTitle: fallback.title,
        seniority: { level: "MID", minYears: 2, maxYears: 5 },
        confidence: "LOW",
        isFallback: true,
      };
    }

    const clean = rawTitle.trim();
    const cleanLower = clean.toLowerCase();

    // 1. Extract Seniority
    const seniority = this.extractSeniority(clean);

    // 2. Exact / Alias Lookup
    if (this.roleAliasMap.has(cleanLower)) {
      const match = this.roleAliasMap.get(cleanLower)!;
      return {
        roleId: match.roleId,
        canonicalTitle: match.title,
        seniority,
        confidence: "HIGH",
        isFallback: false,
      };
    }

    // 3. Substring / Token Matching against canonical roles
    for (const role of CANONICAL_ROLE_CATALOG) {
      if (role.roleId === "role_generic_software_engineer") continue;
      for (const alias of role.aliases) {
        const aliasLower = alias.toLowerCase();
        if (cleanLower.includes(aliasLower) || aliasLower.includes(cleanLower)) {
          return {
            roleId: role.roleId,
            canonicalTitle: role.title,
            seniority,
            confidence: "MEDIUM",
            isFallback: false,
          };
        }
      }
    }

    // 4. Keyword heuristic matching
    if (cleanLower.includes("full stack") || cleanLower.includes("fullstack")) {
      const match = this.getById("role_fullstack_engineer")!;
      return { roleId: match.roleId, canonicalTitle: match.title, seniority, confidence: "MEDIUM", isFallback: false };
    }
    if (cleanLower.includes("frontend") || cleanLower.includes("front-end") || cleanLower.includes("react") || cleanLower.includes("ui")) {
      const match = this.getById("role_frontend_engineer")!;
      return { roleId: match.roleId, canonicalTitle: match.title, seniority, confidence: "MEDIUM", isFallback: false };
    }
    if (cleanLower.includes("backend") || cleanLower.includes("back-end") || cleanLower.includes("node") || cleanLower.includes("api")) {
      const match = this.getById("role_backend_engineer")!;
      return { roleId: match.roleId, canonicalTitle: match.title, seniority, confidence: "MEDIUM", isFallback: false };
    }
    if (cleanLower.includes("devops") || cleanLower.includes("cloud") || cleanLower.includes("sre") || cleanLower.includes("infra")) {
      const match = this.getById("role_devops_cloud_engineer")!;
      return { roleId: match.roleId, canonicalTitle: match.title, seniority, confidence: "MEDIUM", isFallback: false };
    }
    if (cleanLower.includes("ai") || cleanLower.includes("ml") || cleanLower.includes("data") || cleanLower.includes("machine learning")) {
      const match = this.getById("role_aiml_engineer")!;
      return { roleId: match.roleId, canonicalTitle: match.title, seniority, confidence: "MEDIUM", isFallback: false };
    }
    if (cleanLower.includes("mobile") || cleanLower.includes("ios") || cleanLower.includes("android") || cleanLower.includes("flutter")) {
      const match = this.getById("role_mobile_developer")!;
      return { roleId: match.roleId, canonicalTitle: match.title, seniority, confidence: "MEDIUM", isFallback: false };
    }

    // 5. Safe Generic Fallback for Unknown Roles
    const fallback = this.getFallbackRole();
    return {
      roleId: fallback.roleId,
      canonicalTitle: fallback.title,
      seniority,
      confidence: "LOW",
      isFallback: true,
    };
  }

  public static getById(roleId: string): RoleProfile | null {
    return CANONICAL_ROLE_CATALOG.find((r) => r.roleId === roleId) || null;
  }

  public static getByTitle(title: string): RoleProfile {
    const normalized = this.normalize(title);
    return this.getById(normalized.roleId) || this.getFallbackRole();
  }

  public static getFallbackRole(): RoleProfile {
    return (
      CANONICAL_ROLE_CATALOG.find((r) => r.roleId === "role_generic_software_engineer") ||
      CANONICAL_ROLE_CATALOG[0]
    );
  }

  public static extractSeniority(text: string): SeniorityProfile {
    const lower = text.toLowerCase();

    if (/\b(intern|internship|trainee|co-op)\b/i.test(lower)) {
      return { level: "INTERN", minYears: 0, maxYears: 1 };
    }
    if (/\b(entry|junior|jr\.?|associate|graduate|fresh|level 1|l1|sde 1|sde-1|sde i)\b/i.test(lower)) {
      return { level: "JUNIOR", minYears: 0, maxYears: 2 };
    }
    if (/\b(principal|fellow|distinguished)\b/i.test(lower)) {
      return { level: "PRINCIPAL", minYears: 10, maxYears: 20 };
    }
    if (/\b(staff|architect)\b/i.test(lower)) {
      return { level: "STAFF", minYears: 8, maxYears: 14 };
    }
    if (/\b(lead|team lead|tech lead|techlead)\b/i.test(lower)) {
      return { level: "LEAD", minYears: 6, maxYears: 10 };
    }
    if (/\b(manager|engineering manager|director|vp)\b/i.test(lower)) {
      return { level: "MANAGER", minYears: 6, maxYears: 12 };
    }
    if (/\b(senior|sr\.?|level 3|l3|sde 3|sde-3|sde iii)\b/i.test(lower)) {
      return { level: "SENIOR", minYears: 5, maxYears: 9 };
    }

    // Default to Mid-Level (2–5 years)
    return { level: "MID", minYears: 2, maxYears: 5 };
  }
}
