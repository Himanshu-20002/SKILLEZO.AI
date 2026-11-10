export type InterviewMode = 'text' | 'voice';

export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'managerial';

export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export type InterviewSessionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';

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
  _id?: string;
  id?: string;
  sessionId: string;
  sequence: number;
  questionText: string;
  category: string;
  difficulty: InterviewDifficulty;
  questionType: InterviewType;
  expectedConcepts?: string[];
  source?: string;
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

