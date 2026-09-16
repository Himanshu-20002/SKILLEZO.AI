import { ProfileRepository } from "@/database/repositories/profile/ProfileRepository";
import { ResumeRepository } from "@/database/repositories/resume/ResumeRepository";
import { IResumeExtractedData } from "@/database/models/Resume.model";
import { ResumeDocument } from "@/modules/resume-intelligence/document/resume-document.types";
import { resumeStorageService } from "@/core/storage/storage.service";
import { resumeParserService } from "@/modules/resume/resume.parser";
import fs from "fs";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { Types } from "mongoose";
import {
  CreateProfileDTO,
  UpdateProfileDTO,
  UpdateSkillsDTO,
  UpdateEducationDTO,
  UpdateExperienceDTO,
  UpdateLinksDTO,
  UpdateTargetRoleDTO,
  ProfileSkillDTO,
} from "./profile.dto";
import { IProfile, IProfileSkill, IProfileEducation, IProfileExperience, IProfileLinks, ProfileModel } from "@/database/models/Profile.model";
import { SkillSource } from "@/core/constants/enums";

export class ProfileService {
  private readonly profileRepository: ProfileRepository;
  private readonly resumeRepository: ResumeRepository;

  constructor(profileRepository?: ProfileRepository, resumeRepository?: ResumeRepository) {
    this.profileRepository = profileRepository || new ProfileRepository();
    this.resumeRepository = resumeRepository || new ResumeRepository();
  }

  public calculateProfileCompletion(profile: Partial<IProfile>): number {
    let score = 10; // base score for account registration
    if (profile.headline && profile.headline.trim().length > 0) score += 15;
    if (profile.targetRole && profile.targetRole.trim().length > 0) score += 15;
    if (profile.bio && profile.bio.trim().length > 20) score += 10;
    if (profile.location?.city || profile.location?.country) score += 5;
    if (profile.phone && profile.phone.trim().length > 0) score += 5;
    if (profile.skills && profile.skills.length >= 3) score += 15;
    if (profile.skills && profile.skills.some((s) => s.verified)) score += 10;
    if (profile.projects && profile.projects.length >= 1) score += 10;
    if (profile.links?.github || profile.links?.portfolio || profile.links?.linkedin) score += 5;
    return Math.min(score, 100);
  }

  async createProfile(userId: string, data: CreateProfileDTO): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (exists) {
      throw new AppError(
        "Candidate profile already exists for this account",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.PROFILE_ALREADY_EXISTS
      );
    }

    const targetRoleId = data.targetRoleId ? new Types.ObjectId(data.targetRoleId) : null;

    const profileData: Partial<IProfile> = {
      userId,
      headline: data.headline || "",
      phone: data.phone || "",
      targetRole: data.targetRole || "",
      targetRoleId,
      bio: data.bio || "",
      skills: (data.skills as IProfileSkill[]) || [],
      education: (data.education as IProfileEducation[]) || [],
      experience: (data.experience as IProfileExperience[]) || [],
      projects: (data as any).projects || [],
      links: (data.links as IProfileLinks) || { github: "", linkedin: "", portfolio: "" },
      location: data.location || { city: "", state: "", country: "" },
    };

