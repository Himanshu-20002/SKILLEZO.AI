import { BaseRepository } from "../base";
import { CompanyMemberModel, ICompanyMember } from "@/database/models/CompanyMember.model";
import { CompanyMemberStatus, CompanyMemberRole } from "@/core/constants/enums";
import { Types } from "mongoose";

export class CompanyMemberRepository extends BaseRepository<ICompanyMember> {
  constructor() {
    super(CompanyMemberModel, "CompanyMember");
  }

  async findByUserAndCompany(
    userId: string,
    companyId: string | Types.ObjectId
  ): Promise<ICompanyMember | null> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    return await this.findOne({ userId, companyId: cId });
  }

  async findActiveMembership(
    userId: string,
    companyId: string | Types.ObjectId
  ): Promise<ICompanyMember | null> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    return await this.findOne({
      userId,
      companyId: cId,
      status: CompanyMemberStatus.ACTIVE,
    });
  }

  async findMembershipsByUser(userId: string): Promise<ICompanyMember[]> {
    return await this.findMany({
      userId,
      status: CompanyMemberStatus.ACTIVE,
    });
  }

  async findMembersByCompany(companyId: string | Types.ObjectId): Promise<ICompanyMember[]> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    return await this.findMany({ companyId: cId });
  }

  async createMembership(data: Partial<ICompanyMember>): Promise<ICompanyMember> {
    return await this.create(data);
  }

  async updateMembershipRole(
    userId: string,
    companyId: string | Types.ObjectId,
    role: CompanyMemberRole
  ): Promise<ICompanyMember | null> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    return await this.model
      .findOneAndUpdate(
        { userId, companyId: cId },
        { $set: { role } },
        { new: true, runValidators: true }
      )
      .exec();
  }

  async updateMembershipStatus(
    userId: string,
    companyId: string | Types.ObjectId,
    status: CompanyMemberStatus
  ): Promise<ICompanyMember | null> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    return await this.model
      .findOneAndUpdate(
        { userId, companyId: cId },
        { $set: { status } },
        { new: true, runValidators: true }
      )
      .exec();
  }

  async findMembershipById(
    memberId: string | Types.ObjectId
  ): Promise<ICompanyMember | null> {
    const mId = typeof memberId === "string" ? new Types.ObjectId(memberId) : memberId;
    return await this.findById(mId.toString());
  }

  async findMembershipInCompany(
    companyId: string | Types.ObjectId,
    memberId: string | Types.ObjectId
  ): Promise<ICompanyMember | null> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    const mId = typeof memberId === "string" ? new Types.ObjectId(memberId) : memberId;
    return await this.findOne({ _id: mId, companyId: cId });
  }

  async existsByUserAndCompany(
    userId: string,
    companyId: string | Types.ObjectId
  ): Promise<boolean> {
    const cId = typeof companyId === "string" ? new Types.ObjectId(companyId) : companyId;
    return await this.exists({ userId, companyId: cId });
  }

  async updateRoleById(
    memberId: string | Types.ObjectId,
    role: CompanyMemberRole
  ): Promise<ICompanyMember | null> {
    const mId = typeof memberId === "string" ? new Types.ObjectId(memberId) : memberId;
    return await this.updateById(mId.toString(), { role });
  }

  async updateStatusById(
    memberId: string | Types.ObjectId,
    status: CompanyMemberStatus
  ): Promise<ICompanyMember | null> {
    const mId = typeof memberId === "string" ? new Types.ObjectId(memberId) : memberId;
    return await this.updateById(mId.toString(), { status });
  }

  async deleteMembershipById(
    memberId: string | Types.ObjectId
  ): Promise<boolean> {
    const mId = typeof memberId === "string" ? new Types.ObjectId(memberId) : memberId;
    return await this.deleteById(mId.toString());
  }
}
