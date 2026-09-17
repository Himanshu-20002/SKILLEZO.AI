import { AITool, AIToolContext } from "../types";
import {
  GetCandidateProfileInput,
  GetCandidateProfileInputSchema,
  GetCandidateProfileOutput,
  GetCandidateProfileOutputSchema,
} from "../schemas/profile-tool.schemas";
import { ProfileService } from "@/modules/profile/profile.service";
import { AIToolOwnershipError } from "../tool-errors";

export class GetCandidateProfileTool
  implements AITool<GetCandidateProfileInput, GetCandidateProfileOutput>
{
  public readonly name = "getCandidateProfile";
  public readonly description =
    "Retrieve verified profile details, skills, projects, and readiness completion for the authenticated candidate. Identity is scoped strictly to the authenticated user.";
  public readonly inputSchema = GetCandidateProfileInputSchema;
  public readonly outputSchema = GetCandidateProfileOutputSchema;

  constructor(private readonly profileService: ProfileService = new ProfileService()) {}

  public async execute(
    _params: GetCandidateProfileInput,
    context: AIToolContext
  ): Promise<GetCandidateProfileOutput> {
    if (!context?.userId) {
      throw new AIToolOwnershipError("Authenticated candidate context is required to access profile.");
    }

    const profile = await this.profileService.getMyProfile(context.userId);

    const completion =
      typeof (profile as any).completionPercentage === "number"
        ? (profile as any).completionPercentage
        : this.profileService.calculateProfileCompletion(profile);

    return {
      candidateId: context.userId,
      headline: profile.headline || undefined,
      bio: profile.bio || undefined,
      targetRole: profile.targetRole || undefined,
      location: profile.location?.city
        ? `${profile.location.city}${profile.location.country ? ", " + profile.location.country : ""}`
        : undefined,
      skills: (profile.skills || []).map((s: any) => ({
        name: typeof s === "string" ? s : s.name,
        category: s.category || null,
        level: s.level,
        proficiency: s.proficiency || null,
        verified: !!s.verified,
      })),
      projects: (profile.projects || []).map((p: any) => ({
        title: p.title || "Untitled Project",
        description: p.description || null,
        techStack: Array.isArray(p.techStack) ? p.techStack : [],
        link: p.liveUrl || p.repoUrl || null,
      })),
      education: (profile.education || []).map((e: any) => ({
        institution: e.institution || "Unknown Institution",
        degree: e.degree || null,
        fieldOfStudy: e.fieldOfStudy || null,
        startYear: e.startYear || null,
        endYear: e.endYear || null,
      })),
      experience: (profile.experience || []).map((e: any) => ({
        companyName: e.companyName || "Unknown Company",
        jobTitle: e.jobTitle || "Role",
        description: e.description || null,
        isCurrent: !!e.isCurrent,
      })),
      completionPercentage: Math.min(100, Math.max(0, completion)),
    };
  }
}
