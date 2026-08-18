import { BaseRepository } from "../base";
import { CompanyModel, ICompany } from "@/database/models/Company.model";
import { CompanyVerificationStatus } from "@/core/constants/enums";
import { Types } from "mongoose";

export class CompanyRepository extends BaseRepository<ICompany> {
  constructor() {
    super(CompanyModel, "Company");
  }

  async findBySlug(slug: string): Promise<ICompany | null> {
    return await this.findOne({ slug: slug.toLowerCase().trim() });
  }

  async findVerifiedCompanies(): Promise<ICompany[]> {
    return await this.findMany({ verificationStatus: CompanyVerificationStatus.VERIFIED }, { sort: { name: 1 } });
  }

  async findCompaniesByIndustry(industry: string): Promise<ICompany[]> {
    return await this.findMany({ industry: new RegExp(`^${industry.trim()}$`, "i") });
  }

  async updateVerificationStatus(id: string | Types.ObjectId, status: CompanyVerificationStatus): Promise<ICompany | null> {
    return await this.updateById(id, { verificationStatus: status });
  }

  async findCreatedBy(userId: string): Promise<ICompany[]> {
    return await this.findMany({ createdBy: userId });
  }
}
