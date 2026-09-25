import { BaseRepository } from "../base";
import { ResumeModel, IResume } from "@/database/models/Resume.model";

export class ResumeRepository extends BaseRepository<IResume> {
  constructor() {
    super(ResumeModel, "Resume");
  }

  async findByUserId(userId: string): Promise<IResume[]> {
    return await this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findPortfolioItemsByUserId(userId: string): Promise<IResume[]> {
    return await this.model
      .find({ userId })
      .select({
        _id: 1,
        title: 1,
        variantType: 1,
        isUploaded: 1,
        storageKey: 1,
        originalFileName: 1,
        targetJobTitle: 1,
        targetCompany: 1,
        parentResumeId: 1,
        sourceProfileVersion: 1,
        isDefault: 1,
        updatedAt: 1,
        createdAt: 1,
      })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findUserResumeById(userId: string, resumeId: string): Promise<IResume | null> {
    return await this.model.findOne({ _id: resumeId, userId }).exec();
  }

  async findDefaultByUserId(userId: string): Promise<IResume | null> {
    return await this.model.findOne({ userId, isDefault: true }).exec();
  }

  async findMasterByUserId(userId: string): Promise<IResume | null> {
    return await this.model.findOne({ userId, variantType: "MASTER" }).exec();
  }

  async clearDefaultFlag(userId: string): Promise<void> {
    await this.model.updateMany({ userId, isDefault: true }, { $set: { isDefault: false } }).exec();
  }

  async setDefaultResume(userId: string, resumeId: string): Promise<IResume | null> {
    await this.clearDefaultFlag(userId);
    return await this.model
      .findOneAndUpdate(
        { _id: resumeId, userId },
        { $set: { isDefault: true } },
        { new: true }
      )
      .exec();
  }

  async countUserResumes(userId: string): Promise<number> {
    return await this.model.countDocuments({ userId }).exec();
  }

  async deleteUserResume(userId: string, resumeId: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: resumeId, userId }).exec();
    return result.deletedCount > 0;
  }
}
