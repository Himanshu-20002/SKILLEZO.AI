// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useResumeComparison } from '@/hooks/useResumeComparison';
import { jobProfileService } from '@/services/job-profile.service';
import { jobMatchService } from '@/services/job-match.service';
import { tailoringPlanService } from '@/services/tailoring-plan.service';
import { JobProfile } from '@/types/job-profile.types';
import { JobMatchResultDTO } from '@/types/job-match.types';
import { TailoringPlanDTO } from '@/types/tailoring-plan.types';
import { ResumeComparisonResult } from '@/types/resume-comparison.types';

vi.mock('@/services/job-profile.service');
vi.mock('@/services/job-match.service');
vi.mock('@/services/tailoring-plan.service');

describe('Phase 6E.4 useResumeComparison Hook Lifecycle & Concurrency', () => {
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
    overallMatch: { score: 85, label: 'High Match' },
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
        requirementId: 'req-react',
        name: 'React',
        normalizedName: 'react',
        category: 'SKILL',
        importance: 'REQUIRED',
        matchState: 'PROVEN_RELEVANT',
        confidence: 0.95,
        explanation: 'Deep experience',
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp-1',
            label: 'Senior Engineer',
            excerpt: 'Built enterprise React app',
          },
        ],
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
      acceptedCount: 1,
      rejectedCount: 0,
      editedCount: 0,
      pendingCount: 0,
      protectedCount: 0,
    },
    proposals: [
      {
        id: 'prop-1',
        action: 'REWRITE',
        target: { section: 'SUMMARY', field: 'summary.text' },
        title: 'Optimize Senior Summary',
        reason: 'Align with React requirements',
        requirementIds: ['req-react'],
        evidence: [
          {
            sourceType: 'EXPERIENCE',
            sourceId: 'exp-1',
            label: 'Senior Engineer',
            excerpt: 'Built enterprise React app',
          },
        ],
        confidence: 0.95,
        priority: 'HIGH',
        userDecision: 'ACCEPTED',
        isProtected: false,
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  };

  const mockDiffResultA: ResumeComparisonResult = {
    hasChanges: true,
    totalChanges: 1,
    sectionCounts: {
      summary: 1,
      skills: 0,
      experience: 0,
      projects: 0,
      education: 0,
      layout: 0,
    },
    sections: {
      summary: [],
      skills: [],
      experience: [],
      projects: [],
      education: [],
      layout: [],
    },
    changes: [
      {
        id: 'diff-1',
        section: 'summary',
        changeType: 'REWRITTEN',
        title: 'Summary change',
        proposalId: 'prop-1',
        source: 'TAILORING_PLAN',
        masterValue: 'Developer',
        tailoredValue: 'Senior Developer',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('15. Master resume variant skips all network requests and blocks opening dialog', async () => {
    const { result } = renderHook(() =>
      useResumeComparison({
        activeResumeId: 'res-master-001',
        masterResumeId: 'res-master-001',
        variantType: 'MASTER',
        targetJobId: 'jp_alpha',
        diffResult: null,
      })
    );

    expect(jobProfileService.getJobProfile).not.toHaveBeenCalled();
    expect(jobMatchService.getJobMatch).not.toHaveBeenCalled();
    expect(tailoringPlanService.getPlan).not.toHaveBeenCalled();
    expect(result.current.viewModel).toBeNull();
    expect(result.current.isDialogOpen).toBe(false);

    // Attempting to open dialog on master must be a no-op
    act(() => {
      result.current.openComparison();
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it('16. Tailored resume variant initializes view model cleanly and loads upstream context', async () => {
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue(mockJobMatchA);
    vi.mocked(tailoringPlanService.getPlan).mockResolvedValue(mockTailoringPlanA);

    const { result } = renderHook(() =>
      useResumeComparison({
        activeResumeId: 'res-tailored-001',
        masterResumeId: 'res-master-001',
        variantType: 'TAILORED',
        targetJobId: 'jp_alpha',
        diffResult: mockDiffResultA,
      })
    );

    await waitFor(() => {
      expect(result.current.viewModel).not.toBeNull();
    });

    expect(result.current.viewModel?.totalChanges).toBe(1);
    expect(result.current.viewModel?.targetRole).toBe('Senior Frontend Engineer');
    expect(result.current.viewModel?.targetCompany).toBe('Google');
  });

  it('17. Tailored variant with 0 changes opens comparison successfully', async () => {
    const zeroDiffResult: ResumeComparisonResult = {
      hasChanges: false,
      totalChanges: 0,
      sectionCounts: { summary: 0, skills: 0, experience: 0, projects: 0, education: 0, layout: 0 },
      sections: { summary: [], skills: [], experience: [], projects: [], education: [], layout: [] },
      changes: [],
    };

    const { result } = renderHook(() =>
      useResumeComparison({
        activeResumeId: 'res-tailored-zero',
        masterResumeId: 'res-master-001',
        variantType: 'TAILORED',
        targetJobId: null,
        diffResult: zeroDiffResult,
      })
    );

    // Initial state: dialog is closed
    expect(result.current.isDialogOpen).toBe(false);

    // Invariant 1: Candidate can ALWAYS open comparison even with 0 changes
    act(() => {
      result.current.openComparison();
    });

    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.viewModel?.totalChanges).toBe(0);
  });

  it('18. Monotonic sequence: rapid variant switching (Variant A -> Variant B) discards stale response from A', async () => {
    let resolveA!: (val: JobProfile) => void;
    const promiseA = new Promise<JobProfile>((res) => {
      resolveA = res;
    });

    vi.mocked(jobProfileService.getJobProfile).mockImplementation((jobId: string) => {
      if (jobId === 'jp_alpha') return promiseA;
      return Promise.resolve(mockJobProfileB);
    });
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue(null as any);
    vi.mocked(tailoringPlanService.getPlan).mockResolvedValue(null as any);

    const { result, rerender } = renderHook(
      ({ activeResumeId, targetJobId }) =>
        useResumeComparison({
          activeResumeId,
          masterResumeId: 'res-master-001',
          variantType: 'TAILORED',
          targetJobId,
          diffResult: mockDiffResultA,
        }),
      {
        initialProps: { activeResumeId: 'res-tailored-A', targetJobId: 'jp_alpha' },
      }
    );

    // Rapidly switch to Variant B
    rerender({ activeResumeId: 'res-tailored-B', targetJobId: 'jp_beta' });

    await waitFor(() => {
      expect(result.current.viewModel?.resumeId).toBe('res-tailored-B');
      expect(result.current.viewModel?.targetRole).toBe('Staff Backend Engineer');
    });

    // Resolve stale Variant A promise
    act(() => {
      resolveA(mockJobProfileA);
    });

    // Verify Variant B state was NOT overwritten by stale response A
    expect(result.current.viewModel?.resumeId).toBe('res-tailored-B');
    expect(result.current.viewModel?.targetRole).toBe('Staff Backend Engineer');
  });

  it('19. Switching active resume closes or resets comparison dialog state cleanly', async () => {
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);

    const { result, rerender } = renderHook(
      ({ activeResumeId }) =>
        useResumeComparison({
          activeResumeId,
          masterResumeId: 'res-master-001',
          variantType: 'TAILORED',
          targetJobId: 'jp_alpha',
          diffResult: mockDiffResultA,
        }),
      {
        initialProps: { activeResumeId: 'res-tailored-A' },
      }
    );

    // Open dialog on Variant A
    act(() => {
      result.current.openComparison();
      result.current.selectChange('diff-1');
    });

    expect(result.current.isDialogOpen).toBe(true);
    expect(result.current.selectedChangeId).toBe('diff-1');

    // Switch active resume to Variant B
    act(() => {
      rerender({ activeResumeId: 'res-tailored-B' });
    });

    // Invariant: Modal and selection reset immediately
    expect(result.current.isDialogOpen).toBe(false);
    expect(result.current.selectedChangeId).toBeNull();
  });

  it('20. Selecting a change sets selectedChangeId and enables opening evidence drawer', async () => {
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);
    vi.mocked(jobMatchService.getJobMatch).mockResolvedValue(mockJobMatchA);
    vi.mocked(tailoringPlanService.getPlan).mockResolvedValue(mockTailoringPlanA);

    const { result } = renderHook(() =>
      useResumeComparison({
        activeResumeId: 'res-tailored-001',
        masterResumeId: 'res-master-001',
        variantType: 'TAILORED',
        targetJobId: 'jp_alpha',
        diffResult: mockDiffResultA,
      })
    );

    await waitFor(() => {
      expect(result.current.viewModel).not.toBeNull();
    });

    act(() => {
      result.current.selectChange('diff-1');
    });

    expect(result.current.selectedChangeId).toBe('diff-1');
    expect(result.current.selectedChange?.diffItemId).toBe('diff-1');

    act(() => {
      result.current.openEvidenceDrawer();
    });

    expect(result.current.isEvidenceDrawerOpen).toBe(true);
    expect(result.current.selectedEvidenceDrawerVM?.title).toBe('Summary change');
  });

  it('21. Stale evidence selection does not bleed across variant switch', async () => {
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);

    const { result, rerender } = renderHook(
      ({ activeResumeId }) =>
        useResumeComparison({
          activeResumeId,
          masterResumeId: 'res-master-001',
          variantType: 'TAILORED',
          targetJobId: 'jp_alpha',
          diffResult: mockDiffResultA,
        }),
      {
        initialProps: { activeResumeId: 'res-tailored-A' },
      }
    );

    act(() => {
      result.current.openEvidenceDrawer('diff-1');
    });

    expect(result.current.isEvidenceDrawerOpen).toBe(true);
    expect(result.current.selectedChangeId).toBe('diff-1');

    // Switch active resume to Variant B
    act(() => {
      rerender({ activeResumeId: 'res-tailored-B' });
    });

    expect(result.current.isEvidenceDrawerOpen).toBe(false);
    expect(result.current.selectedChangeId).toBeNull();
    expect(result.current.selectedEvidenceDrawerVM).toBeNull();
  });

  it('22. Partial upstream data builds graceful fallback view model without crashing', async () => {
    // Simulate 404 or network errors for matches and plan
    vi.mocked(jobProfileService.getJobProfile).mockResolvedValue(mockJobProfileA);
    vi.mocked(jobMatchService.getJobMatch).mockRejectedValue(new Error('404 Not Found'));
    vi.mocked(tailoringPlanService.getPlan).mockRejectedValue(new Error('404 Not Found'));

    const { result } = renderHook(() =>
      useResumeComparison({
        activeResumeId: 'res-tailored-partial',
        masterResumeId: 'res-master-001',
        variantType: 'TAILORED',
        targetJobId: 'jp_alpha',
        diffResult: mockDiffResultA,
      })
    );

    await waitFor(() => {
      expect(result.current.viewModel).not.toBeNull();
    });

    // View model builds cleanly with available job profile data
    expect(result.current.viewModel?.targetRole).toBe('Senior Frontend Engineer');
    expect(result.current.viewModel?.totalChanges).toBe(1);
    expect(result.current.error).toBeNull();
  });
});
