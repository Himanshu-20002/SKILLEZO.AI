export type VerificationStatus = 'verified' | 'pending' | 'failed' | 'in_review';

export interface SkillVerificationRecord {
  id: string;
  skillName: string;
  category: string;
  applicantName: string;
  score: number;
  maxScore: number;
  status: VerificationStatus;
  verifiedDate?: string;
  submittedDate: string;
  assessor: string;
  credentialHash?: string;
  details?: string;
}
