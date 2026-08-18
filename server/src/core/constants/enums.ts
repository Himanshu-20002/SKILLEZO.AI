export const UserRole = {
  CANDIDATE: "candidate",
  RECRUITER: "recruiter",
  ADMIN: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DEACTIVATED: "deactivated",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const SkillSource = {
  PROFILE: "profile",
  RESUME: "resume",
  ASSESSMENT: "assessment",
  ADMIN: "admin",
} as const;
export type SkillSource = (typeof SkillSource)[keyof typeof SkillSource];

export const EmploymentType = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  INTERNSHIP: "internship",
  CONTRACT: "contract",
  FREELANCE: "freelance",
  SELF_EMPLOYED: "self_employed",
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

export const JobEmploymentType = {
  FULL_TIME: "full_time",
  PART_TIME: "part_time",
  INTERNSHIP: "internship",
  CONTRACT: "contract",
  FREELANCE: "freelance",
} as const;
export type JobEmploymentType = (typeof JobEmploymentType)[keyof typeof JobEmploymentType];

export const RoleStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;
export type RoleStatus = (typeof RoleStatus)[keyof typeof RoleStatus];

export const CompetencyImportance = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;
export type CompetencyImportance = (typeof CompetencyImportance)[keyof typeof CompetencyImportance];

export const CareerPlanStatus = {
  ACTIVE: "active",
  SUPERSEDED: "superseded",
} as const;
export type CareerPlanStatus = (typeof CareerPlanStatus)[keyof typeof CareerPlanStatus];

export const GapPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;
export type GapPriority = (typeof GapPriority)[keyof typeof GapPriority];

export const CompanySize = {
  SIZE_1_10: "1-10",
  SIZE_11_50: "11-50",
  SIZE_51_200: "51-200",
  SIZE_201_500: "201-500",
  SIZE_501_1000: "501-1000",
  SIZE_1001_5000: "1001-5000",
  SIZE_5000_PLUS: "5000+",
} as const;
export type CompanySize = (typeof CompanySize)[keyof typeof CompanySize];

export const CompanyVerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type CompanyVerificationStatus =
  (typeof CompanyVerificationStatus)[keyof typeof CompanyVerificationStatus];

export const CompanyMemberRole = {
  OWNER: "owner",
  ADMIN: "admin",
  RECRUITER: "recruiter",
  VIEWER: "viewer",
} as const;
export type CompanyMemberRole = (typeof CompanyMemberRole)[keyof typeof CompanyMemberRole];

export const CompanyMemberStatus = {
  INVITED: "invited",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REMOVED: "removed",
} as const;
export type CompanyMemberStatus = (typeof CompanyMemberStatus)[keyof typeof CompanyMemberStatus];

export const JobStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
  ARCHIVED: "archived",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const WorkplaceType = {
  ONSITE: "onsite",
  HYBRID: "hybrid",
  REMOTE: "remote",
} as const;
export type WorkplaceType = (typeof WorkplaceType)[keyof typeof WorkplaceType];

export const ApplicationStatus = {
  APPLIED: "applied",
  UNDER_REVIEW: "under_review",
  SHORTLISTED: "shortlisted",
  INTERVIEW: "interview",
  OFFERED: "offered",
  HIRED: "hired",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;
export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ResumeStatus = {
  UPLOADED: "uploaded",
  PROCESSING: "processing",
  PARSED: "parsed",
  FAILED: "failed",
} as const;
export type ResumeStatus = (typeof ResumeStatus)[keyof typeof ResumeStatus];

export const JobSourceType = {
  PLATFORM: "platform",
  EXTERNAL: "external",
} as const;
export type JobSourceType = (typeof JobSourceType)[keyof typeof JobSourceType];

export const JobSourceProvider = {
  JOOBLE: "jooble",
  ADZUNA: "adzuna",
  GREENHOUSE: "greenhouse",
  LEVER: "lever",
} as const;
export type JobSourceProvider = (typeof JobSourceProvider)[keyof typeof JobSourceProvider];

