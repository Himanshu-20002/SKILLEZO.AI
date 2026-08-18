export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
export type ExperienceRange = '0–1 years' | '1–3 years' | '3–5 years' | '5+ years';
export type MatchTier = '85%+' | '70–85%' | 'All Jobs';
export type SortOption = 'AI Match' | 'Latest' | 'Salary: High to Low' | 'Salary: Low to High';
export type ApplicationStatus = 'Submitted' | 'Under Review' | 'Shortlisted' | 'Interview Scheduled' | 'Offer' | 'Rejected';

export interface ApplicationTimelineEvent {
  title: string;
  date: string;
  completed: boolean;
  isCurrent?: boolean;
}

export interface JobMatchBreakdown {
  overallScore: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  roleMatchScore: number;
  locationMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  verified: boolean;
  department: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  salaryMin: number; // in LPA or USD
  salaryMax: number;
  salaryText: string; // e.g. "₹12–18 LPA"
  experienceMin: number;
  experienceMax: number;
  experienceText: string; // e.g. "3–5 Years"
  skills: string[];
  description: string;
  responsibilities: string[];
  education: string;
  perks: string[];
  matchScore: number;
  matchTier: 'Excellent Match' | 'Good Match' | 'Potential Match';
  matchBreakdown: JobMatchBreakdown;
  postedDate: string;
  postedTimeAgo: string;
  isSaved?: boolean;
  isApplied?: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  workMode: WorkMode;
  salaryText: string;
  appliedDate: string;
  matchScore: number;
  status: ApplicationStatus;
  nextStep: string;
  timeline: ApplicationTimelineEvent[];
  resumeUsed: string;
  atsScore: number;
}

export interface JobFilterState {
  searchQuery: string;
  workMode: WorkMode | 'All';
  employmentType: EmploymentType | 'All';
  experience: ExperienceRange | 'All';
  matchTier: MatchTier;
  salaryMin: number;
  salaryMax: number;
  location: string;
  selectedSkills: string[];
  sortBy: SortOption;
}
