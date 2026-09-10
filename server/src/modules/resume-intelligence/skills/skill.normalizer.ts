import { CANONICAL_SKILL_CATALOG } from "./skill.catalog";
import { SkillDefinition } from "./skill.types";

export class SkillNormalizer {
  private static aliasMap: Map<string, SkillDefinition> = new Map();
  private static idMap: Map<string, SkillDefinition> = new Map();
  private static isInitialized = false;

  private static initialize(): void {
    if (this.isInitialized) return;

    for (const skill of CANONICAL_SKILL_CATALOG) {
      if (!skill.active) continue;

      this.idMap.set(skill.id, skill);
      this.aliasMap.set(this.cleanKey(skill.canonicalName), skill);
      this.aliasMap.set(this.cleanKey(skill.displayName), skill);

      for (const alias of skill.aliases) {
        this.aliasMap.set(this.cleanKey(alias), skill);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Normalizes any raw mention string into its canonical SkillDefinition.
   */
  public static normalize(rawMention: string): SkillDefinition | null {
    this.initialize();
    if (!rawMention || typeof rawMention !== "string") return null;

    const key = this.cleanKey(rawMention);
    return this.aliasMap.get(key) || null;
  }

  /**
   * Gets a canonical skill by its unique ID.
   */
  public static getById(skillId: string): SkillDefinition | null {
    this.initialize();
    return this.idMap.get(skillId) || null;
  }

  /**
   * Returns all active canonical skills.
   */
  public static getAll(): SkillDefinition[] {
    this.initialize();
    return CANONICAL_SKILL_CATALOG.filter((s) => s.active);
  }

  /**
   * Cleans text key for alias map indexing.
   */
  public static cleanKey(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\s\-_.]+/g, " ");
  }
}
