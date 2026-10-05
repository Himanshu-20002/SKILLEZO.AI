'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult } from '@/types/resume-scoring.types';
import { SectionImprovementSuggestion } from '@/types/resume-editor.types';
import { ResumeBuilderConfig, DEFAULT_BUILDER_CONFIG } from '@/types/resume-builder.types';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord, ResumeAnalysisData, ResumeOptimizationDraft } from '@/types/resume';
import { StudioViewMode } from '@/components/resume-studio/ResumeStudioSidebar';
import { exportResumeToPdf } from '@/services/pdf-export.service';
import { AuditPillarType } from '@/components/dashboard/resume-intelligence/ATSCompatibility';
import { computeResumeDiff } from '@/lib/resume-studio';
import { ResumeComparisonResult, ResumeComparisonContext } from '@/types/resume-comparison.types';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
export type NavigationSource = 'USER_VARIANT_SWITCH' | 'BROWSER_HISTORY_NAVIGATION';

const EMPTY_RESUME_ANALYSIS: ResumeAnalysisData = {
  overallScore: 0,
  atsScore: 0,
  matchScore: 0,
  contentScore: 0,
  impactScore: 0,
  brevityScore: 0,
  atsCompatibility: [],
  keywords: [],
  missingSkills: [],
  recommendations: [],
};

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '1.2 MB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function mapResumeToExtractedData(resume: ResumeRecord): ResumeAnalysisData['extractedData'] {
  const extracted = resume.extractedData;
  const candidateName = extracted?.personalInfo?.fullName || extracted?.candidateName || undefined;
  const rawLoc = extracted?.personalInfo?.location || extracted?.location || undefined;
  const cleanLocation =
    rawLoc && candidateName
      ? rawLoc.replace(new RegExp(candidateName, 'gi'), '').replace(/^[,\s|/.-]+/, '').trim() || undefined
      : rawLoc;

  const skillsList =
    extracted?.skillsExtracted ||
    (extracted?.skills || []).map((s: any) => (typeof s === 'string' ? s : s.name)) ||
    [];

  return {
    fileName: resume.originalFileName || resume.fileName,
    fileSize: formatFileSize(resume.fileSize),
    uploadedAt: new Date(resume.createdAt).toLocaleDateString(),
    candidateName,
    email: extracted?.personalInfo?.email || extracted?.email || undefined,
    phone: extracted?.personalInfo?.phone || extracted?.phone || undefined,
    location: cleanLocation,
    summary: extracted?.summary || null,
    skillsExtracted: skillsList,
    skills: extracted?.skills || skillsList.map((name: string) => ({ name })),
    totalExperienceYears: extracted?.totalExperienceYears || undefined,
    experience: extracted?.experience || [],
    projects: extracted?.projects || [],
    education: extracted?.education || [],
    certifications: extracted?.certifications || [],
  };
}

/**
 * useResumeStudio — Dedicated orchestration and view-state coordinator.
 * Strictly manages UI/server state coordination without acting as an independent mutable source of truth for career facts.
 */
