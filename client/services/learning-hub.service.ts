import { apiFetch } from '@/lib/api';
import {
  TrackCatalogItem,
  TrackDetail,
  PersonalizedRecommendations,
  UserLearningStats,
  PdfDocumentItem,
  ConvertedQuizResult,
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
};
