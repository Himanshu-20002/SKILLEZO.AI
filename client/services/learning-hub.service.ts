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
  ClaimVerificationResult,
  LearningResourceDetail,
  AdminTrackDetail,
  CreateTrackInput,
  CreateModuleInput,
  CreateResourceInput,
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
   * Upload and index a PDF file as an administrator
   */
  async uploadAdminPdf(formData: FormData): Promise<PdfDocumentItem | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: PdfDocumentItem;
      }>('/api/learning-hub/admin/upload-pdf', {
        method: 'POST',
        body: formData,
      });
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to upload admin PDF:', err);
      throw err;
    }
  },

  /**
   * Delete a PDF document from the vault as an administrator
   */
  async deleteAdminPdf(id: string): Promise<boolean> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: { deleted: boolean; id: string };
      }>(`/api/learning-hub/admin/pdfs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return !!res.data?.deleted;
    } catch (err) {
      console.error('[learningHubService] Failed to delete admin PDF:', err);
      throw err;
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
   * Fetch full resource details (including markdown, provider, externalUrl)
   */
  async getResourceById(id: string): Promise<LearningResourceDetail | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: LearningResourceDetail;
      }>(`/api/learning-hub/resources/${encodeURIComponent(id)}`);
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to get resource details:', err);
      return null;
    }
  },

  /**
   * Admin: List all tracks (including drafts)
   */
  async adminListTracks(): Promise<AdminTrackDetail[]> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: AdminTrackDetail[];
      }>('/api/learning-hub/admin/tracks');
      return res.data || [];
    } catch (err) {
      console.error('[learningHubService] Failed to list admin tracks:', err);
      return [];
    }
  },

  /**
   * Admin: Create track
   */
  async adminCreateTrack(data: CreateTrackInput): Promise<any> {
    const res = await apiFetch<{
      success: boolean;
      data: any;
    }>('/api/learning-hub/admin/tracks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Update track
   */
  async adminUpdateTrack(id: string, data: Partial<CreateTrackInput>): Promise<any> {
    const res = await apiFetch<{
      success: boolean;
      data: any;
    }>(`/api/learning-hub/admin/tracks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Delete track
   */
  async adminDeleteTrack(id: string): Promise<boolean> {
    const res = await apiFetch<{
      success: boolean;
      data: { deleted: boolean };
    }>(`/api/learning-hub/admin/tracks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.data?.deleted ?? false;
  },

  /**
   * Admin: Add module to track
   */
  async adminAddModule(trackId: string, data: CreateModuleInput): Promise<any> {
    const res = await apiFetch<{
      success: boolean;
      data: any;
    }>(`/api/learning-hub/admin/tracks/${encodeURIComponent(trackId)}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Update module
   */
  async adminUpdateModule(
    trackId: string,
    moduleId: string,
    data: CreateModuleInput
  ): Promise<any> {
    const res = await apiFetch<{
      success: boolean;
      data: any;
    }>(
      `/api/learning-hub/admin/tracks/${encodeURIComponent(trackId)}/modules/${encodeURIComponent(
        moduleId
      )}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Admin: Delete module
   */
  async adminDeleteModule(trackId: string, moduleId: string): Promise<boolean> {
    const res = await apiFetch<{
      success: boolean;
      data: { deleted: boolean };
    }>(
      `/api/learning-hub/admin/tracks/${encodeURIComponent(trackId)}/modules/${encodeURIComponent(
        moduleId
      )}`,
      {
        method: 'DELETE',
      }
    );
    return res.data?.deleted ?? false;
  },

  /**
   * Admin: Create and attach resource to module
   */
  async adminCreateResource(
    trackId: string,
    moduleId: string,
    data: CreateResourceInput
  ): Promise<any> {
    const res = await apiFetch<{
      success: boolean;
      data: any;
    }>(
      `/api/learning-hub/admin/tracks/${encodeURIComponent(trackId)}/modules/${encodeURIComponent(
        moduleId
      )}/resources`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.data;
  },

  /**
   * Admin: Update resource
   */
  async adminUpdateResource(
    resourceId: string,
    data: Partial<CreateResourceInput>
  ): Promise<any> {
    const res = await apiFetch<{
      success: boolean;
      data: any;
    }>(`/api/learning-hub/admin/resources/${encodeURIComponent(resourceId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  /**
   * Admin: Delete resource from module
   */
  async adminDeleteResource(
    trackId: string,
    moduleId: string,
    resourceId: string
  ): Promise<boolean> {
    const res = await apiFetch<{
      success: boolean;
      data: { deleted: boolean };
    }>(
      `/api/learning-hub/admin/tracks/${encodeURIComponent(trackId)}/modules/${encodeURIComponent(
        moduleId
      )}/resources/${encodeURIComponent(resourceId)}`,
      {
        method: 'DELETE',
      }
    );
    return res.data?.deleted ?? false;
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

  /**
   * Claim official cryptographic skill verification upon scoring >= 70%
   */
  async claimVerification(resourceId: string): Promise<ClaimVerificationResult | null> {
    try {
      const res = await apiFetch<{
        success: boolean;
        data: ClaimVerificationResult;
      }>(`/api/learning-hub/resources/${encodeURIComponent(resourceId)}/claim-verification`, {
        method: 'POST',
      });
      return res.data;
    } catch (err) {
      console.error('[learningHubService] Failed to claim verification:', err);
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
