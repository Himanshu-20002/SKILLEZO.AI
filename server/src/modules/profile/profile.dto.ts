import { SkillSource, EmploymentType } from "@/core/constants/enums";

export interface ProfileSkillDTO {
  name: string;
  category?: string | null;
  level?: number;
  proficiency?: string | null;
  score?: number | null;
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
  headline?: string | null;
  phone?: string | null;
  targetRole?: string | null;
  targetRoleId?: string | null;
  bio?: string | null;
  skills?: ProfileSkillDTO[];
  education?: ProfileEducationDTO[];
  experience?: ProfileExperienceDTO[];
  links?: ProfileLinksDTO | null;
  location?: ProfileLocationDTO | null;
}

export interface UpdateProfileDTO {
  headline?: string | null;
  phone?: string | null;
  targetRole?: string | null;
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
