import { CompanyMemberRepository } from "@/database/repositories/companyMember/CompanyMemberRepository";
import { CompanyRepository } from "@/database/repositories/company/CompanyRepository";
import { ICompanyMember } from "@/database/models/CompanyMember.model";
import { CompanyMemberRole, CompanyMemberStatus } from "@/core/constants/enums";
import { AppError } from "@/core/utils/AppError";
import { ERROR_CODES } from "@/core/constants/error-codes";
import { HTTP_STATUS } from "@/core/constants/http-status";
import {
  AddCompanyMemberDTO,
  UpdateCompanyMemberRoleDTO,
  UpdateCompanyMemberStatusDTO,
} from "./company-member.dto";

export class CompanyMemberService {
  private readonly companyMemberRepository: CompanyMemberRepository;
  private readonly companyRepository: CompanyRepository;

  constructor(
    companyMemberRepository?: CompanyMemberRepository,
    companyRepository?: CompanyRepository
  ) {
    this.companyMemberRepository =
      companyMemberRepository || new CompanyMemberRepository();
    this.companyRepository = companyRepository || new CompanyRepository();
  }

  async getMyMemberships(userId: string): Promise<ICompanyMember[]> {
    return await this.companyMemberRepository.findMembershipsByUser(userId);
  }

  async getCompanyMembers(
    userId: string,
    companyId: string
  ): Promise<ICompanyMember[]> {
    await this.verifyCompanyExists(companyId);
    await this.verifyActiveMembership(userId, companyId);

    return await this.companyMemberRepository.findMembersByCompany(companyId);
  }

  async getCompanyMemberById(
    userId: string,
    companyId: string,
    memberId: string
  ): Promise<ICompanyMember> {
    await this.verifyCompanyExists(companyId);
    await this.verifyActiveMembership(userId, companyId);

    const member = await this.companyMemberRepository.findMembershipInCompany(
      companyId,
      memberId
    );

    if (!member) {
      throw new AppError(
        "Company member not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_MEMBER_NOT_FOUND
      );
    }

    return member;
  }

