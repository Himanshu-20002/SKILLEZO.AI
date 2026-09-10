import { SkillDetector } from "./skill.detector";
import { SkillGapEngine } from "./skill.gap";
import { SkillNormalizer } from "./skill.normalizer";
import { ResumeSkillProfile, SkillDefinition } from "./skill.types";

export class SkillIntelligenceService {
  private static instance: SkillIntelligenceService;

  public static getInstance(): SkillIntelligenceService {
    if (!SkillIntelligenceService.instance) {
      SkillIntelligenceService.instance = new SkillIntelligenceService();
    }
    return SkillIntelligenceService.instance;
  }

  public normalize(rawMention: string): SkillDefinition | null {
    return SkillNormalizer.normalize(rawMention);
  }

  public getCanonicalSkill(skillId: string): SkillDefinition | null {
    return SkillNormalizer.getById(skillId);
  }

  public buildProfile(extractedData: any, rawText = "", resumeId?: string): ResumeSkillProfile {
    return SkillDetector.detectAndBuildProfile(extractedData, rawText, resumeId);
  }

  public computeGaps(profile: ResumeSkillProfile, targetRole = "Full-Stack Engineer") {
    return SkillGapEngine.computeGaps(profile, targetRole);
  }
}

export const skillIntelligenceService = SkillIntelligenceService.getInstance();
