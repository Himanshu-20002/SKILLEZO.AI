import { apiFetch } from '@/lib/api';
import {
  TrackCatalogItem,
  TrackDetail,
  PersonalizedRecommendations,
  UserLearningStats,
  PdfDocumentItem,
  ConvertedQuizResult,
  PracticeDrillItem,
  ActiveQuizSession,
  SubmitQuizPayload,
  QuizSubmissionResult,
} from '@/types/learning-hub';

export const learningHubService = {
  /**
   * Fetch PDF vault cheat-sheets and question banks
   */
  async listPdfs(params?: {
    category?: string;
    search?: string;
  }): Promise<PdfDocumentItem[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'All') {
        searchParams.set('category', params.category);
      }
      if (params?.search) {
        searchParams.set('search', params.search);
      }

      const queryStr = searchParams.toString();
      const endpoint = `/api/learning-hub/vault/pdfs${queryStr ? `?${queryStr}` : ''}`;

      const res = await apiFetch<{
        success: boolean;
        data: PdfDocumentItem[] | { pdfs: PdfDocumentItem[] };
      }>(endpoint);

      if (Array.isArray(res.data)) {
        return res.data;
      }
      return res.data?.pdfs || [];
    } catch (err) {
      console.error('[learningHubService] Failed to list PDFs:', err);
      return [];
    }
  },

  /**
   * Fetch single PDF document details
   */
  async getPdf(id: string): Promise<PdfDocumentItem | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: PdfDocumentItem;
      }>(`/api/learning-hub/vault/pdfs/${encodeURIComponent(id)}`);
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to fetch PDF:', err);
      return null;
    }
  },

  /**
   * Trigger Gemini AI extraction of questions from a PDF
   */
  async convertPdfToQuiz(id: string): Promise<ConvertedQuizResult | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: ConvertedQuizResult;
      }>(`/api/learning-hub/vault/pdfs/${encodeURIComponent(id)}/convert-to-quiz`, {
        method: 'POST',
      });
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to convert PDF to quiz:', err);
      return null;
    }
  },
  /**
   * Fetch tracks catalog with optional category, difficulty, or search query
   */
  async getCatalog(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<{ tracks: TrackCatalogItem[]; categories: string[] }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'All') {
        searchParams.set('category', params.category);
      }
      if (params?.difficulty) {
        searchParams.set('difficulty', params.difficulty);
      }
      if (params?.search) {
        searchParams.set('search', params.search);
      }

      const queryStr = searchParams.toString();
      const endpoint = `/api/learning-hub/catalog${queryStr ? `?${queryStr}` : ''}`;

      const res = await apiFetch<{
        success: boolean;
        data: { tracks: TrackCatalogItem[]; categories: string[] };
      }>(endpoint);

      return res.data || { tracks: [], categories: [] };
    } catch (err) {
      console.error('[learningHubService] Failed to fetch catalog:', err);
      return { tracks: [], categories: [] };
    }
  },

  /**
   * Fetch track details by slug, including full module and resource trees
   */
  async getTrackBySlug(slug: string): Promise<TrackDetail | null> {
    try {
      const res = await apiFetch<{ success: boolean; data: TrackDetail }>(
        `/api/learning-hub/tracks/${encodeURIComponent(slug)}`
      );
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to fetch track:', err);
      return null;
    }
  },

  /**
   * Fetch personalized track recommendations based on user's target role & missing skills
   */
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendations> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: PersonalizedRecommendations;
      }>('/api/learning-hub/personalized');
      return (
        res.data || {
          targetRole: 'Full-Stack Engineer',
          missingSkillsCovered: [],
          recommendedTracks: [],
        }
      );
    } catch (err) {
      console.error('[learningHubService] Failed to fetch recommendations:', err);
      return {
        targetRole: 'Full-Stack Engineer',
        missingSkillsCovered: [],
        recommendedTracks: [],
      };
    }
  },

  /**
   * Fetch user's aggregate learning metrics
   */
  async getUserStats(): Promise<UserLearningStats> {
    try {
      const res = await apiFetch<{ success: boolean; data: UserLearningStats }>(
        '/api/learning-hub/stats'
      );
      return (
        res.data || {
          enrolledTracksCount: 0,
          completedResourcesCount: 0,
          totalLearningMinutes: 0,
          inProgressTrack: null,
        }
      );
    } catch (err) {
      console.error('[learningHubService] Failed to fetch stats:', err);
      return {
        enrolledTracksCount: 0,
        completedResourcesCount: 0,
        totalLearningMinutes: 0,
        inProgressTrack: null,
      };
    }
  },

  /**
   * Enroll candidate in a track
   */
  async enrollTrack(trackId: string): Promise<boolean> {
    try {
      const res = await apiFetch<{ success: boolean }>(
        `/api/learning-hub/tracks/${encodeURIComponent(trackId)}/enroll`,
        { method: 'POST' }
      );
      return res.success;
    } catch (err) {
      console.error('[learningHubService] Failed to enroll in track:', err);
      return false;
    }
  },

  /**
   * Toggle resource completion status
   */
  async toggleResourceProgress(
    resourceId: string
  ): Promise<{ completed: boolean; totalCompletedCount: number } | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { completed: boolean; totalCompletedCount: number };
      }>(`/api/learning-hub/resources/${encodeURIComponent(resourceId)}/progress`, {
        method: 'POST',
      });
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to update resource progress:', err);
      return null;
    }
  },

  /**
   * List available practice drills and quizzes
   */
  async listPracticeDrills(params?: {
    category?: string;
    search?: string;
  }): Promise<PracticeDrillItem[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category && params.category !== 'All') {
        searchParams.set('category', params.category);
      }
      if (params?.search) {
        searchParams.set('search', params.search);
      }

      const queryStr = searchParams.toString();
      const endpoint = `/api/learning-hub/practice/drills${queryStr ? `?${queryStr}` : ''}`;

      const res = await apiFetch<{
        success: boolean;
        data: PracticeDrillItem[];
      }>(endpoint);

      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return FALLBACK_PRACTICE_DRILLS;
    } catch (err) {
      console.error('[learningHubService] Failed to list practice drills:', err);
      return FALLBACK_PRACTICE_DRILLS;
    }
  },

  /**
   * Get questions for an interactive quiz runner session
   */
  async getResourceQuestions(resourceId: string): Promise<ActiveQuizSession | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: ActiveQuizSession;
      }>(`/api/learning-hub/resources/${encodeURIComponent(resourceId)}/questions`);
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to fetch quiz questions:', err);
      return null;
    }
  },

  /**
   * Submit quiz answers deterministically
   */
  async submitQuiz(
    resourceId: string,
    payload: SubmitQuizPayload
  ): Promise<QuizSubmissionResult | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: QuizSubmissionResult;
      }>(`/api/learning-hub/resources/${encodeURIComponent(resourceId)}/submit-quiz`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to submit quiz:', err);
      return null;
    }
  },

  /**
   * On-demand generation of a targeted 5-question code blitz via Gemini
   */
  async generateBlitz(payload: {
    skill: string;
    category?: string;
    difficulty?: string;
  }): Promise<{
    drillId: string;
    title: string;
    questionsCount: number;
    questions: any[];
  } | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: {
          drillId: string;
          title: string;
          questionsCount: number;
          questions: any[];
        };
      }>(`/api/learning-hub/practice/generate-blitz`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to generate blitz:', err);
      return null;
    }
  },
};

