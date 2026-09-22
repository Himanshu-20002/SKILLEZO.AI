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

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

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
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(initialResumeId || null);
  const [resumeDoc, setResumeDoc] = useState<ResumeDocument | null>(null);
  const [scoreResult, setScoreResult] = useState<ResumeScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Master Resume State
  const [isMasterStale, setIsMasterStale] = useState(false);
  const [isSyncingMaster, setIsSyncingMaster] = useState(false);

  // UI & View State
  const [viewMode, setViewMode] = useState<StudioViewMode>('audit');
  const [activeView, setActiveView] = useState<'overview' | 'detail'>('overview');
  const [activeSectionKey, setActiveSectionKey] = useState<keyof ResumeScoreResult['sections']>('experience');
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

  // File Upload & Deletion State
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived: Current Resume & Master identity
  const currentResume = useMemo(() => {
    return resumes.find((r) => r._id === selectedResumeId) || null;
  }, [resumes, selectedResumeId]);

  const isCurrentResumeMaster = currentResume?.variantType === 'MASTER';

  // Fetch Authoritative Score
  const fetchScore = useCallback(async (resumeId: string) => {
    try {
      setRefreshing(true);
      setError(null);
      const score = await resumeService.getResumeScore(resumeId);
      setScoreResult(score);
    } catch (err: any) {
      setError("We couldn't load your resume analysis. Please try again.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Fetch ATS Intelligence
  const fetchAtsIntelligence = useCallback(async (resumeId: string, role?: string) => {
    try {
      const liveAts = await resumeService.getResumeAtsScore(resumeId, role);
      if (liveAts) {
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
        setIsMasterStale(masterRes.isStale);
        const masterIdx = allResumes.findIndex((r) => r._id === masterRes.resume._id);
        if (masterIdx >= 0) {
          allResumes[masterIdx] = masterRes.resume;
        } else {
          allResumes.unshift(masterRes.resume);
        }
        activeResume = masterRes.resume;
      }

      setResumes(allResumes);

      if (initialResumeId) {
        const requested = allResumes.find((r) => r._id === initialResumeId);
        if (requested) {
          activeResume = requested;
        }
      }

      if (!activeResume && allResumes.length > 0) {
        activeResume = allResumes.find((r) => r.isDefault) || allResumes[0];
      }

      if (activeResume) {
        setSelectedResumeId(activeResume._id);
        if (activeResume.resumeDocument) {
          setResumeDoc(activeResume.resumeDocument as any);
        }
        if (activeResume.extractedData) {
          setAnalysis((prev) => ({
            ...prev,
            extractedData: mapResumeToExtractedData(activeResume!),
          }));
        }
        if (activeResume.builderConfig) {
          setBuilderConfig(activeResume.builderConfig);
        } else {
          resumeService.getBuilderConfig(activeResume._id).then((cfg) => {
            if (cfg) setBuilderConfig(cfg);
          }).catch(() => {});
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
  }, [targetRole, fetchScore, fetchAtsIntelligence]);

  // Select Resume Handler
  const handleSelectResume = useCallback((resumeId: string) => {
    setSelectedResumeId(resumeId);
    setActiveView('overview');
    setCurrentSuggestion(null);
    setScoreDeltaNotice(null);

    const resume = resumes.find((r) => r._id === resumeId);
    if (resume?.variantType === 'MASTER') {
      resumeService.getMasterResume().then((mr) => {
        if (mr) setIsMasterStale(mr.isStale);
      }).catch(() => {});
    }
    if (resume?.resumeDocument) {
      setResumeDoc(resume.resumeDocument as any);
    }
    if (resume?.extractedData) {
      setAnalysis((prev) => ({
        ...prev,
        extractedData: mapResumeToExtractedData(resume),
      }));
    }
    if (resume?.builderConfig) {
      setBuilderConfig(resume.builderConfig);
    } else {
      resumeService.getBuilderConfig(resumeId).then((cfg) => {
        if (cfg) setBuilderConfig(cfg);
      }).catch(() => {});
    }
    fetchScore(resumeId);
    fetchAtsIntelligence(resumeId, targetRole);
  }, [resumes, targetRole, fetchScore, fetchAtsIntelligence]);

  // Master Resume Synchronize Handler
  const handleSyncMasterResume = useCallback(async () => {
    try {
      setIsSyncingMaster(true);
      const syncResult = await resumeService.syncMasterResume();
      if (syncResult?.resume) {
        setIsMasterStale(false);
        setResumes((prev) =>
          prev.map((r) => (r._id === syncResult.resume._id ? syncResult.resume : r))
        );
        if (syncResult.resume.resumeDocument) {
          setResumeDoc(syncResult.resume.resumeDocument as any);
        }
        if (syncResult.resume.builderConfig) {
          setBuilderConfig(syncResult.resume.builderConfig);
        }
        if (selectedResumeId === syncResult.resume._id) {
          await fetchScore(syncResult.resume._id);
        }
        toast.success("Master Resume synchronized with your Career Profile!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to synchronize Master Resume");
    } finally {
      setIsSyncingMaster(false);
    }
  }, [selectedResumeId, fetchScore]);

  // Debounced Presentation Builder Config Save
  const handleBuilderConfigChange = useCallback((newConfig: ResumeBuilderConfig) => {
    setBuilderConfig(newConfig);
    setSaveStatus('unsaved');

    if (!selectedResumeId) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        await resumeService.saveBuilderConfig(selectedResumeId, newConfig);
        setSaveStatus('saved');
      } catch (err) {
        console.error("Failed to persist builder config", err);
        setSaveStatus('error');
        toast.error("Failed to save layout changes.");
      }
    }, 600);
  }, [selectedResumeId]);

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

  // Direct File Upload Handler
  const handleFileUpload = useCallback(async (file: File) => {
    const isAllowed =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.name.toLowerCase().endsWith('.docx') ||
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isAllowed) {
      toast.error('Please upload a .PDF or .DOCX document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading and analyzing ${file.name}...`);

    try {
      const newResume = await resumeService.uploadResume(file);
      toast.success('Resume analyzed and added!', { id: toastId });

      setResumes((prev) => [newResume, ...prev]);
      handleSelectResume(newResume._id);
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

    try {
      setIsApplying(true);

      const result = await resumeService.applySectionImprovement(
        selectedResumeId,
        activeSectionKey,
        {
          suggestionId: currentSuggestion.suggestionId,
          proposed: currentSuggestion.proposed,
          baseDocumentVersion: currentSuggestion.baseDocumentVersion,
        }
      );

      setResumeDoc(result.resumeDocument);
      setScoreDeltaNotice({
        section: activeSectionKey,
        from: result.previousScore,
        to: result.newScore,
      });
      setCurrentSuggestion(null);

      await fetchScore(selectedResumeId);
      toast.success("Section changes approved & updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to apply improvement.");
    } finally {
      setIsApplying(false);
    }
  }, [currentSuggestion, selectedResumeId, activeSectionKey, fetchScore]);

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
    try {
      const res = await resumeService.acceptOptimization(selectedResumeId, draft);
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
          }
        }
      }
      toast.success('Optimization accepted! New resume version created and re-scored.');
      setIsOptimizationModalOpen(false);
      setSelectedDraft(null);
      await fetchScore(selectedResumeId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to apply optimization.');
    } finally {
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
    // State
    resumes,
    selectedResumeId,
    currentResume,
    isCurrentResumeMaster,
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

    // Actions
    loadInitialData,
    handleSelectResume,
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
