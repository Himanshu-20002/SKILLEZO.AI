export type VerificationStatus = 'verified' | 'pending' | 'failed' | 'in_review';
export type ProficiencyLevel = 'Expert' | 'Advanced' | 'Intermediate' | 'Beginner';

export interface SkillVerificationRecord {
  id: string;
  skillName: string;
  category: string;
  topicId?: string;
  applicantName: string;
  score: number;
  maxScore: number;
  status: VerificationStatus;
  proficiency?: ProficiencyLevel;
  verifiedDate?: string;
  submittedDate: string;
  assessor: string;
  credentialHash?: string;
  details?: string;
}

export interface AssessmentCatalogItem {
  id: string;
  title: string;
  skillName: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  iconName: string;
  color: string;
  completed: boolean;
  lastScore?: number | null;
  status?: VerificationStatus | null;
  credentialHash?: string | null;
  verifiedDate?: string | null;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AssessmentQuiz {
  track: {
    id: string;
    title: string;
    skillName: string;
    category: string;
    durationMinutes: number;
    totalQuestions: number;
    passingScore: number;
  };
  questions: AssessmentQuestion[];
}

export interface QuestionEvaluation {
  questionId: string;
  question: string;
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
}

export interface AssessmentResult {
  verified: boolean;
  score: number;
  passingScore: number;
  correctAnswers: number;
  totalQuestions: number;
  proficiency: ProficiencyLevel;
  credentialHash: string;
  issueDate: string;
  skillName: string;
  category: string;
  topicId: string;
  evaluations: QuestionEvaluation[];
  profileUpdated: boolean;
}

export interface PublicCredential {
  credentialHash: string;
  skillName: string;
  category: string;
  topicId: string;
  score: number;
  proficiency: ProficiencyLevel;
  status: VerificationStatus;
  issueDate: string;
  assessor: string;
  candidateName?: string;
  isValid: boolean;
}
