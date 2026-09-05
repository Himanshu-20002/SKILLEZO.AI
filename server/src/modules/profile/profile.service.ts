import { ProfileRepository } from "@/database/repositories/profile/ProfileRepository";
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

  constructor(profileRepository?: ProfileRepository) {
    this.profileRepository = profileRepository || new ProfileRepository();
  }

  public calculateProfileCompletion(profile: Partial<IProfile>): number {
    let score = 30; // base score for account registration
    if (profile.headline) score += 15;
    if (profile.bio && profile.bio.length > 20) score += 15;
    if (profile.location?.city || profile.location?.country) score += 10;
    if (profile.phone) score += 10;
    if (profile.skills && profile.skills.length >= 3) score += 12;
    if (profile.links?.github || profile.links?.portfolio) score += 8;
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
      headline: data.headline || "Building AI-driven Enterprise Systems | Next.js, React & Node.js Specialist",
      phone: data.phone || "+1 (555) 234-5678",
      targetRole: data.targetRole || "Senior Full Stack Engineer",
      targetRoleId,
      bio: data.bio || "Passionate software engineer with 6+ years of experience designing scalable cloud solutions, microservices, and modern web applications. Focused on automated skill verification and AI integrations.",
      skills: (data.skills as IProfileSkill[]) || [
        { name: "React 19 & Next.js 15", category: "Frontend", level: 5, proficiency: "Expert", score: 98, source: SkillSource.ASSESSMENT, verified: true },
        { name: "TypeScript & Node.js", category: "Language / Backend", level: 4, proficiency: "Advanced", score: 94, source: SkillSource.ASSESSMENT, verified: true },
        { name: "Tailwind CSS & Design Systems", category: "UI / UX", level: 5, proficiency: "Expert", score: 96, source: SkillSource.ASSESSMENT, verified: true },
        { name: "GraphQL & REST APIs", category: "Backend", level: 4, proficiency: "Advanced", score: 91, source: SkillSource.ASSESSMENT, verified: true },
        { name: "PostgreSQL & Redis Caching", category: "Database", level: 3, proficiency: "Intermediate", score: 85, source: SkillSource.PROFILE, verified: false },
        { name: "Docker & Kubernetes", category: "DevOps", level: 3, proficiency: "Intermediate", score: 82, source: SkillSource.PROFILE, verified: false },
      ],
      education: (data.education as IProfileEducation[]) || [],
      experience: (data.experience as IProfileExperience[]) || [],
      links: (data.links as IProfileLinks) || { github: "https://github.com/candidate", linkedin: "https://linkedin.com/in/candidate", portfolio: "https://candidate.dev" },
      location: data.location || { city: "San Francisco", state: "California", country: "United States" },
    };

    return await this.profileRepository.create(profileData);
  }

  async getMyProfile(userId: string): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      // Create initial profile for user seamlessly
      profile = await this.createProfile(userId, {});
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
}