  async addMember(
    callerUserId: string,
    companyId: string,
    data: AddCompanyMemberDTO
  ): Promise<ICompanyMember> {
    await this.verifyCompanyExists(companyId);
    const callerMembership = await this.verifyActiveMembership(callerUserId, companyId);

    if (
      callerMembership.role !== CompanyMemberRole.OWNER &&
      callerMembership.role !== CompanyMemberRole.ADMIN
    ) {
      throw new AppError(
        "Only company owners and admins can add or invite members",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    const existingMember = await this.companyMemberRepository.findByUserAndCompany(
      data.userId,
      companyId
    );

    if (existingMember) {
      throw new AppError(
        "User is already a member of this company",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_COMPANY_MEMBERSHIP
      );
    }

    const assignedRole = data.role || CompanyMemberRole.RECRUITER;
    const assignedStatus = data.status || CompanyMemberStatus.ACTIVE;

    if (
      assignedRole === CompanyMemberRole.OWNER &&
      callerMembership.role !== CompanyMemberRole.OWNER
    ) {
      throw new AppError(
        "Only an OWNER can assign the OWNER role",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    return await this.companyMemberRepository.createMembership({
      userId: data.userId,
      companyId: companyId as any,
      role: assignedRole,
      status: assignedStatus,
      invitedBy: callerUserId,
      joinedAt: assignedStatus === CompanyMemberStatus.ACTIVE ? new Date() : null,
    });
  }

  async updateMemberRole(
    callerUserId: string,
    companyId: string,
    memberId: string,
    data: UpdateCompanyMemberRoleDTO
  ): Promise<ICompanyMember> {
    await this.verifyCompanyExists(companyId);
    const callerMembership = await this.verifyActiveMembership(callerUserId, companyId);

    if (callerMembership.role !== CompanyMemberRole.OWNER) {
      throw new AppError(
        "Only company owners can update member roles",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    const targetMember = await this.companyMemberRepository.findMembershipInCompany(
      companyId,
      memberId
    );

    if (!targetMember) {
      throw new AppError(
        "Company member not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_MEMBER_NOT_FOUND
      );
    }

    if (targetMember.role === CompanyMemberRole.OWNER) {
      throw new AppError(
        "Cannot modify the role of a company OWNER",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.CANNOT_MODIFY_OWNER
      );
    }

    const updatedMember = await this.companyMemberRepository.updateRoleById(
      memberId,
      data.role
    );

    if (!updatedMember) {
      throw new AppError(
        "Company member not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_MEMBER_NOT_FOUND
      );
    }

    return updatedMember;
  }

  async updateMemberStatus(
    callerUserId: string,
    companyId: string,
    memberId: string,
    data: UpdateCompanyMemberStatusDTO
  ): Promise<ICompanyMember> {
    await this.verifyCompanyExists(companyId);
    const callerMembership = await this.verifyActiveMembership(callerUserId, companyId);

    if (
      callerMembership.role !== CompanyMemberRole.OWNER &&
      callerMembership.role !== CompanyMemberRole.ADMIN
    ) {
      throw new AppError(
        "Only company owners and admins can update member status",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    const targetMember = await this.companyMemberRepository.findMembershipInCompany(
      companyId,
      memberId
    );

    if (!targetMember) {
      throw new AppError(
        "Company member not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_MEMBER_NOT_FOUND
      );
    }

    if (targetMember.role === CompanyMemberRole.OWNER) {
      throw new AppError(
        "Cannot modify the status of a company OWNER",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.CANNOT_MODIFY_OWNER
      );
    }

    if (
      callerMembership.role === CompanyMemberRole.ADMIN &&
      targetMember.role === CompanyMemberRole.ADMIN
    ) {
      throw new AppError(
        "Admins cannot modify the status of other admins",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    const updatedMember = await this.companyMemberRepository.updateStatusById(
      memberId,
      data.status
    );

    if (!updatedMember) {
      throw new AppError(
        "Company member not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_MEMBER_NOT_FOUND
      );
    }

    return updatedMember;
  }

  async removeMember(
    callerUserId: string,
    companyId: string,
    memberId: string
  ): Promise<{ message: string }> {
    await this.verifyCompanyExists(companyId);
    const callerMembership = await this.verifyActiveMembership(callerUserId, companyId);

    if (
      callerMembership.role !== CompanyMemberRole.OWNER &&
      callerMembership.role !== CompanyMemberRole.ADMIN
    ) {
      throw new AppError(
        "Only company owners and admins can remove members",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    const targetMember = await this.companyMemberRepository.findMembershipInCompany(
      companyId,
      memberId
    );

    if (!targetMember) {
      throw new AppError(
        "Company member not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_MEMBER_NOT_FOUND
      );
    }

    if (targetMember.role === CompanyMemberRole.OWNER) {
      throw new AppError(
        "Cannot remove a company OWNER",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.CANNOT_MODIFY_OWNER
      );
    }

    if (
      callerMembership.role === CompanyMemberRole.ADMIN &&
      targetMember.role === CompanyMemberRole.ADMIN
    ) {
      throw new AppError(
        "Admins cannot remove other admins",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_PERMISSION_DENIED
      );
    }

    await this.companyMemberRepository.deleteMembershipById(memberId);

    return { message: "Company member removed successfully" };
  }

  private async verifyCompanyExists(companyId: string) {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new AppError(
        "Company not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.COMPANY_NOT_FOUND
      );
    }
  }

  private async verifyActiveMembership(
    userId: string,
    companyId: string
  ): Promise<ICompanyMember> {
    const membership = await this.companyMemberRepository.findActiveMembership(
      userId,
      companyId
    );

    if (!membership) {
      throw new AppError(
        "You must be an active member of this company to perform this operation",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.COMPANY_MEMBERSHIP_REQUIRED
      );
    }

    return membership;
  }
}
