'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ResumeComparisonResult } from '@/types/resume-comparison.types';
import {
  ComparisonViewMode,
  ComparisonChangeVM,
  ComparisonEvidenceDrawerVM,
  ResumeComparisonViewModel,
} from '@/types/resume-comparison-view.types';
import {
  buildResumeComparisonViewModel,
  buildEvidenceDrawerViewModel,
} from '@/lib/resume-studio/resume-comparison.adapter';
import { jobProfileService } from '@/services/job-profile.service';
import { jobMatchService } from '@/services/job-match.service';
import { tailoringPlanService } from '@/services/tailoring-plan.service';

export interface UseResumeComparisonParams {
  activeResumeId?: string | null;
  masterResumeId?: string | null;
  variantType?: 'MASTER' | 'TAILORED';
  targetJobId?: string | null;
  diffResult?: ResumeComparisonResult | null;
}

export interface UseResumeComparisonReturn {
  // Dialog visibility
  isDialogOpen: boolean;
  openComparison: () => void;
  closeComparison: () => void;

  // View Mode
  viewMode: ComparisonViewMode;
  setViewMode: (mode: ComparisonViewMode) => void;

  // Selected Change
  selectedChangeId: string | null;
  selectedChange: ComparisonChangeVM | null;
  selectChange: (changeId: string | null) => void;

  // Evidence Drawer
  isEvidenceDrawerOpen: boolean;
  openEvidenceDrawer: (changeId?: string) => void;
  closeEvidenceDrawer: () => void;
  selectedEvidenceDrawerVM: ComparisonEvidenceDrawerVM | null;

