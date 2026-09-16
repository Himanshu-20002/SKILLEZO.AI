import { ResumeModel } from "@/database/models/Resume.model";
import { ProfileModel } from "@/database/models/Profile.model";
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

    // 2. Fetch user's profile to capture profile-based skills and projects
    const profile = await ProfileModel.findOne({ userId }).lean();

    const skillSet = new Set<string>();
    let rawTextParts: string[] = [];

    // Extract skills and text from Resume
    if (activeResume) {
      const extracted = activeResume.extractedData;
      if (extracted && Array.isArray(extracted.skills)) {
        for (const s of extracted.skills) {
          const name = typeof s === "string" ? s.trim() : (s?.name || "").trim();
          if (name) skillSet.add(name);
        }
      }

      if (activeResume.rawText) {
        rawTextParts.push(activeResume.rawText);
      }
    }

    // Extract skills and text from Profile
    if (profile) {
      if (Array.isArray(profile.skills)) {
        for (const s of profile.skills) {
          const name = (s?.name || "").trim();
          if (name) skillSet.add(name);
        }
      }

      if (Array.isArray(profile.projects)) {
        for (const p of profile.projects) {
          if (Array.isArray(p.techStack)) {
            for (const t of p.techStack) {
              if (t && t.trim()) skillSet.add(t.trim());
            }
          }
          if (p.title) rawTextParts.push(p.title);
          if (p.description) rawTextParts.push(p.description);
        }
      }

      if (profile.headline) rawTextParts.push(profile.headline);
      if (profile.bio) rawTextParts.push(profile.bio);
    }

    const candidateSkills = Array.from(skillSet);
    const combinedRawText = rawTextParts.join(" ");

    // 3. Execute deterministic Skill Gap calculation
    return SkillGapEngine.analyzeSkillGap(candidateSkills, combinedRawText, targetRole || "Full-Stack Engineer");
  }

  public static getAvailableRoles(): string[] {
    return SkillGapEngine.getSupportedRoles();
  }
}
