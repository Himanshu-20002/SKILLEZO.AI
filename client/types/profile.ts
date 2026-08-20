export interface UserSkill {
  id: string;
  name: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified: boolean;
  score?: number;
  verifiedAt?: string;
}

export interface UserCertification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationBadge: string;
}

export interface UserEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface ExtendedUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  headline: string;
  bio: string;
  location: string;
  avatarUrl?: string;
  completionPercentage: number;
  skills: UserSkill[];
  certifications: UserCertification[];
  education: UserEducation[];
  links?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
}