  // ViewModel & Network Status
  viewModel: ResumeComparisonViewModel | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useResumeComparison(
  activeResumeIdOrParams?: string | null | UseResumeComparisonParams,
  masterResumeIdArg?: string | null,
  variantTypeArg?: 'MASTER' | 'TAILORED',
  targetJobIdArg?: string | null,
  diffResultArg?: ResumeComparisonResult | null
): UseResumeComparisonReturn {
  // Normalize params to support both object and positional invocations
  const isObjectParams =
    typeof activeResumeIdOrParams === 'object' &&
    activeResumeIdOrParams !== null &&
    !Array.isArray(activeResumeIdOrParams);

  const activeResumeId = isObjectParams
    ? activeResumeIdOrParams.activeResumeId
    : (activeResumeIdOrParams as string | null | undefined);

  const masterResumeId = isObjectParams
    ? activeResumeIdOrParams.masterResumeId
    : masterResumeIdArg;

  const variantType = isObjectParams
    ? activeResumeIdOrParams.variantType
    : variantTypeArg;

  const targetJobId = isObjectParams
    ? activeResumeIdOrParams.targetJobId
    : targetJobIdArg;

  const diffResult = isObjectParams
    ? activeResumeIdOrParams.diffResult ?? null
    : diffResultArg ?? null;

  // Dialog & View Mode State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ComparisonViewMode>('SIDE_BY_SIDE');
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(null);
  const [isEvidenceDrawerOpen, setIsEvidenceDrawerOpen] = useState<boolean>(false);

  // ViewModel State
  const [viewModel, setViewModel] = useState<ResumeComparisonViewModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Triple-Token Concurrency Guard refs
  const comparisonRequestIdRef = useRef<number>(0);
  const activeResumeIdRef = useRef<string | null | undefined>(activeResumeId);
  const selectedChangeIdRef = useRef<string | null>(selectedChangeId);
  const prevResumeIdRef = useRef<string | null | undefined>(activeResumeId);

  // Track active resume changes and invalidate modal state
  useEffect(() => {
    activeResumeIdRef.current = activeResumeId;
    if (prevResumeIdRef.current !== activeResumeId) {
      prevResumeIdRef.current = activeResumeId;
      setIsDialogOpen(false);
      setSelectedChangeId(null);
      selectedChangeIdRef.current = null;
      setIsEvidenceDrawerOpen(false);
      setViewModel(null);
      setError(null);
    }
  }, [activeResumeId]);

  useEffect(() => {
    selectedChangeIdRef.current = selectedChangeId;
  }, [selectedChangeId]);

  // Data loading function with triple-token guarding
  const loadComparisonData = useCallback(async () => {
    // Invariant 1: Master Resumes never fetch comparison intelligence (0 network calls, 0 overhead)
    if (variantType !== 'TAILORED' || !activeResumeId) {
      setViewModel(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const currentRequestId = ++comparisonRequestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      let jobProfile = null;
      let jobMatch = null;
      let tailoringPlan = null;

      // Only attempt remote intelligence fetch if targetJobId is present
      if (targetJobId) {
        const [jobProfileRes, jobMatchRes, tailoringPlanRes] = await Promise.allSettled([
          jobProfileService.getJobProfile(targetJobId),
          jobMatchService.getJobMatch(targetJobId),
          tailoringPlanService.getPlan(targetJobId),
        ]);

        // Invariant 2: Discard stale responses if active resume changed or newer request started
        if (
          currentRequestId !== comparisonRequestIdRef.current ||
          activeResumeIdRef.current !== activeResumeId
        ) {
          return;
        }

        jobProfile = jobProfileRes.status === 'fulfilled' ? jobProfileRes.value : null;
        jobMatch = jobMatchRes.status === 'fulfilled' ? jobMatchRes.value : null;
        tailoringPlan = tailoringPlanRes.status === 'fulfilled' ? tailoringPlanRes.value : null;
      }

      // Concurrency check before updating state
      if (
        currentRequestId !== comparisonRequestIdRef.current ||
        activeResumeIdRef.current !== activeResumeId
      ) {
        return;
      }

      // Invariant 3: Build deterministic comparison view model
      // Safe fallback when diffResult is not yet supplied
      const safeDiffResult: ResumeComparisonResult = diffResult || {
        hasChanges: false,
        totalChanges: 0,
        sectionCounts: {
          summary: 0,
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
        changes: [],
      };

      const vm = buildResumeComparisonViewModel({
        diffResult: safeDiffResult,
        resumeId: activeResumeId,
        masterResumeId: masterResumeId || '',
        targetJobId,
        jobProfile,
        jobMatch,
        tailoringPlan,
      });

      setViewModel(vm);
    } catch (err: unknown) {
      if (currentRequestId === comparisonRequestIdRef.current) {
        const msg = err instanceof Error ? err.message : 'Failed to load comparison data';
        setError(msg);
      }
    } finally {
      if (currentRequestId === comparisonRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [activeResumeId, masterResumeId, variantType, targetJobId, diffResult]);

  useEffect(() => {
    loadComparisonData();
  }, [loadComparisonData]);

  // Modal open/close actions
  const openComparison = useCallback(() => {
    // Invariant: Master Resume isolation
    if (variantType === 'MASTER') {
      return;
    }
    setIsDialogOpen(true);
  }, [variantType]);

  const closeComparison = useCallback(() => {
    setIsDialogOpen(false);
    setIsEvidenceDrawerOpen(false);
  }, []);

  // Change selection actions
  const selectChange = useCallback((changeId: string | null) => {
    selectedChangeIdRef.current = changeId;
    setSelectedChangeId(changeId);
  }, []);

  // Evidence drawer open/close actions
  const openEvidenceDrawer = useCallback((changeId?: string) => {
    if (changeId) {
      selectedChangeIdRef.current = changeId;
      setSelectedChangeId(changeId);
    }
    setIsEvidenceDrawerOpen(true);
  }, []);

  const closeEvidenceDrawer = useCallback(() => {
    setIsEvidenceDrawerOpen(false);
  }, []);

  // Derive selected change and drawer VM
  const selectedChange = useMemo(() => {
    if (!selectedChangeId || !viewModel) return null;
    return (
      viewModel.allChanges.find(
        (c) => c.id === selectedChangeId || c.diffItemId === selectedChangeId
      ) || null
    );
  }, [selectedChangeId, viewModel]);

  const selectedEvidenceDrawerVM = useMemo(() => {
    if (!selectedChange) return null;
    return buildEvidenceDrawerViewModel(selectedChange);
  }, [selectedChange]);

  return {
    isDialogOpen,
    openComparison,
    closeComparison,
    viewMode,
    setViewMode,
    selectedChangeId,
    selectedChange,
    selectChange,
    isEvidenceDrawerOpen,
    openEvidenceDrawer,
    closeEvidenceDrawer,
    selectedEvidenceDrawerVM,
    viewModel,
    isLoading,
    error,
    refetch: loadComparisonData,
  };
}
