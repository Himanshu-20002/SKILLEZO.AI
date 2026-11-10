import {
  InterviewMode,
  InterviewType,
  InterviewDifficulty,
  InterviewSessionStatus,
  QuestionSource,
  ExperienceLevel,
} from "./interview.enums";

export interface IInterviewSessionDomain {
  id: string;
  userId: string;
  role: string;
  experienceLevel: ExperienceLevel | string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  mode: InterviewMode;
  durationMinutes: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  status: InterviewSessionStatus;
  templateId?: string;
  resumeId?: string;
  jobId?: string;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewTemplateDomain {
  id: string;
  name: string;
  role: string;
  interviewType: InterviewType;
  supportedExperienceLevels: string[];
  supportedDifficulties: InterviewDifficulty[];
  defaultDurationMinutes: number;
  defaultQuestionCount: number;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewQuestionDomain {
  id: string;
  sessionId: string;
  sequence: number;
  questionText: string;
  category: string;
  difficulty: InterviewDifficulty;
  questionType: InterviewType;
  expectedConcepts?: string[];
  evaluationRubricVersion?: string;
  parentQuestionId?: string | null;
  source: QuestionSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewAnswerDomain {
  id: string;
  sessionId: string;
  questionId: string;
  userId: string;
  answerText: string;
  transcriptText?: string;
  responseDurationSeconds?: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewEvaluationDomain {
  id: string;
  sessionId: string;
  questionId: string;
  answerId: string;
  userId: string;
  rubricVersion: string;
  provider: string;
  model: string;
  promptVersion: string;
  scores?: Record<string, number>;
  evidence?: string[];
  strengths?: string[];
  improvementAreas?: string[];
  evaluatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInterviewReportDomain {
  id: string;
  sessionId: string;
  userId: string;
  rubricVersion: string;
  overallScore?: number;
  dimensionScores?: Record<string, number>;
  readinessLevel?: string;
  strengths: string[];
  improvementAreas: string[];
  recommendations: string[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

