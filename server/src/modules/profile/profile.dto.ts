import { SkillSource, EmploymentType } from "@/core/constants/enums";

export interface ProfileSkillDTO {
  name: string;
  level: number;
  source?: SkillSource;
  verified?: boolean;
}

export interface ProfileEducationDTO {
  institution: string;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface ProfileExperienceDTO {
  companyName: string;
  jobTitle: string;
  employmentType?: EmploymentType | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isCurrent?: boolean;
  description?: string | null;
}

export interface ProfileLinksDTO {
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
}

export interface ProfileLocationDTO {
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export interface CreateProfileDTO {
  targetRoleId?: string | null;
  bio?: string | null;
  skills?: ProfileSkillDTO[];
  education?: ProfileEducationDTO[];
  experience?: ProfileExperienceDTO[];
  links?: ProfileLinksDTO | null;
  location?: ProfileLocationDTO | null;
}

export interface UpdateProfileDTO {
  targetRoleId?: string | null;
  bio?: string | null;
  skills?: ProfileSkillDTO[];
  education?: ProfileEducationDTO[];
  experience?: ProfileExperienceDTO[];
  links?: ProfileLinksDTO | null;
  location?: ProfileLocationDTO | null;
}

export interface UpdateSkillsDTO {
  skills: ProfileSkillDTO[];
}

export interface UpdateEducationDTO {
  education: ProfileEducationDTO[];
}

export interface UpdateExperienceDTO {
  experience: ProfileExperienceDTO[];
}

export interface UpdateLinksDTO {
  links: ProfileLinksDTO;
}

export interface UpdateTargetRoleDTO {
  targetRoleId: string | null;
}