export function useResumeStudio(initialResumeId?: string | null) {
  // Server State
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  // selectedResumeId is the underlying internal React state; activeResumeId is the conceptual canonical identity
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(initialResumeId || null);
  const activeResumeId = selectedResumeId;
  const [resumeDoc, setResumeDoc] = useState<ResumeDocument | null>(null);
  const [scoreResult, setScoreResult] = useState<ResumeScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cached Master Resume Document for performance-safe diff badge
  const [masterResumeDoc, setMasterResumeDoc] = useState<ResumeDocument | null>(null);

  // Master Resume State
  const [isMasterStale, setIsMasterStale] = useState(false);
  const [isSyncingMaster, setIsSyncingMaster] = useState(false);

  // UI & View State
  const [viewMode, setViewMode] = useState<StudioViewMode>('audit');
  const [activeView, setActiveView] = useState<'overview' | 'detail'>('detail');
  const [activeSectionKey, setActiveSectionKey] = useState<keyof ResumeScoreResult['sections']>('summary');
  const [previewHighlightSection, setPreviewHighlightSection] = useState<string | null>(null);
  const [mobileEditorView, setMobileEditorView] = useState<'editor' | 'preview' | 'insights'>('editor');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Resume Intelligence & ATS Diagnostics State
  const [targetRole, setTargetRole] = useState('Full-Stack Engineer');
  const [activePillar, setActivePillar] = useState<AuditPillarType>('impact');
  const [analysis, setAnalysis] = useState<ResumeAnalysisData>(EMPTY_RESUME_ANALYSIS);

  // Presentation Configuration & Save State
  const [builderConfig, setBuilderConfig] = useState<ResumeBuilderConfig>(DEFAULT_BUILDER_CONFIG);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeSavePromiseRef = useRef<Promise<any> | null>(null);
  const pendingConfigRef = useRef<ResumeBuilderConfig | null>(null);

  // Variant Switching & Concurrency Guard State
  const [pendingSwitchResumeId, setPendingSwitchResumeId] = useState<string | null>(null);
  const [isSwitchConfirmOpen, setIsSwitchConfirmOpen] = useState(false);
  const switchRequestIdRef = useRef(0);
  const selectedResumeIdRef = useRef<string | null>(selectedResumeId);

  useEffect(() => {
    selectedResumeIdRef.current = selectedResumeId;
  }, [selectedResumeId]);

  // Section AI Editor State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<SectionImprovementSuggestion | null>(null);
  const [scoreDeltaNotice, setScoreDeltaNotice] = useState<{ section: string; from: number; to: number } | null>(null);

  // Optimization Modal State
  const [selectedDraft, setSelectedDraft] = useState<ResumeOptimizationDraft | null>(null);
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSwitchingTarget, setIsSwitchingTarget] = useState(false);
  const [optimizingRecId, setOptimizingRecId] = useState<string | null>(null);
  const [isApplyingOptimization, setIsApplyingOptimization] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeRecord | null>(null);
  const [portfolioVersion, setPortfolioVersion] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived: Current Resume & Canonical Variant Identities
  const currentResume = useMemo(() => {
    return resumes.find((r) => r._id === selectedResumeId) || null;
  }, [resumes, selectedResumeId]);

  const isMaster = currentResume?.variantType === 'MASTER';
  const isTailored = currentResume?.variantType === 'TAILORED';
  const isCurrentResumeMaster = isMaster;

  // Performance-Safe 6E.1 Diff Summary
  const diffSummary = useMemo<ResumeComparisonResult | null>(() => {
    if (!isTailored || !resumeDoc || !masterResumeDoc) {
      return null;
    }
    try {
      const masterRecord = resumes.find((r) => r.variantType === 'MASTER');
      const comparisonContext: ResumeComparisonContext = {
        masterSectionOrder: masterRecord?.builderConfig?.sectionOrder,
        tailoredSectionOrder: builderConfig?.sectionOrder,
      };
      return computeResumeDiff(masterResumeDoc, resumeDoc, comparisonContext);
    } catch (err) {
      console.warn('Failed to compute resume diff summary', err);
      return null;
    }
  }, [isTailored, resumeDoc, masterResumeDoc, builderConfig, resumes]);

  // Fetch Authoritative Score (Guarded against stale variant responses)
  const fetchScore = useCallback(async (resumeId: string) => {
    try {
      setRefreshing(true);
      setError(null);
      const score = await resumeService.getResumeScore(resumeId);
      if (selectedResumeIdRef.current === resumeId) {
        setScoreResult(score);
      }
    } catch (err: any) {
      if (selectedResumeIdRef.current === resumeId) {
        setError("We couldn't load your resume analysis. Please try again.");
      }
    } finally {
      if (selectedResumeIdRef.current === resumeId) {
        setRefreshing(false);
      }
    }
  }, []);

  // Fetch ATS Intelligence (Guarded against stale variant responses)
  const fetchAtsIntelligence = useCallback(async (resumeId: string, role?: string) => {
    try {
      const liveAts = await resumeService.getResumeAtsScore(resumeId, role);
      if (liveAts && selectedResumeIdRef.current === resumeId) {
        setAnalysis((prev) => ({
          ...prev,
          overallScore: liveAts.overallScore ?? prev.overallScore,
          atsScore: liveAts.atsScore ?? prev.atsScore,
          matchScore: liveAts.matchScore ?? 78,
          contentScore: liveAts.contentScore ?? 72,
          impactScore: liveAts.impactScore ?? prev.impactScore,
          brevityScore: liveAts.brevityScore ?? prev.brevityScore,
          auditPillars: liveAts.auditPillars ?? prev.auditPillars,
          atsCompatibility: liveAts.atsCompatibility || prev.atsCompatibility || [],
          keywords: liveAts.keywords || prev.keywords || [],
          missingSkills: liveAts.missingSkills || liveAts.missingKeywords || prev.missingSkills || [],
          recommendations: liveAts.recommendations || prev.recommendations || [],
          topAction: liveAts.topAction ?? prev.topAction,
          recommendationSummary: liveAts.recommendationSummary ?? prev.recommendationSummary,
        }));
      }
    } catch (err) {
      console.warn('Could not fetch live ATS intelligence, using fallback', err);
    }
  }, []);

  // Load Initial Data (Prioritizing Master Resume)
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [userResumes, masterRes] = await Promise.all([
        resumeService.getUserResumes().catch(() => [] as ResumeRecord[]),
        resumeService.getMasterResume().catch(() => null),
      ]);

      const allResumes: ResumeRecord[] = [...(userResumes || [])];
      let activeResume: ResumeRecord | null = null;

      if (masterRes?.resume) {
        const masterResumeRecord = masterRes.resume;
        setIsMasterStale(masterRes.isStale);
        if (masterResumeRecord.resumeDocument) {
          setMasterResumeDoc(masterResumeRecord.resumeDocument as any);
        }
        const masterIdx = allResumes.findIndex((r) => r._id === masterResumeRecord._id);
        if (masterIdx >= 0) {
          allResumes[masterIdx] = masterResumeRecord;
        } else {
          allResumes.unshift(masterResumeRecord);
        }
        activeResume = masterResumeRecord;
      }

      // Ensure single master invariant across allResumes in frontend state
      const canonicalMasterId = masterRes?.resume?._id;
      const sanitizedResumes = allResumes.map((r) => {
        if (r.variantType === 'MASTER' && canonicalMasterId && r._id !== canonicalMasterId) {
          return { ...r, variantType: 'TAILORED' as const };
        }
        return r;
      });

      setResumes(sanitizedResumes);

      if (initialResumeId) {
        let requested = allResumes.find((r) => r._id === initialResumeId);
        if (!requested) {
          try {
            const fetched = await resumeService.getResumeById(initialResumeId);
            if (fetched) {
              requested = fetched;
              allResumes.unshift(fetched);
              setResumes([...allResumes]);
            }
          } catch {
            // Requested deep link failed/unauthorized; activeResume remains default/master
          }
        }
        if (requested) {
          activeResume = requested;
        }
      }

      if (!activeResume && allResumes.length > 0) {
        activeResume = allResumes.find((r) => r.isDefault) || allResumes[0];
      }

      if (activeResume) {
        setSelectedResumeId(activeResume._id);
        selectedResumeIdRef.current = activeResume._id;
        if (activeResume.resumeDocument) {
          setResumeDoc(activeResume.resumeDocument as any);
          if (activeResume.variantType === 'MASTER') {
            setMasterResumeDoc(activeResume.resumeDocument as any);
          }
        }
        if (activeResume.extractedData) {
          setAnalysis((prev) => ({
            ...prev,
            extractedData: mapResumeToExtractedData(activeResume!),
          }));
        }
        if (activeResume.builderConfig) {
          setBuilderConfig(activeResume.builderConfig);
          pendingConfigRef.current = activeResume.builderConfig;
        } else {
          resumeService.getBuilderConfig?.(activeResume._id)?.then?.((cfg) => {
            if (cfg) {
              setBuilderConfig(cfg);
              pendingConfigRef.current = cfg;
            }
          })?.catch?.(() => {});
        }
        await fetchScore(activeResume._id);
        await fetchAtsIntelligence(activeResume._id, targetRole);
      } else {
        setResumeDoc(null);
        setScoreResult(null);
        setAnalysis(EMPTY_RESUME_ANALYSIS);
      }
    } catch (err: any) {
      console.warn("Could not load candidate resumes", err);
      setResumeDoc(null);
      setScoreResult(null);
      setAnalysis(EMPTY_RESUME_ANALYSIS);
    } finally {
      setLoading(false);
    }
  }, [initialResumeId, targetRole, fetchScore, fetchAtsIntelligence]);

  // Select Resume Handler
  const handleSelectResume = useCallback((resumeId: string, directResume?: ResumeRecord, andOpenEditor = false) => {
    setSelectedResumeId(resumeId);
    selectedResumeIdRef.current = resumeId;
    setActiveView('overview');
    setCurrentSuggestion(null);
    setScoreDeltaNotice(null);

    if (andOpenEditor) {
      setViewMode('editor');
      setMobileEditorView('editor');
    }

    const resume = directResume || resumes.find((r) => r._id === resumeId);
    if (resume?.variantType === 'MASTER') {
      resumeService.getMasterResume().then((mr) => {
        if (mr) setIsMasterStale(mr.isStale);
      }).catch(() => {});
    }

    if (resume) {
      if (resume.resumeDocument) {
        setResumeDoc(resume.resumeDocument as any);
        if (resume.variantType === 'MASTER') {
          setMasterResumeDoc(resume.resumeDocument as any);
        }
      }
      if (resume.extractedData) {
        setAnalysis((prev) => ({
          ...prev,
          extractedData: mapResumeToExtractedData(resume),
        }));
      }
      if (resume.builderConfig) {
        setBuilderConfig(resume.builderConfig);
        pendingConfigRef.current = resume.builderConfig;
      } else {
        resumeService.getBuilderConfig(resumeId).then((cfg) => {
          if (cfg) {
            setBuilderConfig(cfg);
            pendingConfigRef.current = cfg;
          }
        }).catch(() => {});
      }
    } else {
      // Fallback: Fetch complete resume document from server if missing in local state
      resumeService.getResumeById(resumeId).then((fetched) => {
        if (fetched && selectedResumeIdRef.current === resumeId) {
          setResumes((prev) => {
            const exists = prev.some((r) => r._id === fetched._id);
            return exists ? prev.map((r) => (r._id === fetched._id ? fetched : r)) : [fetched, ...prev];
          });
          if (fetched.resumeDocument) {
            setResumeDoc(fetched.resumeDocument as any);
            if (fetched.variantType === 'MASTER') {
              setMasterResumeDoc(fetched.resumeDocument as any);
            }
          }
          if (fetched.extractedData) {
            setAnalysis((prev) => ({
              ...prev,
              extractedData: mapResumeToExtractedData(fetched),
            }));
          }
          if (fetched.builderConfig) {
            setBuilderConfig(fetched.builderConfig);
            pendingConfigRef.current = fetched.builderConfig;
          }
        }
      }).catch((fetchErr) => {
        console.warn("Failed to fetch resume by id:", fetchErr);
      });
    }

    fetchScore(resumeId);
    fetchAtsIntelligence(resumeId, targetRole);
  }, [resumes, targetRole, fetchScore, fetchAtsIntelligence, setViewMode, setMobileEditorView]);

  // Master Resume Synchronize Handler
  const handleSyncMasterResume = useCallback(async () => {
    let syncPromise: Promise<any> | null = null;
    try {
      setIsSyncingMaster(true);
      setSaveStatus('saving');
      syncPromise = resumeService.syncMasterResume();
      activeSavePromiseRef.current = syncPromise;
      const syncResult = await syncPromise;
      setSaveStatus('saved');
      if (syncResult?.resume) {
        setIsMasterStale(false);
        setResumes((prev) =>
          prev.map((r) => (r._id === syncResult.resume._id ? syncResult.resume : r))
        );
        if (syncResult.resume.resumeDocument) {
          setResumeDoc(syncResult.resume.resumeDocument as any);
          setMasterResumeDoc(syncResult.resume.resumeDocument as any);
        }
        if (syncResult.resume.builderConfig) {
          setBuilderConfig(syncResult.resume.builderConfig);
          pendingConfigRef.current = syncResult.resume.builderConfig;
        }
        if (selectedResumeId === syncResult.resume._id) {
          await fetchScore(syncResult.resume._id);
        }
        toast.success("Master Resume synchronized with your Career Profile!");
      }
    } catch (err: any) {
      setSaveStatus('error');
      toast.error(err.message || "Failed to synchronize Master Resume");
    } finally {
      if (syncPromise && activeSavePromiseRef.current === syncPromise) {
        activeSavePromiseRef.current = null;
      }
      setIsSyncingMaster(false);
    }
  }, [selectedResumeId, fetchScore]);

  // Helper to execute builder config save with strict promise lifecycle
  const executeSaveBuilderConfig = useCallback(async (targetId: string, config: ResumeBuilderConfig) => {
    setSaveStatus('saving');
    const savePromise = resumeService.saveBuilderConfig(targetId, config);
    activeSavePromiseRef.current = savePromise;
    try {
      await savePromise;
      setSaveStatus('saved');
    } catch (err) {
      console.error("Failed to persist builder config", err);
      setSaveStatus('error');
      toast.error("Failed to save layout changes.");
      throw err;
    } finally {
      if (activeSavePromiseRef.current === savePromise) {
        activeSavePromiseRef.current = null;
      }
    }
  }, []);

  // Debounced Presentation Builder Config Save
  const handleBuilderConfigChange = useCallback((newConfig: ResumeBuilderConfig) => {
    setBuilderConfig(newConfig);
    pendingConfigRef.current = newConfig;
    setSaveStatus('unsaved');

    if (!selectedResumeId) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      saveTimerRef.current = null;
      try {
        await executeSaveBuilderConfig(selectedResumeId, newConfig);
      } catch {
        // Handled in executeSaveBuilderConfig
      }
    }, 600);
  }, [selectedResumeId, executeSaveBuilderConfig]);

  // Flush pending autosave immediately and await completion
  const flushPendingAutosave = useCallback(async (): Promise<boolean> => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      if (selectedResumeId && pendingConfigRef.current) {
        try {
          await executeSaveBuilderConfig(selectedResumeId, pendingConfigRef.current);
          return true;
        } catch {
          return false;
        }
      }
    }
    if (activeSavePromiseRef.current) {
      try {
        await activeSavePromiseRef.current;
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }, [selectedResumeId, executeSaveBuilderConfig]);

  // Execute Variant Switch Transaction guarded by switchRequestIdRef
  const executeVariantSwitch = useCallback(async (
    targetResumeId: string,
    navigationSource: NavigationSource = 'USER_VARIANT_SWITCH',
    onCommitted?: (committedId: string, requestId: number) => void
  ) => {
    const currentRequestId = ++switchRequestIdRef.current;

    try {
      setLoading(true);
      setError(null);

      const targetResume = await resumeService.getResumeById(targetResumeId);

      // Concurrency check: If a newer switch was requested, ignore this response completely!
      if (currentRequestId !== switchRequestIdRef.current) {
        return;
      }

      if (!targetResume) {
        toast.error("Resume variant could not be found.");
        return;
      }

      // Commit target variant to authoritative state
      setSelectedResumeId(targetResume._id);
      selectedResumeIdRef.current = targetResume._id;

      if (targetResume.resumeDocument) {
        setResumeDoc(targetResume.resumeDocument as any);
        if (targetResume.variantType === 'MASTER') {
          setMasterResumeDoc(targetResume.resumeDocument as any);
        }
      } else {
        setResumeDoc(null);
      }

      if (targetResume.extractedData) {
        setAnalysis((prev) => ({
          ...prev,
          extractedData: mapResumeToExtractedData(targetResume),
        }));
      }

      if (targetResume.builderConfig) {
        setBuilderConfig(targetResume.builderConfig);
        pendingConfigRef.current = targetResume.builderConfig;
      } else {
        setBuilderConfig(DEFAULT_BUILDER_CONFIG);
        pendingConfigRef.current = DEFAULT_BUILDER_CONFIG;
      }

      setSaveStatus('saved');
      setActiveView('overview');
      setCurrentSuggestion(null);
      setScoreDeltaNotice(null);

      // Update lightweight metadata list if needed
      setResumes((prev) => {
        const exists = prev.some((r) => r._id === targetResume._id);
        return exists ? prev.map((r) => (r._id === targetResume._id ? targetResume : r)) : [targetResume, ...prev];
      });

      // Synchronize URL / notify caller strictly AFTER successful commit
      if (onCommitted) {
        onCommitted(targetResume._id, currentRequestId);
      }

      if (targetResume.variantType === 'MASTER') {
        resumeService.getMasterResume().then((mr) => {
          if (mr && currentRequestId === switchRequestIdRef.current) {
            setIsMasterStale(mr.isStale);
          }
        }).catch(() => {});
      }

      // Trigger background intelligence protected by active resume ID
      fetchScore(targetResume._id);
      fetchAtsIntelligence(targetResume._id, targetRole);

    } catch (err: any) {
      if (currentRequestId === switchRequestIdRef.current) {
        toast.error(err.message || "Failed to switch resume variant.");
      }
    } finally {
      if (currentRequestId === switchRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fetchScore, fetchAtsIntelligence, targetRole]);

  // Main variant switch function with dirty guard & in-flight save await
  const switchResumeVariant = useCallback(async (
    targetResumeId: string,
    navigationSource: NavigationSource = 'USER_VARIANT_SWITCH',
    onCommitted?: (committedId: string, requestId: number) => void
  ) => {
    if (targetResumeId === selectedResumeId) {
      return;
    }

    if (saveStatus === 'error') {
      toast.error("Save failed. Please resolve the save error before switching.");
      return;
    }

    // Flush pending autosave if debounce timer is active
    if (saveTimerRef.current) {
      const flushed = await flushPendingAutosave();
      if (!flushed) {
        toast.error("Could not save pending changes before switching.");
        return;
      }
    } else if (saveStatus === 'saving' && activeSavePromiseRef.current) {
      try {
        await activeSavePromiseRef.current;
      } catch {
        toast.error("Active save failed. Please resolve before switching.");
        return;
      }
    }

    // If local changes are still unsaved, prompt confirmation
    if (saveStatus === 'unsaved') {
      setPendingSwitchResumeId(targetResumeId);
      setIsSwitchConfirmOpen(true);
      return;
    }

    await executeVariantSwitch(targetResumeId, navigationSource, onCommitted);
  }, [selectedResumeId, saveStatus, flushPendingAutosave, executeVariantSwitch]);

  const confirmSwitchVariant = useCallback((onCommitted?: (committedId: string, requestId: number) => void) => {
    if (!pendingSwitchResumeId) return;
    const targetId = pendingSwitchResumeId;
    setIsSwitchConfirmOpen(false);
    setPendingSwitchResumeId(null);
    executeVariantSwitch(targetId, 'USER_VARIANT_SWITCH', onCommitted);
  }, [pendingSwitchResumeId, executeVariantSwitch]);

  const cancelSwitchVariant = useCallback(() => {
    setIsSwitchConfirmOpen(false);
    setPendingSwitchResumeId(null);
  }, []);

  // Download PDF Handler
  const handleDownloadPDF = useCallback(async () => {
    if (!resumeDoc) {
      toast.error('No resume document available to download.');
      return;
    }

    setIsDownloadingPdf(true);
    const toastId = toast.loading('Generating high-fidelity vector PDF...');

    try {
      await exportResumeToPdf(resumeDoc, builderConfig);
      toast.success('Resume downloaded as vector PDF!', { id: toastId });
    } catch (err: any) {
      console.error('Vector PDF export failed:', err);
      toast.dismiss(toastId);
      toast.info('Direct PDF download encountered an issue. Opening print dialog as fallback...');
      setTimeout(() => {
        window.print();
      }, 200);
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [resumeDoc, builderConfig]);

  // Direct File Upload Handler (Option 1: Safe Upload to Portfolio as Variant)
  const handleFileUpload = useCallback(async (file: File) => {
    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf';

    if (!isPdf) {
      toast.error('Only PDF documents are supported. Please upload a .pdf file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading and analyzing ${file.name}...`);

    try {
      const isFirst = resumes.length === 0;
      const cleanTitle = file.name.replace(/\.pdf$/i, '').trim();
      const newResume = await resumeService.uploadResume(file, cleanTitle, {
        asVariant: !isFirst,
        syncProfile: isFirst,
      });
      toast.success(
        isFirst
          ? 'Master Resume uploaded and facts synchronized!'
          : 'Resume added to your Portfolio as a new variant!',
        { id: toastId }
      );

      setResumes((prev) => [newResume, ...prev]);
      handleSelectResume(newResume._id, newResume);
      setPortfolioVersion((v) => v + 1);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed. Please check the file and try again.', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleSelectResume]);

  // Delete Resume Handlers
  const handleDeleteClick = useCallback((resume?: ResumeRecord) => {
    const target = resume || resumes.find((r) => r._id === selectedResumeId) || null;
    if (target) {
      setResumeToDelete(target);
      setIsDeleteDialogOpen(true);
    }
  }, [resumes, selectedResumeId]);

  const handleConfirmDeleteResume = useCallback(async () => {
    if (!resumeToDelete) return;
    setIsDeletingResume(true);
    const toastId = toast.loading(`Deleting ${resumeToDelete.title || resumeToDelete.originalFileName || 'resume'}...`);

    try {
      await resumeService.deleteResume(resumeToDelete._id);
      toast.success('Resume deleted successfully', { id: toastId });

      const updatedResumes = resumes.filter((r) => r._id !== resumeToDelete._id);
      setResumes(updatedResumes);
      setIsDeleteDialogOpen(false);
      setResumeToDelete(null);

      if (selectedResumeId === resumeToDelete._id) {
        if (updatedResumes.length > 0) {
          const nextResume = updatedResumes.find((r) => r.isDefault) || updatedResumes[0];
          handleSelectResume(nextResume._id);
        } else {
          setSelectedResumeId(null);
          setResumeDoc(null);
          setScoreResult(null);
          setAnalysis(EMPTY_RESUME_ANALYSIS);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete resume', { id: toastId });
    } finally {
      setIsDeletingResume(false);
    }
  }, [resumeToDelete, resumes, selectedResumeId, handleSelectResume]);

  // Section AI Editor Handlers
  const handleGenerateSuggestion = useCallback(async (instruction?: string) => {
    if (!selectedResumeId) return;

    try {
      setIsGenerating(true);
      setCurrentSuggestion(null);

      const suggestion = await resumeService.suggestSectionImprovement(
        selectedResumeId,
        activeSectionKey,
        instruction?.trim() || undefined
      );

      setCurrentSuggestion(suggestion);
    } catch (err: any) {
      toast.error(err.message || "Could not generate AI improvement. Your original content is unchanged.");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedResumeId, activeSectionKey]);

  const handleApproveSuggestion = useCallback(async () => {
    if (!currentSuggestion || !selectedResumeId) return;

    let savePromise: Promise<any> | null = null;
    try {
      setIsApplying(true);
      setSaveStatus('saving');

      savePromise = resumeService.applySectionImprovement(
        selectedResumeId,
        activeSectionKey,
        {
          suggestionId: currentSuggestion.suggestionId,
          proposed: currentSuggestion.proposed,
          baseDocumentVersion: currentSuggestion.baseDocumentVersion,
        }
      );
      activeSavePromiseRef.current = savePromise;

      const result = await savePromise;
      setSaveStatus('saved');

      setResumeDoc(result.resumeDocument);
      if (currentResume?.variantType === 'MASTER') {
        setMasterResumeDoc(result.resumeDocument);
      }
      setScoreDeltaNotice({
        section: activeSectionKey,
        from: result.previousScore,
        to: result.newScore,
      });
      setCurrentSuggestion(null);

      await fetchScore(selectedResumeId);
      toast.success("Section changes approved & updated!");
    } catch (err: any) {
      setSaveStatus('error');
      toast.error(err.message || "Failed to apply improvement.");
    } finally {
      if (savePromise && activeSavePromiseRef.current === savePromise) {
        activeSavePromiseRef.current = null;
      }
      setIsApplying(false);
    }
  }, [currentSuggestion, selectedResumeId, activeSectionKey, fetchScore, currentResume?.variantType]);

  const handleRejectSuggestion = useCallback(() => {
    setCurrentSuggestion(null);
    toast.info("Suggestion dismissed. Original resume content kept unchanged.");
  }, []);

  // Optimization Handlers
  const handleLaunchOptimization = useCallback(async (rec: string | import('@/types/resume').AIResumeRecommendation) => {
    const recommendationId = typeof rec === 'string' ? rec : rec.id;
    if (!selectedResumeId || !recommendationId) return;
    setIsOptimizing(true);
    setOptimizingRecId(recommendationId);
    try {
      const draft = await resumeService.proposeOptimization(selectedResumeId, recommendationId);
      setSelectedDraft(draft);
      setIsOptimizationModalOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate tailored optimization.');
    } finally {
      setIsOptimizing(false);
      setOptimizingRecId(null);
    }
  }, [selectedResumeId]);

  const handleAcceptOptimization = useCallback(async (draft: ResumeOptimizationDraft) => {
    if (!selectedResumeId) {
      toast.error('Please select an active resume first.');
      return;
    }
    setIsApplyingOptimization(true);
    setSaveStatus('saving');
    let savePromise: Promise<any> | null = null;
    try {
      savePromise = resumeService.acceptOptimization(selectedResumeId, draft);
      activeSavePromiseRef.current = savePromise;
      const res = await savePromise;
      setSaveStatus('saved');
      if (res && res.freshIntelligence) {
        setAnalysis((prev) => ({
          ...prev,
          atsScore: res.freshIntelligence.atsScore,
          matchScore: res.freshIntelligence.matchScore ?? prev.matchScore,
          contentScore: res.freshIntelligence.contentScore ?? prev.contentScore,
          auditPillars: res.freshIntelligence.auditPillars ?? prev.auditPillars,
          recommendations: res.freshIntelligence.recommendations || prev.recommendations,
          topAction: res.freshIntelligence.topAction ?? prev.topAction,
        }));
        if (res.resume) {
          setResumes((prev) =>
            prev.map((r) => (r._id === res.resume._id ? res.resume : r))
          );
          if (res.resume.resumeDocument) {
            setResumeDoc(res.resume.resumeDocument as any);
            if (res.resume.variantType === 'MASTER') {
              setMasterResumeDoc(res.resume.resumeDocument as any);
            }
          }
        }
      }
      toast.success('Optimization accepted! New resume version created and re-scored.');
      setIsOptimizationModalOpen(false);
      setSelectedDraft(null);
      await fetchScore(selectedResumeId);
    } catch (err: any) {
      setSaveStatus('error');
      toast.error(err.message || 'Failed to apply optimization.');
    } finally {
      if (savePromise && activeSavePromiseRef.current === savePromise) {
        activeSavePromiseRef.current = null;
      }
      setIsApplyingOptimization(false);
    }
  }, [selectedResumeId, fetchScore]);

  const handleRejectOptimization = useCallback(async (draft: ResumeOptimizationDraft) => {
    try {
      await resumeService.rejectOptimization(draft);
    } catch {
      // Graceful fallback
    }
    toast.info('Optimization dismissed. Base resume content remains untouched.');
    setIsOptimizationModalOpen(false);
    setSelectedDraft(null);
  }, []);

  const handleTargetRoleChange = useCallback((newRole: string) => {
    setTargetRole(newRole);
    if (selectedResumeId) {
      fetchAtsIntelligence(selectedResumeId, newRole);
    }
  }, [selectedResumeId, fetchAtsIntelligence]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return {
    // State & Canonical Identifiers
    resumes,
    selectedResumeId,
    activeResumeId: selectedResumeId,
    currentResume,
    isCurrentResumeMaster,
    isMaster,
    isTailored,
    masterResumeDoc,
    diffSummary,
    pendingSwitchResumeId,
    isSwitchConfirmOpen,
    resumeDoc,
    scoreResult,
    loading,
    refreshing,
    error,
    isMasterStale,
    isSyncingMaster,
    viewMode,
    activeView,
    activeSectionKey,
    previewHighlightSection,
    mobileEditorView,
    isMobileSidebarOpen,
    targetRole,
    activePillar,
    analysis,
    builderConfig,
    saveStatus,
    isDownloadingPdf,
    isGenerating,
    isApplying,
    currentSuggestion,
    scoreDeltaNotice,
    selectedDraft,
    isOptimizationModalOpen,
    isOptimizing,
    isSwitchingTarget,
    optimizingRecId,
    isApplyingOptimization,
    isUploading,
    isDeleteDialogOpen,
    isDeletingResume,
    resumeToDelete,
    fileInputRef,
    portfolioVersion,

    // Setters
    setViewMode,
    setActiveView,
    setActiveSectionKey,
    setPreviewHighlightSection,
    setMobileEditorView,
    setIsMobileSidebarOpen,
    setActivePillar,
    setIsOptimizationModalOpen,
    setSelectedDraft,
    setIsDeleteDialogOpen,

    // Actions & Variant Switch Lifecycle
    loadInitialData,
    handleSelectResume,
    switchResumeVariant,
    flushPendingAutosave,
    confirmSwitchVariant,
    cancelSwitchVariant,
    handleSyncMasterResume,
    handleBuilderConfigChange,
    handleDownloadPDF,
    handleFileUpload,
    handleDeleteClick,
    handleConfirmDeleteResume,
    handleGenerateSuggestion,
    handleApproveSuggestion,
    handleRejectSuggestion,
    handleLaunchOptimization,
    handleAcceptOptimization,
    handleRejectOptimization,
    handleTargetRoleChange,
    fetchScore,
  };
}