    return await this.profileRepository.create(profileData);
  }

  async getMyProfile(userId: string): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      // Create initial profile for user seamlessly
      profile = await this.createProfile(userId, {});
    }

    // Purge any legacy seeded mock projects if they exist on the record
    const KNOWN_MOCK_TITLES = new Set([
      "skillezo ai — enterprise career intelligence platform",
      "distributed real-time job ingestion & crawler engine",
      "devflow — collaborative real-time code canvas",
      "devflow — real-time collaborative canvas",
      "cloudscale — distributed service mesh",
      "job ingestion worker pipeline",
    ]);

    if (
      profile.projects &&
      profile.projects.some((p: any) => KNOWN_MOCK_TITLES.has((p.title || "").trim().toLowerCase()))
    ) {
      profile.projects = profile.projects.filter(
        (p: any) => !KNOWN_MOCK_TITLES.has((p.title || "").trim().toLowerCase())
      );
      await profile.save();
    }

    const doc = profile.toObject ? profile.toObject() : profile;
    (doc as any).completionPercentage = this.calculateProfileCompletion(doc);
    return doc as IProfile;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId, data);
      return profile;
    }

    const updatePayload: Record<string, any> = {};

    if (data.headline !== undefined) updatePayload.headline = data.headline;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.targetRole !== undefined) updatePayload.targetRole = data.targetRole;
    if (data.targetRoleId !== undefined) {
      updatePayload.targetRoleId = data.targetRoleId ? new Types.ObjectId(data.targetRoleId) : null;
    }
    if (data.bio !== undefined) updatePayload.bio = data.bio;
    if (data.skills !== undefined) updatePayload.skills = data.skills;
    if (data.education !== undefined) updatePayload.education = data.education;
    if (data.experience !== undefined) updatePayload.experience = data.experience;
    if (data.links !== undefined) updatePayload.links = data.links;
    if (data.location !== undefined) updatePayload.location = data.location;

    const updated = await this.profileRepository.updateByUserId(userId, { $set: updatePayload });
    if (!updated) {
      throw new AppError(
        "Candidate profile not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.PROFILE_NOT_FOUND
      );
    }
    const doc = updated.toObject ? updated.toObject() : updated;
    (doc as any).completionPercentage = this.calculateProfileCompletion(doc);
    return doc as IProfile;
  }

  async addSkill(userId: string, skill: ProfileSkillDTO): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId, { skills: [skill] });
      return profile;
    }

    const existsIndex = profile.skills.findIndex((s) => s.name.toLowerCase() === skill.name.toLowerCase());
    const newSkill: IProfileSkill = {
      name: skill.name.trim(),
      category: skill.category || "Technical",
      level: skill.level || 4,
      proficiency: skill.proficiency || "Advanced",
      score: skill.score || 88,
      source: skill.source || SkillSource.PROFILE,
      verified: skill.verified || false,
    };

    if (existsIndex >= 0) {
      profile.skills[existsIndex] = newSkill;
    } else {
      profile.skills.push(newSkill);
    }

    await profile.save();
    return this.getMyProfile(userId);
  }

  async deleteSkill(userId: string, skillName: string): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }

    profile.skills = profile.skills.filter((s) => s.name.toLowerCase() !== decodeURIComponent(skillName).toLowerCase());
    await profile.save();
    return this.getMyProfile(userId);
  }

  async updateSkills(userId: string, dto: UpdateSkillsDTO): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      throw new AppError(
        "Candidate profile not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.PROFILE_NOT_FOUND
      );
    }
    const updated = await this.profileRepository.updateSkills(userId, dto.skills as IProfileSkill[]);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return updated;
  }

  async updateEducation(userId: string, dto: UpdateEducationDTO): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateEducation(userId, dto.education as IProfileEducation[]);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return updated;
  }

  async updateExperience(userId: string, dto: UpdateExperienceDTO): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateExperience(userId, dto.experience as IProfileExperience[]);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return updated;
  }

  async updateLinks(userId: string, dto: UpdateLinksDTO): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateLinks(userId, dto.links as IProfileLinks);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return updated;
  }

  async updateTargetRole(userId: string, dto: UpdateTargetRoleDTO): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const targetRoleId = dto.targetRoleId ? new Types.ObjectId(dto.targetRoleId) : null;
    const updated = await this.profileRepository.updateTargetRole(userId, targetRoleId);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return updated;
  }

  async addProject(userId: string, data: any): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      await this.createProfile(userId, {});
    }
    const updated = await this.profileRepository.addProject(userId, data);
    if (!updated) {
      throw new AppError("Failed to add project to portfolio", HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.DATABASE_ERROR);
    }
    return updated;
  }

  async updateProject(userId: string, projectId: string, data: any): Promise<IProfile> {
    const exists = await this.profileRepository.existsByUserId(userId);
    if (!exists) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateProject(userId, projectId, data);
    if (!updated) {
      throw new AppError("Failed to update project", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return updated;
  }

  async deleteProject(userId: string, projectId: string): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId, {});
    }

    await this.profileRepository.deleteProject(userId, projectId);

    if (profile.projects && profile.projects.length > 0) {
      profile.projects = profile.projects.filter(
        (p: any) =>
          p._id?.toString() !== projectId &&
          p.title !== projectId &&
          p.id !== projectId
      );
      await profile.save();
    }

    const doc = profile.toObject ? profile.toObject() : profile;
    (doc as any).completionPercentage = this.calculateProfileCompletion(doc);
    return doc as IProfile;
  }

  /**
   * Intelligently hydrates candidate profile from parsed resume data.
   * Performs non-destructive merge: existing custom user data is preserved.
   */
  async hydrateFromParsedResume(
    userId: string,
    extractedData: IResumeExtractedData | null,
    resumeDocument?: ResumeDocument | null
  ): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId, {});
    }

    // 1. Phone
    const phone =
      extractedData?.personalInfo?.phone ||
      resumeDocument?.contact?.phone ||
      "";
    if (!profile.phone && phone) {
      profile.phone = phone.trim();
    }

    // 2. Summary / Bio
    const summary =
      extractedData?.summary ||
      resumeDocument?.summary?.text ||
      "";
    if (!profile.bio && summary) {
      profile.bio = summary.trim();
    }

    // 3. Target Role / Headline
    const targetRole =
      resumeDocument?.summary?.targetRole ||
      extractedData?.experience?.[0]?.jobTitle ||
      "";
    if (!profile.targetRole && targetRole) {
      profile.targetRole = targetRole.trim();
    }
    if (!profile.headline && (targetRole || summary)) {
      profile.headline = targetRole ? `${targetRole}` : summary.slice(0, 80);
    }

    // 4. Location parsing
    const locStr =
      extractedData?.personalInfo?.location ||
      resumeDocument?.contact?.location ||
      "";
    if (locStr && (!profile.location || (!profile.location.city && !profile.location.country))) {
      const parts = locStr.split(",").map((p) => p.trim()).filter(Boolean);
      profile.location = {
        city: profile.location?.city || parts[0] || "",
        state: profile.location?.state || (parts.length > 1 ? parts[1] : ""),
        country:
          profile.location?.country ||
          (parts.length > 2
            ? parts.slice(2).join(", ")
            : parts.length === 2 && parts[1].length > 3
            ? parts[1]
            : ""),
      };
    }

    // 5. Links (GitHub, LinkedIn, Portfolio)
    if (!profile.links) {
      profile.links = { github: "", linkedin: "", portfolio: "" };
    }
    const linksList: Array<{ label?: string; url: string }> = resumeDocument?.contact?.links || [];
    for (const l of linksList) {
      const url = l.url;
      const lower = url.toLowerCase();
      if (lower.includes("github.com") && !profile.links.github) {
        profile.links.github = url;
      } else if (lower.includes("linkedin.com") && !profile.links.linkedin) {
        profile.links.linkedin = url;
      } else if (!profile.links.portfolio && !lower.includes("github.com") && !lower.includes("linkedin.com")) {
        profile.links.portfolio = url;
      }
    }

    if (extractedData?.personalInfo) {
      if (extractedData.personalInfo.github && !profile.links.github) {
        profile.links.github = extractedData.personalInfo.github;
      }
      if (extractedData.personalInfo.linkedin && !profile.links.linkedin) {
        profile.links.linkedin = extractedData.personalInfo.linkedin;
      }
      if (extractedData.personalInfo.portfolio && !profile.links.portfolio) {
        profile.links.portfolio = extractedData.personalInfo.portfolio;
      }
    }

    // 6. Skills
    const currentSkillNames = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    const rawSkills = extractedData?.skills || [];
    const docSkills = resumeDocument?.skills || [];

    for (const ds of docSkills) {
      if (ds.name && !currentSkillNames.has(ds.name.toLowerCase())) {
        currentSkillNames.add(ds.name.toLowerCase());
        profile.skills.push({
          name: ds.name.trim(),
          category: ds.category ? String(ds.category) : "Technical",
          level: ds.proficiency === "EXPERT" ? 5 : ds.proficiency === "ADVANCED" ? 4 : 3,
          proficiency:
            ds.proficiency
              ? ds.proficiency.charAt(0).toUpperCase() + ds.proficiency.slice(1).toLowerCase()
              : "Intermediate",
          score: ds.proficiency === "EXPERT" ? 95 : ds.proficiency === "ADVANCED" ? 90 : 80,
          source: SkillSource.RESUME,
          verified: false,
        });
      }
    }

    for (const rs of rawSkills) {
      if (rs.name && !currentSkillNames.has(rs.name.toLowerCase())) {
        currentSkillNames.add(rs.name.toLowerCase());
        profile.skills.push({
          name: rs.name.trim(),
          category: rs.category || "Technical",
          level: 3,
          proficiency: "Intermediate",
          score: 80,
          source: SkillSource.RESUME,
          verified: false,
        });
      }
    }

    // 7. Experience
    if (!profile.experience || profile.experience.length === 0) {
      const expList = extractedData?.experience || [];
      if (expList.length > 0) {
        profile.experience = expList.map((e) => ({
          companyName: e.companyName || "Unknown Company",
          jobTitle: e.jobTitle || "Engineer",
          startDate: e.startDate ? new Date(e.startDate) : null,
          endDate: e.endDate ? new Date(e.endDate) : null,
          isCurrent: !!e.isCurrent,
          description: e.description || null,
        }));
      } else if (resumeDocument?.experience && resumeDocument.experience.length > 0) {
        profile.experience = resumeDocument.experience.map((e) => ({
          companyName: e.companyName || "Unknown Company",
          jobTitle: e.jobTitle || "Engineer",
          startDate: e.startDate ? new Date(e.startDate) : null,
          endDate: e.endDate ? new Date(e.endDate) : null,
          isCurrent: !!e.isCurrent,
          description: e.bullets?.map((b) => b.text).join("\n") || null,
        }));
      }
    }

    // 8. Education
    const eduList = extractedData?.education || [];
    const docEduList = resumeDocument?.education || [];
    const currentInstMap = new Set(
      profile.education.map((e) => `${(e.institution || "").toLowerCase()}_${(e.degree || "").toLowerCase()}`)
    );

    for (const ed of eduList) {
      const key = `${(ed.institution || "").toLowerCase()}_${(ed.degree || "").toLowerCase()}`;
      if (ed.institution && !currentInstMap.has(key)) {
        currentInstMap.add(key);
        profile.education.push({
          institution: ed.institution.trim(),
          degree: ed.degree || null,
          fieldOfStudy: ed.fieldOfStudy || null,
          startYear: ed.startYear || null,
          endYear: ed.endYear || null,
        });
      }
    }

    for (const ded of docEduList) {
      const key = `${(ded.institution || "").toLowerCase()}_${(ded.degree || "").toLowerCase()}`;
      if (ded.institution && !currentInstMap.has(key)) {
        currentInstMap.add(key);
        profile.education.push({
          institution: ded.institution.trim(),
          degree: ded.degree || null,
          fieldOfStudy: ded.fieldOfStudy || null,
          startYear: ded.startDate ? parseInt(String(ded.startDate).slice(0, 4), 10) : null,
          endYear: ded.endDate ? parseInt(String(ded.endDate).slice(0, 4), 10) : null,
        });
      }
    }

    // 9. Projects
    // Purge legacy mock projects first
    const KNOWN_MOCK_TITLES = new Set([
      "skillezo ai — enterprise career intelligence platform",
      "distributed real-time job ingestion & crawler engine",
      "devflow — collaborative real-time code canvas",
      "devflow — real-time collaborative canvas",
      "cloudscale — distributed service mesh",
      "job ingestion worker pipeline",
    ]);

    profile.projects = (profile.projects || []).filter(
      (p: any) => !KNOWN_MOCK_TITLES.has((p.title || "").trim().toLowerCase())
    );

    const projList = extractedData?.projects || [];
    const docProjList = resumeDocument?.projects || [];
    const currentProjTitles = new Set(
      profile.projects.map((p) => (p.title || "").trim().toLowerCase())
    );

    for (const p of projList) {
      const existing = profile.projects.find(
        (proj: any) => (proj.title || "").trim().toLowerCase() === p.title.trim().toLowerCase()
      );
      const link = p.link || null;
      const githubUrl = p.githubUrl || (link && link.toLowerCase().includes("github.com") ? link : null);
      const liveDemoUrl = p.liveDemoUrl || (link && !link.toLowerCase().includes("github.com") ? link : null);

      if (existing) {
        if (!existing.githubUrl && githubUrl) existing.githubUrl = githubUrl;
        if (!existing.liveDemoUrl && liveDemoUrl) existing.liveDemoUrl = liveDemoUrl;
        if ((!existing.techStack || existing.techStack.length === 0) && p.technologies?.length) {
          existing.techStack = p.technologies;
        }
      } else if (p.title && !currentProjTitles.has(p.title.trim().toLowerCase())) {
        currentProjTitles.add(p.title.trim().toLowerCase());
        profile.projects.push({
          title: p.title.trim(),
          description: p.description || "",
          techStack: Array.isArray(p.technologies) ? p.technologies : [],
          githubUrl,
          liveDemoUrl,
          featured: false,
        } as any);
      }
    }

    for (const dp of docProjList) {
      const existing = profile.projects.find(
        (proj: any) => (proj.title || "").trim().toLowerCase() === dp.title.trim().toLowerCase()
      );
      const link = dp.link || null;
      const githubUrl = link && link.toLowerCase().includes("github.com") ? link : null;
      const liveDemoUrl = link && !link.toLowerCase().includes("github.com") ? link : null;

      if (existing) {
        if (!existing.githubUrl && githubUrl) existing.githubUrl = githubUrl;
        if (!existing.liveDemoUrl && liveDemoUrl) existing.liveDemoUrl = liveDemoUrl;
      } else if (dp.title && !currentProjTitles.has(dp.title.trim().toLowerCase())) {
        currentProjTitles.add(dp.title.trim().toLowerCase());
        profile.projects.push({
          title: dp.title.trim(),
          description: dp.description || dp.bullets?.map((b: any) => typeof b === "string" ? b : b?.text || "").join(". ") || "",
          techStack: Array.isArray(dp.technologies) ? dp.technologies : [],
          githubUrl,
          liveDemoUrl,
          featured: false,
        } as any);
      }
    }

    // Recalculate profile completion
    profile.completionPercentage = this.calculateProfileCompletion(profile);

    await profile.save();
    return this.getMyProfile(userId);
  }

  /**
   * Syncs candidate profile from their default or latest uploaded resume.
   */
  async syncResumeProfile(userId: string): Promise<IProfile> {
    const defaultResume =
      (await this.resumeRepository.findDefaultByUserId(userId)) ||
      (await this.resumeRepository.findByUserId(userId))[0];

    if (!defaultResume) {
      throw new AppError("No resume found. Please upload a resume first.", HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESUME_NOT_FOUND);
    }

    let extractedData = defaultResume.extractedData || null;

    if (defaultResume.storageKey && (await resumeStorageService.exists(defaultResume.storageKey))) {
      try {
        const absPath = resumeStorageService.getAbsolutePath(defaultResume.storageKey);
        if (fs.existsSync(absPath)) {
          const buf = fs.readFileSync(absPath);
          extractedData = await resumeParserService.parseResumeBuffer(buf);
          defaultResume.extractedData = extractedData;
          await (defaultResume as any).save?.();
        }
      } catch {
        // Fall back gracefully to existing extractedData
      }
    }

    return await this.hydrateFromParsedResume(
      userId,
      extractedData,
      defaultResume.resumeDocument || null
    );
  }
}

