import { BaseRepository } from "../base";
import { ResumeModel, IResume } from "@/database/models/Resume.model";

export class ResumeRepository extends BaseRepository<IResume> {
  constructor() {
    super(ResumeModel, "Resume");
  }

  async findByUserId(userId: string): Promise<IResume[]> {
    return await this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findUserResumeById(userId: string, resumeId: string): Promise<IResume | null> {
    return await this.model.findOne({ _id: resumeId, userId }).exec();
  }

  async findDefaultByUserId(userId: string): Promise<IResume | null> {
    return await this.model.findOne({ userId, isDefault: true }).exec();
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
