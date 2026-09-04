import { ResumeModel } from "@/database/models/Resume.model";
import { SkillGapEngine } from "./skill-gap.engine";
import { SkillGapAnalysisResponseDTO } from "./skill-gap.dto";

export class SkillGapService {
  public static async getCandidateSkillGap(
    userId: string,
    targetRole?: string
  ): Promise<SkillGapAnalysisResponseDTO> {
    // 1. Fetch user's active resume (default first, or most recently updated)
    const activeResume = (await ResumeModel.findOne({ userId, isDefault: true }).lean()) ||
      (await ResumeModel.findOne({ userId }).sort({ updatedAt: -1 }).lean());

    let candidateSkills: string[] = [];
    let rawText = "";

    if (activeResume) {
      const extracted = activeResume.extractedData;
      if (extracted) {
        if (Array.isArray(extracted.skillsExtracted) && extracted.skillsExtracted.length > 0) {
          candidateSkills = extracted.skillsExtracted;
        } else if (Array.isArray(extracted.skills) && extracted.skills.length > 0) {
          candidateSkills = extracted.skills.map((s: any) => (typeof s === "string" ? s : s.name));
        }
      }

      rawText = activeResume.rawText || "";
    }

    // 2. Execute deterministic Skill Gap calculation
    return SkillGapEngine.analyzeSkillGap(candidateSkills, rawText, targetRole || "Full-Stack Engineer");
  }

  public static getAvailableRoles(): string[] {
    return SkillGapEngine.getSupportedRoles();
  }
}
