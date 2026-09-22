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
import {
  IProfile,
  IProfileSkill,
  IProfileEducation,
  IProfileExperience,
  IProfileLinks,
  IProfileProject,
  IProfileCompleteness,
  IProfileCompletenessSection,
  ProfileModel,
} from "@/database/models/Profile.model";
import { SkillSource } from "@/core/constants/enums";

export class ProfileService {
  private readonly profileRepository: ProfileRepository;
  private readonly resumeRepository: ResumeRepository;

  constructor(profileRepository?: ProfileRepository, resumeRepository?: ResumeRepository) {
    this.profileRepository = profileRepository || new ProfileRepository();
    this.resumeRepository = resumeRepository || new ResumeRepository();
  }

  /**
   * Computes comprehensive, deterministic 8-section completeness and actionable missing fields.
   * Total score strictly adheres to existing 100-point product weights.
   */
  public calculateDetailedCompleteness(profile: Partial<IProfile>): IProfileCompleteness {
    const missingFields: string[] = [];

    // 1. Identity section (max 40: base account 10, headline 15, targetRole 15)
    let identityScore = 10;
    const identityMissing: string[] = [];
    if (profile.headline && profile.headline.trim().length > 0) {
      identityScore += 15;
    } else {
      identityMissing.push("headline");
      missingFields.push("headline");
    }
    if (profile.targetRole && profile.targetRole.trim().length > 0) {
      identityScore += 15;
    } else {
      identityMissing.push("targetRole");
      missingFields.push("targetRole");
    }
    const identitySection: IProfileCompletenessSection = {
      status: identityMissing.length === 0 ? "COMPLETE" : identityScore > 10 ? "INCOMPLETE" : "EMPTY",
      score: identityScore,
      weight: 40,
      missingFields: identityMissing,
    };

    // 2. Contact section (max 10: phone 5, location 5)
    let contactScore = 0;
    const contactMissing: string[] = [];
    if (profile.phone && profile.phone.trim().length > 0) {
      contactScore += 5;
    } else {
      contactMissing.push("phone");
      missingFields.push("phone");
    }
    if (profile.location?.city || profile.location?.country) {
      contactScore += 5;
    } else {
      contactMissing.push("location");
      missingFields.push("location");
    }
    const contactSection: IProfileCompletenessSection = {
      status: contactMissing.length === 0 ? "COMPLETE" : contactScore > 0 ? "INCOMPLETE" : "EMPTY",
      score: contactScore,
      weight: 10,
      missingFields: contactMissing,
    };

    // 3. Summary section (max 10: bio > 20)
    let summaryScore = 0;
    const summaryMissing: string[] = [];
    if (profile.bio && profile.bio.trim().length > 20) {
      summaryScore += 10;
    } else {
      summaryMissing.push("bio (at least 20 characters)");
      missingFields.push("bio (at least 20 characters)");
    }
    const summarySection: IProfileCompletenessSection = {
      status: summaryMissing.length === 0 ? "COMPLETE" : "EMPTY",
      score: summaryScore,
      weight: 10,
      missingFields: summaryMissing,
    };

    // 4. Skills section (max 25: skills >= 3: 15, verified >= 1: 10)
    let skillsScore = 0;
    const skillsMissing: string[] = [];
    const skillsCount = profile.skills?.length || 0;
    const hasVerified = profile.skills ? profile.skills.some((s) => s.verified) : false;
    if (skillsCount >= 3) {
      skillsScore += 15;
    } else {
      skillsMissing.push("skills (at least 3)");
      missingFields.push("skills (at least 3)");
    }
    if (hasVerified) {
      skillsScore += 10;
    } else {
      skillsMissing.push("verified skill (at least 1)");
      missingFields.push("verified skill (at least 1)");
    }
    const skillsSection: IProfileCompletenessSection = {
      status: skillsMissing.length === 0 ? "COMPLETE" : skillsScore > 0 ? "INCOMPLETE" : "EMPTY",
      score: skillsScore,
      weight: 25,
      missingFields: skillsMissing,
    };

    // 5. Experience section (weight 0, informational)
    const experienceCount = profile.experience?.length || 0;
    const expMissing: string[] = [];
    if (experienceCount === 0) {
      expMissing.push("experience");
      missingFields.push("experience");
    }
    const experienceSection: IProfileCompletenessSection = {
      status: experienceCount > 0 ? "COMPLETE" : "EMPTY",
      score: 0,
      weight: 0,
      missingFields: expMissing,
    };

    // 6. Projects section (max 10: projects >= 1: 10)
    let projectsScore = 0;
    const projMissing: string[] = [];
    const projectsCount = profile.projects?.length || 0;
    if (projectsCount >= 1) {
      projectsScore += 10;
    } else {
      projMissing.push("projects (at least 1)");
      missingFields.push("projects (at least 1)");
    }
    const projectsSection: IProfileCompletenessSection = {
      status: projectsCount > 0 ? "COMPLETE" : "EMPTY",
      score: projectsScore,
      weight: 10,
      missingFields: projMissing,
    };

    // 7. Education section (weight 0, informational)
    const eduCount = profile.education?.length || 0;
    const eduMissing: string[] = [];
    if (eduCount === 0) {
      eduMissing.push("education");
      missingFields.push("education");
    }
    const educationSection: IProfileCompletenessSection = {
      status: eduCount > 0 ? "COMPLETE" : "EMPTY",
      score: 0,
      weight: 0,
      missingFields: eduMissing,
    };

    // 8. Links section (max 5: github, linkedin, or portfolio)
    let linksScore = 0;
    const linksMissing: string[] = [];
    if (profile.links?.github || profile.links?.portfolio || profile.links?.linkedin) {
      linksScore += 5;
    } else {
      linksMissing.push("portfolio or professional links");
      missingFields.push("portfolio or professional links");
    }
    const linksSection: IProfileCompletenessSection = {
      status: linksMissing.length === 0 ? "COMPLETE" : "EMPTY",
      score: linksScore,
      weight: 5,
      missingFields: linksMissing,
    };

    const totalScore = Math.min(
      identityScore + contactScore + summaryScore + skillsScore + projectsScore + linksScore,
      100
    );

    return {
      score: totalScore,
      missingFields,
      sections: {
        identity: identitySection,
        contact: contactSection,
        summary: summarySection,
        skills: skillsSection,
        experience: experienceSection,
        projects: projectsSection,
        education: educationSection,
        links: linksSection,
      },
      lastCalculatedAt: new Date(),
    };
  }

