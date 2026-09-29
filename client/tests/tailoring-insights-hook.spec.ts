// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTailoringInsights } from '@/hooks/useTailoringInsights';
import { jobProfileService } from '@/services/job-profile.service';
import { jobMatchService } from '@/services/job-match.service';
import { tailoringPlanService } from '@/services/tailoring-plan.service';
import { JobProfile } from '@/types/job-profile.types';
import { JobMatchResultDTO } from '@/types/job-match.types';
import { TailoringPlanDTO } from '@/types/tailoring-plan.types';

vi.mock('@/services/job-profile.service');
vi.mock('@/services/job-match.service');
vi.mock('@/services/tailoring-plan.service');

describe('Phase 6E.3 useTailoringInsights Hook Lifecycle & Concurrency', () => {
  const mockJobProfileA: JobProfile = {
    id: 'jp_alpha',
    userId: 'user_1',
    displayName: 'Google Senior Frontend',
    jobTitle: 'Senior Frontend Engineer',
    company: 'Google',
    rawDescription: 'React and TS role',
    normalizedDescription: 'React and TS role',
    sourceHash: 'h1',
    jobFingerprint: 'fp1',
    analysisStatus: 'ANALYZED',
    analysisVersion: 1,
    analysis: {
      seniority: 'SENIOR',
      responsibilities: ['Build UI'],
      requirements: [
        {
          name: 'React',
          normalizedName: 'react',
          category: 'SKILL',
          importance: 'REQUIRED',
          confidence: 0.9,
          evidence: { text: 'React required' },
        },
      ],
      experienceRequirements: [],
      educationRequirements: [],
      keywords: ['react'],
    },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  const mockJobProfileB: JobProfile = {
    ...mockJobProfileA,
    id: 'jp_beta',
    jobTitle: 'Staff Backend Engineer',
    company: 'Stripe',
  };

  const mockJobMatchA: JobMatchResultDTO = {
    id: 'jm_alpha',
    userId: 'user_1',
    jobProfileId: 'jp_alpha',
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    isStale: false,
    summary: {
      totalRequirements: 1,
      proven: 1,
      underrepresented: 0,
      partial: 0,
      related: 0,
      missing: 0,
      insufficient: 0,
      needsReview: 0,
      requiredTotal: 1,
      requiredProven: 1,
    },
    requirementMatches: [
      {
        requirementId: 'req_react',
        name: 'React',
        normalizedName: 'react',
        category: 'SKILL',
        importance: 'REQUIRED',
        matchState: 'PROVEN_RELEVANT',
        confidence: 0.9,
        evidence: [],
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  const mockTailoringPlanA: TailoringPlanDTO = {
    id: 'tp_alpha',
    userId: 'user_1',
    jobProfileId: 'jp_alpha',
    sourceProfileVersion: 1,
    jobAnalysisVersion: 1,
    intensity: 'BALANCED',
    status: 'READY',
    planVersion: 1,
    isStale: false,
    summary: {
      totalProposals: 1,
      pendingCount: 0,
      acceptedCount: 1,
      rejectedCount: 0,
      editedCount: 0,
      protectedCount: 0,
      actionBreakdown: { REWRITE: 1 },
      sectionBreakdown: { SUMMARY: 1 },
    },
    proposals: [
      {
        id: 'prop_alpha_summary',
        action: 'REWRITE',
        target: { section: 'SUMMARY', field: 'summary.text' },
        title: 'Align summary with Google React role',
        reason: 'Targeting Google Senior Frontend role.',
        requirementIds: ['req_react'],
        evidence: [],
        confidence: 0.95,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
        isProtected: false,
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Scenario 12: Master resume variant dispatches 0 network requests and returns null', async () => {
    const { result } = renderHook(() =>
      useTailoringInsights('res_master_01', 'jp_alpha', 'MASTER', null)
    );

    expect(result.current.viewModel).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // 0 network requests dispatched
    expect(jobProfileService.getJobProfile).not.toHaveBeenCalled();
    expect(jobMatchService.getJobMatch).not.toHaveBeenCalled();
    expect(tailoringPlanService.getPlan).not.toHaveBeenCalled();
  });

  it('Scenario 13: Monotonic sequence guard: delayed response from Variant A cannot overwrite Variant B', async () => {
    let resolveJobProfileA: (val: JobProfile) => void;
    const delayedJobProfileAPromise = new Promise<JobProfile>((resolve) => {
      resolveJobProfileA = resolve;
    });

    // Variant A call delays
    vi.mocked(jobProfileService.getJobProfile).mockImplementation(async (id: string) => {
      if (id === 'jp_alpha') return delayedJobProfileAPromise;
      return mockJobProfileB;
    });
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue(mockJobMatchA);
    vi.mocked(tailoringPlanService.getPlan).mockResolvedValue(mockTailoringPlanA);

    // Initial render with Variant A
    const { result, rerender } = renderHook(
      ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
        useTailoringInsights(resumeId, jobId, 'TAILORED', null),
      {
        initialProps: { resumeId: 'res_tailored_A', jobId: 'jp_alpha' },
      }
    );

    expect(result.current.isLoading).toBe(true);

    // User switches quickly to Variant B before A resolves
    rerender({ resumeId: 'res_tailored_B', jobId: 'jp_beta' });

    // Wait for Variant B to resolve
    await waitFor(() => {
      expect(result.current.viewModel?.targetJobId).toBe('jp_beta');
    });

    expect(result.current.viewModel?.targetCompany).toBe('Stripe');
    expect(result.current.viewModel?.targetRole).toBe('Staff Backend Engineer');

    // Now resolve Variant A late
    await act(async () => {
      resolveJobProfileA!(mockJobProfileA);
    });

    // Variant B state MUST NOT be overwritten by delayed A!
    expect(result.current.viewModel?.targetJobId).toBe('jp_beta');
    expect(result.current.viewModel?.targetCompany).toBe('Stripe');
  });

  it('Scenario 14: Discards stale JobMatch response if resume ID changes mid-flight', async () => {
    let resolveMatchA: (val: JobMatchResultDTO) => void;
    const delayedMatchAPromise = new Promise<JobMatchResultDTO>((resolve) => {
      resolveMatchA = resolve;
    });

    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileB);
    vi.mocked(jobMatchService.getJobMatch).mockImplementation(async (id: string) => {
      if (id === 'jp_alpha') return delayedMatchAPromise;
      return { ...mockJobMatchA, jobProfileId: 'jp_beta' };
    });
    vi.mocked(tailoringPlanService.getPlan).mockResolvedValue(mockTailoringPlanA);

    const { result, rerender } = renderHook(
      ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
        useTailoringInsights(resumeId, jobId, 'TAILORED', null),
      {
        initialProps: { resumeId: 'res_tailored_A', jobId: 'jp_alpha' },
      }
    );

    // Rapid switch to B
    rerender({ resumeId: 'res_tailored_B', jobId: 'jp_beta' });

    await waitFor(() => {
      expect(result.current.viewModel?.targetJobId).toBe('jp_beta');
    });

    // Late resolve of Match A
    await act(async () => {
      resolveMatchA!(mockJobMatchA);
    });

    expect(result.current.viewModel?.targetJobId).toBe('jp_beta');
  });

  it('Scenario 15: Discards stale TailoringPlan response if resume ID changes mid-flight', async () => {
    let resolvePlanA: (val: TailoringPlanDTO) => void;
    const delayedPlanAPromise = new Promise<TailoringPlanDTO>((resolve) => {
      resolvePlanA = resolve;
    });

    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileB);
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue({ ...mockJobMatchA, jobProfileId: 'jp_beta' });
    vi.mocked(tailoringPlanService.getPlan).mockImplementation(async (id: string) => {
      if (id === 'jp_alpha') return delayedPlanAPromise;
      return { ...mockTailoringPlanA, jobProfileId: 'jp_beta' };
    });

    const { result, rerender } = renderHook(
      ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
        useTailoringInsights(resumeId, jobId, 'TAILORED', null),
      {
        initialProps: { resumeId: 'res_tailored_A', jobId: 'jp_alpha' },
      }
    );

    rerender({ resumeId: 'res_tailored_B', jobId: 'jp_beta' });

    await waitFor(() => {
      expect(result.current.viewModel?.targetJobId).toBe('jp_beta');
    });

    await act(async () => {
      resolvePlanA!(mockTailoringPlanA);
    });

    expect(result.current.viewModel?.targetJobId).toBe('jp_beta');
  });

  it('Scenario 16: Partial data: Plan missing/404 builds graceful fallback VM from JobMatch & JobProfile', async () => {
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue(mockJobMatchA);
    // TailoringPlan rejects with 404
    vi.mocked(tailoringPlanService.getPlan).mockRejectedValue(new Error('Tailoring plan not found'));

    const { result } = renderHook(() =>
      useTailoringInsights('res_tailored_01', 'jp_alpha', 'TAILORED', null)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.viewModel).toBeDefined();
    expect(result.current.viewModel?.targetRole).toBe('Senior Frontend Engineer');
    expect(result.current.viewModel?.targetCompany).toBe('Google');
    expect(result.current.viewModel?.summary.matchedRequirements).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('Scenario 17: refetch() triggers clean reload of current variant insights', async () => {
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue(mockJobMatchA);
    vi.mocked(tailoringPlanService.getPlan).mockResolvedValue(mockTailoringPlanA);

    const { result } = renderHook(() =>
      useTailoringInsights('res_tailored_01', 'jp_alpha', 'TAILORED', null)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(jobProfileService.getJobProfile).toHaveBeenCalledTimes(1);

    // Call refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(jobProfileService.getJobProfile).toHaveBeenCalledTimes(2);
    expect(result.current.viewModel?.targetJobId).toBe('jp_alpha');
  });
});
