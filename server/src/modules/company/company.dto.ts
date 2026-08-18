import { CompanySize } from "@/core/constants/enums";

export interface CompanyLocationDTO {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface CreateCompanyDTO {
  name: string;
  slug?: string;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  location?: CompanyLocationDTO | null;
  companySize?: CompanySize | null;
}

export interface UpdateCompanyDTO {
  name?: string;
  description?: string | null;
  industry?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  location?: CompanyLocationDTO | null;
  companySize?: CompanySize | null;
}
