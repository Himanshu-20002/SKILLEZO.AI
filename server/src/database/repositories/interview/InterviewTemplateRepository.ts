import { BaseRepository } from "../base";
import {
  InterviewTemplateModel,
  IInterviewTemplate,
} from "@/database/models/InterviewTemplate.model";

export class InterviewTemplateRepository extends BaseRepository<IInterviewTemplate> {
  constructor() {
    super(InterviewTemplateModel, "InterviewTemplate");
  }

  /**
   * Find active templates for candidate interview selection
   */
  async findActiveTemplates(): Promise<IInterviewTemplate[]> {
    return await this.findMany({ isActive: true }, { sort: { role: 1 } });
  }

  /**
   * Find template by role name and interview type
   */
  async findByRoleAndType(
    role: string,
    interviewType: string
  ): Promise<IInterviewTemplate | null> {
    return await this.findOne({
      role: { $regex: new RegExp(`^${role.trim()}$`, "i") },
      interviewType,
      isActive: true,
    });
  }
}

