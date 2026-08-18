import { CompanyMemberRole, CompanyMemberStatus } from "@/core/constants/enums";

export interface AddCompanyMemberDTO {
  userId: string;
  role?: CompanyMemberRole;
  status?: CompanyMemberStatus;
}

export interface UpdateCompanyMemberRoleDTO {
  role: CompanyMemberRole;
}

export interface UpdateCompanyMemberStatusDTO {
  status: CompanyMemberStatus;
}