  public calculateProfileCompletion(profile: Partial<IProfile>): number {
    return this.calculateDetailedCompleteness(profile).score;
  }

  /**
   * Deterministically normalizes and captures a canonical snapshot of all persistent career facts.
   * Used to guarantee profileVersion increments ONLY on material mutations across all canonical facts.
   */
  public extractCanonicalSnapshot(p: Partial<IProfile>): string {
    return JSON.stringify({
      headline: (p.headline || "").trim(),
      phone: (p.phone || "").trim(),
      targetRole: (p.targetRole || "").trim(),
      targetRoleId: p.targetRoleId ? String(p.targetRoleId) : "",
      bio: (p.bio || "").trim(),
      location: {
        city: (p.location?.city || "").trim().toLowerCase(),
        state: (p.location?.state || "").trim().toLowerCase(),
        country: (p.location?.country || "").trim().toLowerCase(),
      },
      links: {
        github: (p.links?.github || "").trim().toLowerCase(),
        linkedin: (p.links?.linkedin || "").trim().toLowerCase(),
        portfolio: (p.links?.portfolio || "").trim().toLowerCase(),
      },
      skills: (p.skills || [])
        .map((s) => ({
          name: (s.name || "").trim().toLowerCase(),
          category: (s.category || "").trim().toLowerCase(),
          level: s.level ?? 3,
          proficiency: (s.proficiency || "").trim().toLowerCase(),
          verified: !!s.verified,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      experience: (p.experience || [])
        .map((e) => ({
          companyName: (e.companyName || "").trim().toLowerCase(),
          jobTitle: (e.jobTitle || "").trim().toLowerCase(),
          startDate: e.startDate ? new Date(e.startDate).toISOString().slice(0, 10) : "",
          endDate: e.endDate ? new Date(e.endDate).toISOString().slice(0, 10) : "",
          isCurrent: !!e.isCurrent,
          description: (e.description || "").trim(),
          bullets: (e.bullets || []).map((b) => b.trim()).filter(Boolean),
          technologiesUsed: (e.technologiesUsed || []).map((t) => t.trim().toLowerCase()).sort(),
        }))
        .sort((a, b) => (a.companyName + a.jobTitle + a.startDate).localeCompare(b.companyName + b.jobTitle + b.startDate)),
      education: (p.education || [])
        .map((ed) => ({
          institution: (ed.institution || "").trim().toLowerCase(),
          degree: (ed.degree || "").trim().toLowerCase(),
          fieldOfStudy: (ed.fieldOfStudy || "").trim().toLowerCase(),
          startYear: ed.startYear ?? null,
          endYear: ed.endYear ?? null,
        }))
        .sort((a, b) => (a.institution + (a.degree || "")).localeCompare(b.institution + (b.degree || ""))),
      projects: (p.projects || [])
        .map((pr: any) => ({
          title: (pr.title || "").trim().toLowerCase(),
          description: (pr.description || "").trim(),
          techStack: (pr.techStack || []).map((t: string) => t.trim().toLowerCase()).sort(),
          githubUrl: (pr.githubUrl || "").trim().toLowerCase(),
          liveDemoUrl: (pr.liveDemoUrl || "").trim().toLowerCase(),
        }))
        .sort((a: any, b: any) => a.title.localeCompare(b.title)),
    });
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
      profileVersion: 1,
    };

    const completeness = this.calculateDetailedCompleteness(profileData);
    profileData.completeness = completeness;
    profileData.completionPercentage = completeness.score;

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
      if (typeof profile.save === "function") {
        await profile.save();
      }
    }

    const doc = profile.toObject ? profile.toObject() : profile;
    const completeness = this.calculateDetailedCompleteness(doc);
    (doc as any).completeness = completeness;
    (doc as any).completionPercentage = completeness.score;
    if (!(doc as any).profileVersion) {
      (doc as any).profileVersion = 1;
    }
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

    const currentDoc = profile.toObject ? profile.toObject() : profile;
    const mergedForCheck = { ...currentDoc, ...updatePayload };
    const snapshotBefore = this.extractCanonicalSnapshot(currentDoc);
    const snapshotAfter = this.extractCanonicalSnapshot(mergedForCheck);

    if (snapshotBefore !== snapshotAfter) {
      updatePayload.profileVersion = (profile.profileVersion || 1) + 1;
    }

    const completeness = this.calculateDetailedCompleteness(mergedForCheck);
    updatePayload.completeness = completeness;
    updatePayload.completionPercentage = completeness.score;

    const updated = await this.profileRepository.updateByUserId(userId, { $set: updatePayload });
    if (!updated) {
      throw new AppError(
        "Candidate profile not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.PROFILE_NOT_FOUND
      );
    }
    const doc = updated.toObject ? updated.toObject() : updated;
    (doc as any).completeness = completeness;
    (doc as any).completionPercentage = completeness.score;
    return doc as IProfile;
  }

  async addSkill(userId: string, skill: ProfileSkillDTO): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId, { skills: [skill] });
      return profile;
    }

    const snapshotBefore = this.extractCanonicalSnapshot(profile);
    const existsIndex = profile.skills.findIndex((s) => s.name.trim().toLowerCase() === skill.name.trim().toLowerCase());
    const newSkill: IProfileSkill = {
      name: skill.name.trim(),
      category: skill.category || "Technical",
      level: skill.level || 4,
      proficiency: skill.proficiency || "Advanced",
      score: skill.score || 88,
      source: skill.source || SkillSource.PROFILE,
      verified: skill.verified || false,
      evidenceIds: skill.evidenceIds || [],
    };

    if (existsIndex >= 0) {
      profile.skills[existsIndex] = newSkill;
    } else {
      profile.skills.push(newSkill);
    }

    const snapshotAfter = this.extractCanonicalSnapshot(profile);
    if (snapshotBefore !== snapshotAfter) {
      profile.profileVersion = (profile.profileVersion || 1) + 1;
    }

    const completeness = this.calculateDetailedCompleteness(profile);
    profile.completeness = completeness;
    profile.completionPercentage = completeness.score;

    if (typeof profile.save === "function") {
      await profile.save();
    }
    return this.getMyProfile(userId);
  }

  async deleteSkill(userId: string, skillName: string): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }

    const snapshotBefore = this.extractCanonicalSnapshot(profile);
    profile.skills = profile.skills.filter((s) => s.name.toLowerCase() !== decodeURIComponent(skillName).toLowerCase());
    const snapshotAfter = this.extractCanonicalSnapshot(profile);

    if (snapshotBefore !== snapshotAfter) {
      profile.profileVersion = (profile.profileVersion || 1) + 1;
    }

    const completeness = this.calculateDetailedCompleteness(profile);
    profile.completeness = completeness;
    profile.completionPercentage = completeness.score;

    if (typeof profile.save === "function") {
      await profile.save();
    }
    return this.getMyProfile(userId);
  }

  async updateSkills(userId: string, dto: UpdateSkillsDTO): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateSkills(userId, dto.skills as IProfileSkill[]);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return this.getMyProfile(userId);
  }

  async updateEducation(userId: string, dto: UpdateEducationDTO): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateEducation(userId, dto.education as IProfileEducation[]);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return this.getMyProfile(userId);
  }

  async updateExperience(userId: string, dto: UpdateExperienceDTO): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateExperience(userId, dto.experience as IProfileExperience[]);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return this.getMyProfile(userId);
  }

  async updateLinks(userId: string, dto: UpdateLinksDTO): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const updated = await this.profileRepository.updateLinks(userId, dto.links as IProfileLinks);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return this.getMyProfile(userId);
  }

  async updateTargetRole(userId: string, dto: UpdateTargetRoleDTO): Promise<IProfile> {
    const profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    const targetRoleId = dto.targetRoleId ? new Types.ObjectId(dto.targetRoleId) : null;
    const updated = await this.profileRepository.updateTargetRole(userId, targetRoleId);
    if (!updated) {
      throw new AppError("Candidate profile not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.PROFILE_NOT_FOUND);
    }
    return this.getMyProfile(userId);
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
    return this.getMyProfile(userId);
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
    return this.getMyProfile(userId);
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
      if (typeof profile.save === "function") {
        await profile.save();
      }
    }

    return this.getMyProfile(userId);
  }

  /**
   * Intelligently hydrates candidate profile from parsed resume data.
   * Performs high-integrity, deterministic, source-grounded normalization:
   * - Preserves existing manual modifications and verified credentials.
   * - Experience deduplication adheres strictly to the Insufficient Identity Rule:
   *   Partial or ambiguous experiences without sufficient anchors are preserved as distinct.
   * - Profile version increments ONLY if persistent career facts materially change.
   * - Links Phase 1 evidence IDs for clear provenance.
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

    // Capture snapshot before hydration to detect material changes
    const snapshotBefore = this.extractCanonicalSnapshot(profile);

    // 1. Phone (preserve existing non-empty)
    const phone =
      extractedData?.personalInfo?.phone ||
      resumeDocument?.contact?.phone ||
      "";
    if (!profile.phone && phone) {
      profile.phone = phone.trim();
    }

    // 2. Summary / Bio (preserve existing non-empty)
    const summary =
      extractedData?.summary ||
      resumeDocument?.summary?.text ||
      "";
    if (!profile.bio && summary) {
      profile.bio = summary.trim();
    }

    // 3. Target Role / Headline (preserve existing non-empty)
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

    // 4. Location parsing (preserve existing non-empty)
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

    // 5. Links (GitHub, LinkedIn, Portfolio) - preserve existing non-empty
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

    // 6. Skills: Merge non-destructively, preserving manual & verified statuses, attaching Phase 1 evidence IDs
    if (!profile.skills) {
      profile.skills = [];
    }

    const docSkills = resumeDocument?.skills || [];
    const rawSkills = extractedData?.skills || [];
    const docEvidence = resumeDocument?.evidence || [];

    const getSkillEvidenceIds = (skillName: string, docSkillEvidenceIds?: string[]): string[] => {
      const ids = new Set<string>(docSkillEvidenceIds || []);
      const lower = skillName.toLowerCase();
      for (const ev of docEvidence) {
        if (ev.type === "SKILL" && ev.value && ev.value.trim().toLowerCase() === lower && ev.id) {
          ids.add(ev.id);
        }
      }
      return Array.from(ids);
    };

    // First process docSkills (which have rich AST data and evidenceIds)
    for (const ds of docSkills) {
      if (!ds.name || !ds.name.trim()) continue;
      const normName = ds.name.trim().toLowerCase();
      const existing = profile.skills.find((s) => s.name.trim().toLowerCase() === normName);
      const evIds = getSkillEvidenceIds(ds.name, ds.evidenceIds);

      if (existing) {
        // PRESERVE existing source and verified status if verified or non-RESUME
        if (!existing.verified && existing.source === SkillSource.RESUME) {
          const incomingLevel = ds.proficiency === "EXPERT" ? 5 : ds.proficiency === "ADVANCED" ? 4 : 3;
          if (incomingLevel > existing.level) {
            existing.level = incomingLevel;
            existing.proficiency = ds.proficiency
              ? ds.proficiency.charAt(0).toUpperCase() + ds.proficiency.slice(1).toLowerCase()
              : existing.proficiency;
            existing.score = ds.proficiency === "EXPERT" ? 95 : ds.proficiency === "ADVANCED" ? 90 : 80;
          }
        }
        if (evIds.length > 0) {
          const combined = new Set([...(existing.evidenceIds || []), ...evIds]);
          existing.evidenceIds = Array.from(combined);
        }
      } else {
        profile.skills.push({
          name: ds.name.trim(),
          category: ds.category ? String(ds.category) : "Technical",
          level: ds.proficiency === "EXPERT" ? 5 : ds.proficiency === "ADVANCED" ? 4 : 3,
          proficiency: ds.proficiency
            ? ds.proficiency.charAt(0).toUpperCase() + ds.proficiency.slice(1).toLowerCase()
            : "Intermediate",
          score: ds.proficiency === "EXPERT" ? 95 : ds.proficiency === "ADVANCED" ? 90 : 80,
          source: SkillSource.RESUME,
          verified: false,
          evidenceIds: evIds.length > 0 ? evIds : undefined,
        });
      }
    }

    // Process rawSkills as fallback for anything not covered in docSkills
    for (const rs of rawSkills) {
      if (!rs.name || !rs.name.trim()) continue;
      const normName = rs.name.trim().toLowerCase();
      const existing = profile.skills.find((s) => s.name.trim().toLowerCase() === normName);
      const evIds = getSkillEvidenceIds(rs.name);

      if (existing) {
        if (evIds.length > 0) {
          const combined = new Set([...(existing.evidenceIds || []), ...evIds]);
          existing.evidenceIds = Array.from(combined);
        }
      } else {
        profile.skills.push({
          name: rs.name.trim(),
          category: rs.category || "Technical",
          level: 3,
          proficiency: "Intermediate",
          score: 80,
          source: SkillSource.RESUME,
          verified: false,
          evidenceIds: evIds.length > 0 ? evIds : undefined,
        });
      }
    }

    // 7. Experience: Intelligent deduplication with explicit Insufficient Identity Rule
    if (!profile.experience) {
      profile.experience = [];
    }

    interface IncomingExp {
      companyName?: string | null;
      jobTitle?: string | null;
      startDate?: Date | null;
      endDate?: Date | null;
      isCurrent?: boolean;
      description?: string | null;
      bullets?: string[];
      technologiesUsed?: string[];
      evidenceIds?: string[];
    }

    const incomingExperiences: IncomingExp[] = [];

    if (resumeDocument?.experience && resumeDocument.experience.length > 0) {
      for (const e of resumeDocument.experience) {
        const itemEvidenceIds = new Set<string>();
        if (e.bullets) {
          for (const b of e.bullets) {
            if (b.evidenceIds) {
              b.evidenceIds.forEach((id) => itemEvidenceIds.add(id));
            }
          }
        }
        for (const ev of docEvidence) {
          if (
            ev.itemId === e.id ||
            (ev.type === "EMPLOYER" && e.companyName && ev.value === e.companyName) ||
            (ev.type === "TITLE" && e.jobTitle && ev.value === e.jobTitle)
          ) {
            if (ev.id) itemEvidenceIds.add(ev.id);
          }
        }

        incomingExperiences.push({
          companyName: e.companyName?.trim() || null,
          jobTitle: e.jobTitle?.trim() || null,
          startDate: e.startDate ? new Date(e.startDate) : null,
          endDate: e.endDate ? new Date(e.endDate) : null,
          isCurrent: !!e.isCurrent,
          description: e.bullets?.map((b) => b.text).join("\n") || null,
          bullets: e.bullets?.map((b) => b.text).filter(Boolean) || [],
          technologiesUsed: e.technologiesUsed || [],
          evidenceIds: Array.from(itemEvidenceIds),
        });
      }
    } else if (extractedData?.experience && extractedData.experience.length > 0) {
      for (const e of extractedData.experience) {
        incomingExperiences.push({
          companyName: e.companyName?.trim() || null,
          jobTitle: e.jobTitle?.trim() || null,
          startDate: e.startDate ? new Date(e.startDate) : null,
          endDate: e.endDate ? new Date(e.endDate) : null,
          isCurrent: !!e.isCurrent,
          description: e.description || null,
          bullets: e.description ? [e.description] : [],
          technologiesUsed: [],
          evidenceIds: [],
        });
      }
    }

    // Merge each incoming experience into profile.experience
    for (const inc of incomingExperiences) {
      const comp = (inc.companyName || "").trim().toLowerCase();
      const title = (inc.jobTitle || "").trim().toLowerCase();
      const startIso =
        inc.startDate && !isNaN(inc.startDate.getTime()) ? inc.startDate.toISOString().slice(0, 10) : "";

      // Insufficient Identity Rule:
      // If identity fields are insufficient (neither company nor title, or ambiguous missing anchors),
      // preserve the entry as distinct rather than collapsing it.
      const hasSufficientIdentity =
        (comp.length > 0 && title.length > 0) ||
        (comp.length > 0 && startIso.length > 0) ||
        (title.length > 0 && startIso.length > 0);

      let matchedIndex = -1;

      if (hasSufficientIdentity) {
        matchedIndex = profile.experience.findIndex((ex) => {
          const exComp = (ex.companyName || "").trim().toLowerCase();
          const exTitle = (ex.jobTitle || "").trim().toLowerCase();
          const exStartIso =
            ex.startDate && !isNaN(new Date(ex.startDate).getTime())
              ? new Date(ex.startDate).toISOString().slice(0, 10)
              : "";

          // 1. Match company and title
          if (comp.length > 0 && title.length > 0 && exComp === comp && exTitle === title) {
            return !startIso || !exStartIso || startIso === exStartIso;
          }
          // 2. Match company and start date
          if (comp.length > 0 && startIso.length > 0 && exComp === comp && exStartIso === startIso) {
            return true;
          }
          // 3. Match title and start date
          if (title.length > 0 && startIso.length > 0 && exTitle === title && exStartIso === startIso) {
            return true;
          }
          return false;
        });
      }

      if (matchedIndex >= 0) {
        // Safe non-destructive merge into existing experience
        const existing = profile.experience[matchedIndex];
        if (!existing.companyName && inc.companyName) existing.companyName = inc.companyName;
        if (!existing.jobTitle && inc.jobTitle) existing.jobTitle = inc.jobTitle;
        if (!existing.startDate && inc.startDate) existing.startDate = inc.startDate;
        if (!existing.endDate && inc.endDate) existing.endDate = inc.endDate;
        if (inc.isCurrent !== undefined) existing.isCurrent = inc.isCurrent || existing.isCurrent;
        if (!existing.description && inc.description) existing.description = inc.description;

        // Merge bullets non-destructively
        if (inc.bullets && inc.bullets.length > 0) {
          const currentBullets = existing.bullets || [];
          const currentBulletSet = new Set(currentBullets.map((b) => b.trim().toLowerCase()));
          for (const b of inc.bullets) {
            if (b.trim() && !currentBulletSet.has(b.trim().toLowerCase())) {
              currentBullets.push(b.trim());
              currentBulletSet.add(b.trim().toLowerCase());
            }
          }
          existing.bullets = currentBullets;
        }

        // Merge technologiesUsed
        if (inc.technologiesUsed && inc.technologiesUsed.length > 0) {
          const currentTech = existing.technologiesUsed || [];
          const currentTechSet = new Set(currentTech.map((t) => t.trim().toLowerCase()));
          for (const t of inc.technologiesUsed) {
            if (t.trim() && !currentTechSet.has(t.trim().toLowerCase())) {
              currentTech.push(t.trim());
              currentTechSet.add(t.trim().toLowerCase());
            }
          }
          existing.technologiesUsed = currentTech;
        }

        // Merge Phase 1 evidence IDs
        if (inc.evidenceIds && inc.evidenceIds.length > 0) {
          const existingEvIds = new Set(existing.evidenceIds || []);
          inc.evidenceIds.forEach((id) => existingEvIds.add(id));
          existing.evidenceIds = Array.from(existingEvIds);
        }
      } else {
        // Insufficient identity or no match: preserve entry as distinct without fabricating fake names
        profile.experience.push({
          companyName: inc.companyName || null,
          jobTitle: inc.jobTitle || null,
          startDate: inc.startDate || null,
          endDate: inc.endDate || null,
          isCurrent: !!inc.isCurrent,
          description: inc.description || null,
          bullets: inc.bullets || [],
          technologiesUsed: inc.technologiesUsed || [],
          evidenceIds: inc.evidenceIds && inc.evidenceIds.length > 0 ? inc.evidenceIds : undefined,
        });
      }
    }

    // 8. Education: Deduplicate with non-destructive merge and Phase 1 evidence IDs
    if (!profile.education) {
      profile.education = [];
    }
    const eduList = extractedData?.education || [];
    const docEduList = resumeDocument?.education || [];

    const getEduEvidenceIds = (edId?: string, institution?: string | null, degree?: string | null): string[] => {
      const ids = new Set<string>();
      for (const ev of docEvidence) {
        if (
          (edId && ev.itemId === edId) ||
          (institution && ev.type === "INSTITUTION" && ev.value && ev.value.trim().toLowerCase() === institution.trim().toLowerCase()) ||
          (degree && ev.type === "DEGREE" && ev.value && ev.value.trim().toLowerCase() === degree.trim().toLowerCase())
        ) {
          if (ev.id) ids.add(ev.id);
        }
      }
      return Array.from(ids);
    };

    for (const ded of docEduList) {
      const instNorm = (ded.institution || "").trim().toLowerCase();
      const degNorm = (ded.degree || "").trim().toLowerCase();
      const startYr = ded.startDate ? parseInt(String(ded.startDate).slice(0, 4), 10) : null;
      const endYr = ded.endDate ? parseInt(String(ded.endDate).slice(0, 4), 10) : null;
      const evIds = getEduEvidenceIds(ded.id, ded.institution, ded.degree);

      const matched = instNorm
        ? profile.education.find((e) => {
            const eInst = (e.institution || "").trim().toLowerCase();
            const eDeg = (e.degree || "").trim().toLowerCase();
            return eInst === instNorm && (!degNorm || !eDeg || degNorm === eDeg);
          })
        : null;

      if (matched) {
        if (!matched.degree && ded.degree) matched.degree = ded.degree;
        if (!matched.fieldOfStudy && ded.fieldOfStudy) matched.fieldOfStudy = ded.fieldOfStudy;
        if (!matched.startYear && startYr && !isNaN(startYr)) matched.startYear = startYr;
        if (!matched.endYear && endYr && !isNaN(endYr)) matched.endYear = endYr;
        if (evIds.length > 0) {
          const combined = new Set([...(matched.evidenceIds || []), ...evIds]);
          matched.evidenceIds = Array.from(combined);
        }
      } else if (ded.institution && ded.institution.trim()) {
        profile.education.push({
          institution: ded.institution.trim(),
          degree: ded.degree || null,
          fieldOfStudy: ded.fieldOfStudy || null,
          startYear: startYr && !isNaN(startYr) ? startYr : null,
          endYear: endYr && !isNaN(endYr) ? endYr : null,
          evidenceIds: evIds.length > 0 ? evIds : undefined,
        });
      }
    }

    for (const ed of eduList) {
      const instNorm = (ed.institution || "").trim().toLowerCase();
      const degNorm = (ed.degree || "").trim().toLowerCase();
      const evIds = getEduEvidenceIds(undefined, ed.institution, ed.degree);

      const matched = instNorm
        ? profile.education.find((e) => {
            const eInst = (e.institution || "").trim().toLowerCase();
            const eDeg = (e.degree || "").trim().toLowerCase();
            return eInst === instNorm && (!degNorm || !eDeg || degNorm === eDeg);
          })
        : null;

      if (matched) {
        if (!matched.degree && ed.degree) matched.degree = ed.degree;
        if (!matched.fieldOfStudy && ed.fieldOfStudy) matched.fieldOfStudy = ed.fieldOfStudy;
        if (!matched.startYear && ed.startYear) matched.startYear = ed.startYear;
        if (!matched.endYear && ed.endYear) matched.endYear = ed.endYear;
        if (evIds.length > 0) {
          const combined = new Set([...(matched.evidenceIds || []), ...evIds]);
          matched.evidenceIds = Array.from(combined);
        }
      } else if (ed.institution && ed.institution.trim()) {
        profile.education.push({
          institution: ed.institution.trim(),
          degree: ed.degree || null,
          fieldOfStudy: ed.fieldOfStudy || null,
          startYear: ed.startYear || null,
          endYear: ed.endYear || null,
          evidenceIds: evIds.length > 0 ? evIds : undefined,
        });
      }
    }

    // 9. Projects: Purge legacy mock projects first
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

    const getProjEvidenceIds = (projId?: string, title?: string | null): string[] => {
      const ids = new Set<string>();
      for (const ev of docEvidence) {
        if (
          (projId && ev.itemId === projId) ||
          (title && ev.type === "PROJECT_CLAIM" && ev.value && ev.value.trim().toLowerCase().includes(title.trim().toLowerCase()))
        ) {
          if (ev.id) ids.add(ev.id);
        }
      }
      return Array.from(ids);
    };

    for (const dp of docProjList) {
      if (!dp.title || !dp.title.trim()) continue;
      const normTitle = dp.title.trim().toLowerCase();
      const existing = profile.projects.find(
        (proj: any) => (proj.title || "").trim().toLowerCase() === normTitle
      );
      const link = dp.link || null;
      const githubUrl = dp.repoUrl || (link && link.toLowerCase().includes("github.com") ? link : null);
      const liveDemoUrl = link && !link.toLowerCase().includes("github.com") ? link : null;
      const evIds = getProjEvidenceIds(dp.id, dp.title);

      if (existing) {
        if (!existing.githubUrl && githubUrl) existing.githubUrl = githubUrl;
        if (!existing.liveDemoUrl && liveDemoUrl) existing.liveDemoUrl = liveDemoUrl;
        if ((!existing.techStack || existing.techStack.length === 0) && dp.technologies?.length) {
          existing.techStack = dp.technologies;
        }
        if (evIds.length > 0) {
          const combined = new Set([...(existing.evidenceIds || []), ...evIds]);
          existing.evidenceIds = Array.from(combined);
        }
      } else {
        profile.projects.push({
          title: dp.title.trim(),
          description: dp.description || dp.bullets?.join(". ") || "",
          techStack: Array.isArray(dp.technologies) ? dp.technologies : [],
          githubUrl,
          liveDemoUrl,
          featured: false,
          evidenceIds: evIds.length > 0 ? evIds : undefined,
        } as any);
      }
    }

    for (const p of projList) {
      if (!p.title || !p.title.trim()) continue;
      const normTitle = p.title.trim().toLowerCase();
      const existing = profile.projects.find(
        (proj: any) => (proj.title || "").trim().toLowerCase() === normTitle
      );
      const link = p.link || null;
      const githubUrl = p.githubUrl || (link && link.toLowerCase().includes("github.com") ? link : null);
      const liveDemoUrl = p.liveDemoUrl || (link && !link.toLowerCase().includes("github.com") ? link : null);
      const evIds = getProjEvidenceIds(undefined, p.title);

      if (existing) {
        if (!existing.githubUrl && githubUrl) existing.githubUrl = githubUrl;
        if (!existing.liveDemoUrl && liveDemoUrl) existing.liveDemoUrl = liveDemoUrl;
        if ((!existing.techStack || existing.techStack.length === 0) && p.technologies?.length) {
          existing.techStack = p.technologies;
        }
        if (evIds.length > 0) {
          const combined = new Set([...(existing.evidenceIds || []), ...evIds]);
          existing.evidenceIds = Array.from(combined);
        }
      } else {
        profile.projects.push({
          title: p.title.trim(),
          description: p.description || "",
          techStack: Array.isArray(p.technologies) ? p.technologies : [],
          githubUrl,
          liveDemoUrl,
          featured: false,
          evidenceIds: evIds.length > 0 ? evIds : undefined,
        } as any);
      }
    }

    // 10. Check if material changes occurred to canonical career facts
    const snapshotAfter = this.extractCanonicalSnapshot(profile);
    if (snapshotBefore !== snapshotAfter) {
      profile.profileVersion = (profile.profileVersion || 1) + 1;
    } else if (!profile.profileVersion) {
      profile.profileVersion = 1;
    }

    // 11. Recalculate deterministic profile completeness and score
    const completeness = this.calculateDetailedCompleteness(profile);
    profile.completeness = completeness;
    profile.completionPercentage = completeness.score;

    if (typeof profile.save === "function") {
      await profile.save();
    }
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


