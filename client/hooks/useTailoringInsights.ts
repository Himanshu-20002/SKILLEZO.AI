'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TailoringInsightsViewModel } from '@/types/tailoring-insights.types';
import { ResumeComparisonResult } from '@/types/resume-comparison.types';
import { jobProfileService } from '@/services/job-profile.service';
import { jobMatchService } from '@/services/job-match.service';
import { tailoringPlanService } from '@/services/tailoring-plan.service';
import { buildTailoringInsightsViewModel } from '@/lib/resume-studio/tailoring-insights.adapter';

export interface UseTailoringInsightsReturn {
  viewModel: TailoringInsightsViewModel | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTailoringInsights(
  activeResumeId: string | null | undefined,
  targetJobId: string | null | undefined,
  variantType: 'MASTER' | 'TAILORED' | undefined,
  diffResult: ResumeComparisonResult | null = null
): UseTailoringInsightsReturn {
  const [viewModel, setViewModel] = useState<TailoringInsightsViewModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const insightsRequestIdRef = useRef<number>(0);
  const activeResumeIdRef = useRef<string | null | undefined>(activeResumeId);

  useEffect(() => {
    activeResumeIdRef.current = activeResumeId;
  }, [activeResumeId]);

  const loadInsights = useCallback(async () => {
    // Invariant 1: Master Resumes never fetch tailoring insights (0 network calls)
    if (variantType !== 'TAILORED' || !targetJobId || !activeResumeId) {
      setViewModel(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const currentRequestId = ++insightsRequestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      // Concurrent fetching of upstream persisted sources
      const [jobProfileRes, jobMatchRes, tailoringPlanRes] = await Promise.allSettled([
        jobProfileService.getJobProfile(targetJobId),
        jobMatchService.getJobMatch(targetJobId),
        tailoringPlanService.getPlan(targetJobId),
      ]);

      // Invariant 2: Concurrency check - discard stale transactions
      if (
        currentRequestId !== insightsRequestIdRef.current ||
        activeResumeIdRef.current !== activeResumeId
      ) {
        return;
      }

      const jobProfile = jobProfileRes.status === 'fulfilled' ? jobProfileRes.value : null;
      const jobMatch = jobMatchRes.status === 'fulfilled' ? jobMatchRes.value : null;
      const tailoringPlan = tailoringPlanRes.status === 'fulfilled' ? tailoringPlanRes.value : null;

      // Invariant 3: If all services rejected, raise error
      if (!jobProfile && !jobMatch && !tailoringPlan) {
        const primaryError =
          (jobProfileRes.status === 'rejected' && jobProfileRes.reason?.message) ||
          (jobMatchRes.status === 'rejected' && jobMatchRes.reason?.message) ||
          'Failed to load upstream job and match intelligence';
        setError(primaryError);
        setViewModel(null);
        return;
      }

      // Build deterministic view model with available data
      const vm = buildTailoringInsightsViewModel({
        resumeId: activeResumeId,
        targetJobId,
        jobProfile,
        jobMatch,
        tailoringPlan,
        diffResult,
      });

      setViewModel(vm);
    } catch (err: unknown) {
      if (currentRequestId === insightsRequestIdRef.current) {
        const msg = err instanceof Error ? err.message : 'Failed to load tailoring insights';
        setError(msg);
      }
    } finally {
      if (currentRequestId === insightsRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [activeResumeId, targetJobId, variantType, diffResult]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return {
    viewModel,
    isLoading,
    error,
    refetch: loadInsights,
  };
}
