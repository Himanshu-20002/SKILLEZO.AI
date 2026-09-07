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
    let score = 25; // base score for account registration
    if (profile.headline) score += 10;
    if (profile.bio && profile.bio.length > 20) score += 10;
    if (profile.location?.city || profile.location?.country) score += 10;
    if (profile.phone) score += 10;
    if (profile.skills && profile.skills.length >= 3) score += 15;
    if (profile.projects && profile.projects.length >= 1) score += 10;
    if (profile.links?.github || profile.links?.portfolio) score += 10;
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
      projects: [
        {
          title: "SKILLEZO AI — Enterprise Career Intelligence Platform",
          description: "Architected a full-stack career acceleration ecosystem with ATS resume optimization, cryptographic skill verification badges, and automated 7-stage Career GPS roadmap tracking.",
          techStack: ["Next.js 15", "React 19", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS", "Redis"],
          githubUrl: "https://github.com/Himanshu-20002/SKILLEZO.AI",
          liveDemoUrl: "https://skillezo-ai.vercel.app",
          featured: true,
        },
        {
          title: "Distributed Real-Time Job Ingestion & Crawler Engine",
          description: "High-throughput asynchronous job stream processing pipeline that ingests, deduplicates, and vector-indexes multi-source tech listings from Remotive, Arbeitnow, and custom ATS feeds.",
          techStack: ["Node.js", "Express", "Redis Pub/Sub", "Docker", "MongoDB", "BullMQ"],
          githubUrl: "https://github.com/Himanshu-20002/job-ingestion-worker",
          liveDemoUrl: "https://skillezo-api.vercel.app",
          featured: true,
        },
        {
          title: "CloudScale — Microservices Orchestration & Kubernetes Mesh",
          description: "Zero-trust service mesh architecture managing multi-region container deployments with automated canary rollouts, Prometheus telemetry dashboards, and AWS ECS Fargate autoscaling.",
          techStack: ["Kubernetes", "Docker", "AWS ECS", "Terraform", "Prometheus", "Grafana"],
          githubUrl: "https://github.com/Himanshu-20002/cloudscale-mesh",
          liveDemoUrl: "https://cloudscale-demo.vercel.app",
          featured: false,
        },
        {
          title: "DevFlow — Collaborative Real-Time Code Canvas",
          description: "Interactive developer collaboration workspace featuring CRDT-based multi-user state synchronization, WebSockets room management, and automated AST syntax parsing.",
          techStack: ["React", "TypeScript", "WebSockets", "Tailwind CSS", "PostgreSQL", "Zustand"],
          githubUrl: "https://github.com/Himanshu-20002/devflow-canvas",
          liveDemoUrl: "https://devflow-canvas.vercel.app",
          featured: false,
        },
      ],
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

  async seedSampleProjects(userId: string): Promise<IProfile> {
    let profile = await this.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await this.createProfile(userId, {});
    }

    const sampleProjects = [
      {
        title: "SKILLEZO AI — Enterprise Career Intelligence Platform",
        description: "Architected a full-stack career acceleration ecosystem with ATS resume optimization, cryptographic skill verification badges, and automated 7-stage Career GPS roadmap tracking.",
        techStack: ["Next.js 15", "React 19", "TypeScript", "Node.js", "MongoDB", "Tailwind CSS"],
        githubUrl: "https://github.com/Himanshu-20002/SKILLEZO.AI",
        liveDemoUrl: "https://skillezo-ai.vercel.app",
        featured: true,
      },
      {
        title: "Distributed Real-Time Job Ingestion & Crawler Engine",
        description: "High-throughput asynchronous job stream processing pipeline that ingests, deduplicates, and vector-indexes multi-source tech listings from Remotive, Arbeitnow, and custom ATS feeds.",
        techStack: ["Node.js", "Express", "Redis Pub/Sub", "Docker", "MongoDB", "BullMQ"],
        githubUrl: "https://github.com/Himanshu-20002/job-ingestion-worker",
        liveDemoUrl: "https://skillezo-api.vercel.app",
        featured: true,
      },
      {
        title: "DevFlow — Collaborative Real-Time Code Canvas",
        description: "Interactive developer collaboration workspace featuring CRDT-based multi-user state synchronization, WebSockets room management, and automated AST syntax parsing.",
        techStack: ["React", "TypeScript", "WebSockets", "Tailwind CSS", "PostgreSQL", "Zustand"],
        githubUrl: "https://github.com/Himanshu-20002/devflow-canvas",
        liveDemoUrl: "https://devflow-canvas.vercel.app",
        featured: false,
      },
    ];

    profile.projects = sampleProjects as any;
    await profile.save();

    const doc = profile.toObject ? profile.toObject() : profile;
    (doc as any).completionPercentage = this.calculateProfileCompletion(doc);
    return doc as IProfile;
  }
}

