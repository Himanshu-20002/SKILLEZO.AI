import { ResumeService } from "@/modules/resume/resume.service";
import { SkillGapService } from "./skill-gap.service";
import { EmployabilityEngine } from "./employability.engine";
import { ProfileModel } from "@/database/models/Profile.model";
import { ResumeModel } from "@/database/models/Resume.model";
import {
  EmployabilityIndexResponseDTO,
  CareerGpsResponseDTO,
} from "./employability.dto";

export class EmployabilityService {
  public static async getCandidateEmployability(
    userId: string,
    targetRole?: string
  ): Promise<EmployabilityIndexResponseDTO> {
    const resumeService = new ResumeService();

    // 1. Gather Phase 19.1 ATS Analysis
    let atsAnalysis = null;
    try {
      atsAnalysis = await resumeService.getResumeAtsScore(userId);
    } catch {
      // Fallback if no resume uploaded yet
    }

    // 2. Gather Phase 19.2 Skill Gap Analysis
    const skillGapAnalysis = await SkillGapService.getCandidateSkillGap(
      userId,
      targetRole
    );

    // 3. Gather Profile & Project signals from MongoDB
    const profile = await ProfileModel.findOne({ userId }).lean();
    const resume = await ResumeModel.findOne({ userId, isDefault: true }).lean() ||
      await ResumeModel.findOne({ userId }).sort({ updatedAt: -1 }).lean();

    const rawText = resume?.rawText?.toLowerCase() || "";
    const hasGithubLink = rawText.includes("github.com") || !!profile?.links?.github;
    const hasLiveDemoLink = rawText.includes("vercel.app") || rawText.includes("http") || rawText.includes(".com") || !!profile?.links?.portfolio;
    const projectCount = (resume?.extractedData?.experience?.length || 0) + (rawText.includes("project") ? 2 : 1);

    // 4. Calculate Profile Completeness (0-100)
    let completeness = 40;
    if (resume?.extractedData?.personalInfo?.fullName || profile?.bio) completeness += 20;
    if (profile?.bio || resume?.extractedData?.summary) completeness += 15;
    if (profile?.location?.city || resume?.extractedData?.personalInfo?.location) completeness += 15;
    if (hasGithubLink || hasLiveDemoLink) completeness += 10;

    // 5. Execute Employability Engine
    return EmployabilityEngine.calculateEmployability({
      targetRole: targetRole || skillGapAnalysis.targetRole,
      atsAnalysis,
      skillGapAnalysis,
      projectCount,
      hasGithubLink,
      hasLiveDemoLink,
      profileCompletenessScore: completeness,
    });
  }

  public static async getCandidateCareerGps(
    userId: string,
    targetRole?: string
  ): Promise<CareerGpsResponseDTO> {
    const analysis = await this.getCandidateEmployability(userId, targetRole);
    const totalWeeks = analysis.careerGps.milestones.reduce(
      (acc, m) => acc + m.estimatedWeeks,
      0
    );

    return {
      targetRole: analysis.targetRole,
      overallScore: analysis.overallScore,
      ready: analysis.careerGps.ready,
      totalEstimatedWeeks: totalWeeks,
      milestones: analysis.careerGps.milestones,
    };
  }
}
