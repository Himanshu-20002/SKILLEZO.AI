export type LearningDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type LearningCategory =
  | 'All'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud'
  | 'DevOps'
  | 'System Design'
  | 'AI/ML';

export interface ResourceSummary {
  id: string;
  title: string;
  slug: string;
  type: 'lesson' | 'external_doc' | 'external_video' | 'pdf_document' | 'quiz' | 'code_drill';
  category: string;
  skills: string[];
  difficulty: LearningDifficulty;
  estimatedMinutes: number;
  provider?: string;
  externalUrl?: string;
  completed: boolean;
}

export interface TrackModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  resources: ResourceSummary[];
}

export interface TrackCatalogItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  targetRoles: string[];
  targetSkills: string[];
  difficulty: LearningDifficulty;
  estimatedMinutes: number;
  iconName: string;
  accentColor: string;
  totalModules: number;
  totalResources: number;
  enrollmentCount: number;
  enrolled: boolean;
  progressPercent: number;
  completedResourcesCount: number;
  finalAssessmentTopicId?: string | null;
}

export interface TrackDetail extends TrackCatalogItem {
  modules: TrackModule[];
}

export interface PersonalizedRecommendations {
  targetRole: string;
  missingSkillsCovered: string[];
  recommendedTracks: TrackCatalogItem[];
}

export interface UserLearningStats {
  enrolledTracksCount: number;
  completedResourcesCount: number;
  totalLearningMinutes: number;
  inProgressTrack?: TrackCatalogItem | null;
}

export interface PdfQuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: LearningDifficulty;
}

export interface PdfDocumentItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  skills: string[];
  difficulty: LearningDifficulty;
  estimatedMinutes: number;
  pdfPageCount: number;
  provider: string;
  downloadAllowed: boolean;
  summary: string;
  hasExtractedQuiz: boolean;
  questionsCount: number;
  questions?: PdfQuizQuestion[];
}

export interface ConvertedQuizResult {
  pdfTitle: string;
  questionsCount: number;
  questions: PdfQuizQuestion[];
}

export interface PracticeDrillItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  skills: string[];
  difficulty: LearningDifficulty;
  estimatedMinutes: number;
  questionsCount: number;
  type: 'quiz' | 'pdf_document' | 'code_drill';
  hasQuestions: boolean;
  userPassed?: boolean;
  bestScore?: number;
  source: string;
}

export interface SubmitQuizPayload {
  selectedAnswers: Record<string, number>;
  timeSpentSeconds?: number;
}

export interface QuizQuestionResult {
  questionId: string;
  question: string;
  codeSnippet?: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmissionResult {
  resourceId: string;
  resourceTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswersCount: number;
  timeSpentSeconds?: number;
  attemptedAt: string;
  results: QuizQuestionResult[];
}

export interface ActiveQuizSession {
  resourceId: string;
  title: string;
  category: string;
  difficulty: LearningDifficulty;
  estimatedMinutes: number;
  questions: PdfQuizQuestion[];
}

