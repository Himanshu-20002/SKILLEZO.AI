import { VerificationStatusType, ProficiencyLevelType } from "@/database/models/Verification.model";

export interface AssessmentCatalogItemDTO {
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
  status?: VerificationStatusType | null;
  credentialHash?: string | null;
  verifiedDate?: string | null;
}

export interface AssessmentQuestionDTO {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface AssessmentQuizDTO {
  track: {
    id: string;
    title: string;
    skillName: string;
    category: string;
    durationMinutes: number;
    totalQuestions: number;
    passingScore: number;
  };
  questions: AssessmentQuestionDTO[];
}

export interface SubmitAssessmentRequestDTO {
  answers: Record<string, number>; // questionId -> chosenOptionIndex
}

export interface QuestionEvaluationDTO {
  questionId: string;
  question: string;
  selectedOption: number | null;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
}

export interface SubmitAssessmentResponseDTO {
  verified: boolean;
  score: number;
  passingScore: number;
  correctAnswers: number;
  totalQuestions: number;
  proficiency: ProficiencyLevelType;
  credentialHash: string;
  issueDate: string;
  skillName: string;
  category: string;
  topicId: string;
  evaluations: QuestionEvaluationDTO[];
  profileUpdated: boolean;
}

export interface PublicCredentialDTO {
  credentialHash: string;
  skillName: string;
  category: string;
  topicId: string;
  score: number;
  proficiency: ProficiencyLevelType;
  status: VerificationStatusType;
  issueDate: string;
  assessor: string;
  candidateName?: string;
  isValid: boolean;
}
