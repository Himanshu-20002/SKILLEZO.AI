import { CompanyRepository } from "@/database/repositories/company/CompanyRepository";
import { CompanyMemberRepository } from "@/database/repositories/companyMember/CompanyMemberRepository";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import { CompanyMemberRole, CompanyMemberStatus, CompanyVerificationStatus } from "@/core/constants/enums";
import { CreateCompanyDTO, UpdateCompanyDTO } from "./company.dto";
import { ICompany } from "@/database/models/Company.model";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CompanyService {
  private readonly companyRepository: CompanyRepository;
  private readonly companyMemberRepository: CompanyMemberRepository;

  constructor(
    companyRepository?: CompanyRepository,
    companyMemberRepository?: CompanyMemberRepository
  ) {
    this.companyRepository = companyRepository || new CompanyRepository();
    this.companyMemberRepository = companyMemberRepository || new CompanyMemberRepository();
  }

  async createCompany(userId: string, data: CreateCompanyDTO): Promise<ICompany> {
    const slug = data.slug ? data.slug.toLowerCase().trim() : generateSlug(data.name);

    if (!slug) {
      throw new AppError("Invalid company name for slug generation", HTTP_STATUS.BAD_REQUEST, ERROR_CODES.BAD_REQUEST);
    }

    const existingCompany = await this.companyRepository.findBySlug(slug);
    if (existingCompany) {
      throw new AppError(
        `Company slug '${slug}' already exists`,
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.CONFLICT
      );
    }

    const companyData: Partial<ICompany> = {
      name: data.name.trim(),
      slug,
      description: data.description || null,
      industry: data.industry || null,
      website: data.website || null,
      logoUrl: data.logoUrl || null,
      location: data.location || null,
      companySize: data.companySize || null,
      verificationStatus: CompanyVerificationStatus.PENDING,
      createdBy: userId,
    };

    const company = await this.companyRepository.create(companyData);

    await this.companyMemberRepository.createMembership({
      userId,
      companyId: company._id,
      role: CompanyMemberRole.OWNER,
      status: CompanyMemberStatus.ACTIVE,
      invitedBy: null,
      joinedAt: new Date(),
    });

    return company;
  }

  async getCompany(companyId: string): Promise<ICompany> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.COMPANY_NOT_FOUND);
    }
    return company;
  }

  async getMyCompanies(userId: string): Promise<ICompany[]> {
    const memberships = await this.companyMemberRepository.findMembershipsByUser(userId);
    if (!memberships || memberships.length === 0) {
      return [];
    }

    const companyIds = memberships.map((m) => m.companyId);
    return await this.companyRepository.findMany({ _id: { $in: companyIds } });
  }

  async updateCompany(userId: string, companyId: string, data: UpdateCompanyDTO): Promise<ICompany> {
    const membership = await this.companyMemberRepository.findActiveMembership(userId, companyId);
    if (!membership) {
      throw new AppError(
        "You do not have active membership in this company",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    if (
      membership.role !== CompanyMemberRole.OWNER &&
      membership.role !== CompanyMemberRole.ADMIN
    ) {
      throw new AppError(
        "Only company owners and admins are authorized to update company details",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.COMPANY_NOT_FOUND);
    }

    const updatePayload: Partial<ICompany> = {};
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.industry !== undefined) updatePayload.industry = data.industry;
    if (data.website !== undefined) updatePayload.website = data.website;
    if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;
    if (data.location !== undefined) updatePayload.location = data.location;
    if (data.companySize !== undefined) updatePayload.companySize = data.companySize;

    const updatedCompany = await this.companyRepository.updateById(companyId, updatePayload);
    if (!updatedCompany) {
      throw new AppError("Company not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.COMPANY_NOT_FOUND);
    }
    return updatedCompany;
  }
}