const FALLBACK_PRACTICE_DRILLS: PracticeDrillItem[] = [
  {
    id: 'drill_react_19',
    title: 'React 19 Actions & Transition Lifecycle Blitz',
    slug: 'react-19-actions-blitz',
    category: 'Frontend',
    skills: ['React 19', 'useActionState', 'useOptimistic', 'Transitions'],
    difficulty: 'advanced',
    estimatedMinutes: 10,
    questionsCount: 5,
    type: 'quiz',
    hasQuestions: true,
    userPassed: false,
    source: 'skillezo_original',
  },
  {
    id: 'drill_nodejs_concurrency',
    title: 'Node.js Event Loop Phases & Concurrency Drill',
    slug: 'nodejs-event-loop-drill',
    category: 'Backend',
    skills: ['Node.js', 'Event Loop', 'process.nextTick', 'Worker Threads'],
    difficulty: 'advanced',
    estimatedMinutes: 12,
    questionsCount: 5,
    type: 'quiz',
    hasQuestions: true,
    userPassed: true,
    bestScore: 80,
    source: 'skillezo_original',
  },
  {
    id: 'drill_postgres_indexing',
    title: 'PostgreSQL B-Tree vs GIN Indexing & Query Tuning',
    slug: 'postgres-indexing-drill',
    category: 'Database',
    skills: ['PostgreSQL', 'Indexing', 'EXPLAIN ANALYZE', 'Performance'],
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    questionsCount: 5,
    type: 'quiz',
    hasQuestions: true,
    userPassed: false,
    source: 'skillezo_original',
  },
  {
    id: 'drill_docker_k8s',
    title: 'Docker Multi-Stage Builds & Kubernetes Pod Probes',
    slug: 'docker-k8s-drill',
    category: 'DevOps',
    skills: ['Docker', 'Kubernetes', 'Health Checks', 'Containers'],
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    questionsCount: 5,
    type: 'quiz',
    hasQuestions: true,
    userPassed: false,
    source: 'skillezo_original',
  },
  {
    id: 'drill_system_design',
    title: 'System Design: Distributed Caching & Sharding Tradeoffs',
    slug: 'system-design-caching-drill',
    category: 'System Design',
    skills: ['System Design', 'Redis', 'Consistency', 'Partitioning'],
    difficulty: 'advanced',
    estimatedMinutes: 15,
    questionsCount: 5,
    type: 'quiz',
    hasQuestions: true,
    userPassed: false,
    source: 'skillezo_original',
  },
];
