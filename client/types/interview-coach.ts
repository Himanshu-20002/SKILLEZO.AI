export type InterviewMode = 'text' | 'voice';

export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'managerial';

export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export type InterviewSessionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type ReadinessLevel =
  | 'role_model'
  | 'interview_ready'
  | 'developing'
  | 'needs_practice';

export interface InterviewTemplate {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  interviewType: InterviewType;
  supportedExperienceLevels: string[];
  supportedDifficulties: InterviewDifficulty[];
  competencyAreas: string[];
  defaultDurationMinutes: number;
  defaultQuestionCount: number;
}

export interface InterviewQuestion {
  _id: string;
  id?: string;
  sessionId: string;
  sequence: number;
  questionText: string;
  category: string;
  difficulty: InterviewDifficulty;
  questionType: InterviewType;
  expectedConcepts?: string[];
  parentQuestionId?: string | null;
  source?: string;
}

export interface InterviewAnswer {
  _id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answerText: string;
  transcriptText?: string;
  responseDurationSeconds?: number;
  submittedAt: string;
}

export interface DimensionScores {
  technicalAccuracy: number;
  problemSolvingDepth: number;
  answerStructure: number;
  conceptCoverage: number;
  communicationTone: number;
}

export interface InterviewEvaluation {
  _id: string;
  sessionId: string;
  questionId: string;
  answerId: string;
  userId: string;
  rubricVersion: string;
  provider: string;
  aiModel: string;
  promptVersion: string;
  scores: DimensionScores;
  evidence: string[];
  strengths: string[];
  improvementAreas: string[];
  modelAnswerSuggestion?: string;
  evaluatedAt: string;
}

export interface InterviewReport {
  _id: string;
  sessionId: string;
  userId: string;
  rubricVersion: string;
  overallScore: number;
  dimensionScores: DimensionScores;
  readinessLevel: ReadinessLevel;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface InterviewSession {
  _id: string;
  userId: string;
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  mode: InterviewMode;
  durationMinutes: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  status: InterviewSessionStatus;
  templateId?: string | null;
  resumeId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionPayload {
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  mode: InterviewMode;
  durationMinutes: number;
  totalQuestions: number;
  templateId?: string;
  resumeId?: string;
  jobId?: string;
}

export interface StartOrResumeSessionResponse {
  session: InterviewSession;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestion: InterviewQuestion | null;
  progress: {
    answeredCount: number;
    totalQuestions: number;
    currentSequence: number;
    isCompleted: boolean;
  };
}

export interface SubmitAnswerPayload {
  questionId: string;
  answerText: string;
  responseDurationSeconds?: number;
}

export interface SubmitAnswerResponse {
  answer: InterviewAnswer;
  nextQuestion: InterviewQuestion | null;
  followUpGenerated: boolean;
  isCompleted: boolean;
  progress: {
    answeredCount: number;
    totalQuestions: number;
    isCompleted: boolean;
  };
}

export interface SessionEvaluationSummary {
  session: InterviewSession;
  report: InterviewReport;
  evaluations: Array<{
    question: InterviewQuestion;
    answer: InterviewAnswer;
    evaluation: InterviewEvaluation;
  }>;
}
