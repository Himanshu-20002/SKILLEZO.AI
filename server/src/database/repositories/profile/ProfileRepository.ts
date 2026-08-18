import { BaseRepository } from "../base";
import { ProfileModel, IProfile, IProfileSkill, IProfileEducation, IProfileExperience, IProfileLinks } from "@/database/models/Profile.model";
import { Types, UpdateQuery } from "mongoose";

export class ProfileRepository extends BaseRepository<IProfile> {
  constructor() {
    super(ProfileModel, "Profile");
  }

  async findByUserId(userId: string): Promise<IProfile | null> {
    return await this.findOne({ userId });
  }

  async existsByUserId(userId: string): Promise<boolean> {
    return await this.exists({ userId });
  }

  async updateByUserId(userId: string, updateData: UpdateQuery<IProfile>): Promise<IProfile | null> {
    return await this.model
      .findOneAndUpdate({ userId }, updateData, { new: true, runValidators: true })
      .exec();
  }

  async updateSkills(userId: string, skills: IProfileSkill[]): Promise<IProfile | null> {
    return await this.model
      .findOneAndUpdate({ userId }, { $set: { skills } }, { new: true, runValidators: true })
      .exec();
  }

  async updateEducation(userId: string, education: IProfileEducation[]): Promise<IProfile | null> {
    return await this.model
      .findOneAndUpdate({ userId }, { $set: { education } }, { new: true, runValidators: true })
      .exec();
  }

  async updateExperience(userId: string, experience: IProfileExperience[]): Promise<IProfile | null> {
    return await this.model
      .findOneAndUpdate({ userId }, { $set: { experience } }, { new: true, runValidators: true })
      .exec();
  }

  async updateTargetRole(userId: string, targetRoleId: Types.ObjectId | null): Promise<IProfile | null> {
    return await this.model
      .findOneAndUpdate({ userId }, { $set: { targetRoleId } }, { new: true, runValidators: true })
      .exec();
  }

  async updateLinks(userId: string, links: IProfileLinks): Promise<IProfile | null> {
    return await this.model
      .findOneAndUpdate({ userId }, { $set: { links } }, { new: true, runValidators: true })
      .exec();
  }

  async findProfilesByRole(targetRoleId: string | Types.ObjectId): Promise<IProfile[]> {
    return await this.findMany({ targetRoleId });
  }
}
