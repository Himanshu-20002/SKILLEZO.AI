'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Award, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Code2, 
  UserCheck, 
  ArrowLeft, 
  RefreshCw, 
  Target, 
  ChevronDown, 
  UploadCloud, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Wand2, 
  XCircle, 
  Clock, 
  Eye, 
  Columns2, 
  Sliders, 
  Palette, 
  Download,
  Menu,
  Lock,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SAMPLE_RESUME_DOCUMENT_FIXTURE } from '@/types/resume-document.fixture';
import { ResumeDocument } from '@/types/resume-document';
import { ResumeScoreResult, SectionScore, ScoreRatingTier } from '@/types/resume-scoring.types';
import { SectionImprovementSuggestion } from '@/types/resume-editor.types';
import { ResumeBuilderConfig, DEFAULT_BUILDER_CONFIG } from '@/types/resume-builder.types';
import { resumeService } from '@/services/resume.service';
import { ResumeRecord, ResumeAnalysisData, ResumeOptimizationDraft, AIResumeRecommendation } from '@/types/resume';
import { 
  ResumeRenderer, 
  ResumeStudioSidebar, 
  StudioViewMode, 
  SectionAiWorkspace, 
  LiveResumeCanvas 
} from '@/components/resume-studio';
import { exportResumeToPdf } from '@/services/pdf-export.service';
import { AuditPillarType } from '@/components/dashboard/resume-intelligence/ATSCompatibility';
import { mockCareerIntelligence } from '@/mock/career-intelligence';

const TARGET_ROLES = [
  'Full-Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI/ML Specialist',
  'DevOps & Cloud Engineer',
  'Mobile App Developer',
];

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

// Code-split heavy builder controls for instant page loads & fast TTI
const ResumeBuilderControls = dynamic(
  () => import('@/components/resume-studio/builder').then((mod) => mod.ResumeBuilderControls),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse h-96 space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
      </div>
    ),
  }
);

// Code-split ATS diagnostics view for rapid initial paint
const AtsDiagnosticsView = dynamic(
  () => import('@/components/resume-studio').then((mod) => mod.AtsDiagnosticsView),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
        <div className="h-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6" />
        <div className="h-44 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6" />
      </div>
    ),
  }
);

// Code-split optimization review modal (only loaded when user triggers optimization)
const OptimizationReviewModal = dynamic(
  () =>
    import('@/components/dashboard/resume-intelligence/OptimizationReviewModal').then(
      (mod) => mod.OptimizationReviewModal
    ),
  { ssr: false }
);

interface SectionConfigItem {
  id: keyof ResumeScoreResult['sections'];
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTION_CONFIGS: SectionConfigItem[] = [
  { id: 'contact', title: 'Contact Information', icon: UserCheck },
  { id: 'summary', title: 'Professional Summary', icon: FileText },
  { id: 'skills', title: 'Technical Skills', icon: Code2 },
  { id: 'experience', title: 'Work Experience', icon: Briefcase },
  { id: 'projects', title: 'Projects', icon: FolderGit2 },
  { id: 'education', title: 'Education', icon: GraduationCap },
  { id: 'achievements', title: 'Achievements & Certifications', icon: Award },
];

export default function ResumeStudioPage() {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [resumeDoc, setResumeDoc] = useState<ResumeDocument | null>(null);
  const [scoreResult, setScoreResult] = useState<ResumeScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Navigation: overview vs section-detail
  const [activeView, setActiveView] = useState<'overview' | 'detail'>('overview');
  const [activeSectionKey, setActiveSectionKey] = useState<keyof ResumeScoreResult['sections']>('experience');
  const [showScoringDetails, setShowScoringDetails] = useState(false);

  // Resume Intelligence & ATS Diagnostics State
  const [targetRole, setTargetRole] = useState('Full-Stack Engineer');
  const [activePillar, setActivePillar] = useState<AuditPillarType>('impact');
  const [analysis, setAnalysis] = useState<ResumeAnalysisData>({
    ...mockCareerIntelligence.resumeAnalysis,
    matchScore: 78,
    contentScore: 72,
  });

  // Phase 7 Optimization Workflow State
  const [selectedDraft, setSelectedDraft] = useState<ResumeOptimizationDraft | null>(null);
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSwitchingTarget, setIsSwitchingTarget] = useState(false);
  const [optimizingRecId, setOptimizingRecId] = useState<string | null>(null);
  const [isApplyingOptimization, setIsApplyingOptimization] = useState(false);

  // The 2 Human-Centered Destinations: 'audit' (ATS Audit & Score) or 'editor' (Edit & Design)
  const [viewMode, setViewMode] = useState<StudioViewMode>('audit');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileEditorView, setMobileEditorView] = useState<'editor' | 'preview'>('editor');
  const [previewHighlightSection, setPreviewHighlightSection] = useState<string | null>(null);
  const [builderConfig, setBuilderConfig] = useState<ResumeBuilderConfig>(DEFAULT_BUILDER_CONFIG);
  const [isSavingBuilder, setIsSavingBuilder] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isAudit = viewMode === 'audit' || viewMode === 'analysis';

  // Phase 5: Section AI Editor State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<SectionImprovementSuggestion | null>(null);
  const [scoreDeltaNotice, setScoreDeltaNotice] = useState<{ section: string; from: number; to: number } | null>(null);

  // Delete Resume State & Modal
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingResume, setIsDeletingResume] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeRecord | null>(null);

  // Direct Upload State inside Resume Studio
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync viewMode from URL query parameters (e.g. ?view=audit, ?view=editor, or ?view=builder)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || params.get('tab');
      if (viewParam) {
        if (viewParam === 'audit' || viewParam === 'analysis') {
          setViewMode('audit');
        } else if (viewParam === 'builder' || viewParam === 'design') {
          setViewMode('builder');
        } else if (['editor', 'split', 'visual', 'content'].includes(viewParam)) {
          setViewMode('editor');
        }
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
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
    try {
      const uploaded = await resumeService.uploadResume(file);
      setResumes((prev) => [uploaded, ...prev.filter((r) => r._id !== uploaded._id)]);
      setSelectedResumeId(uploaded._id);
      if (uploaded.resumeDocument) {
        setResumeDoc(uploaded.resumeDocument as any);
      }
      if (uploaded.extractedData) {
        setAnalysis((prev) => ({
          ...prev,
          extractedData: mapResumeToExtractedData(uploaded),
        }));
      }
      if (uploaded.builderConfig) {
        setBuilderConfig(uploaded.builderConfig);
      }
      await fetchScore(uploaded._id);
      await fetchAtsIntelligence(uploaded._id, targetRole);
      toast.success('Resume uploaded & analyzed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload and analyze resume.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Load candidate resumes on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const fetchAtsIntelligence = useCallback(async (resumeId?: string, role = targetRole) => {
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
  }, [targetRole]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userResumes = await resumeService.getUserResumes();
      setResumes(userResumes || []);

      if (userResumes && userResumes.length > 0) {
        const defaultResume = userResumes.find((r) => r.isDefault) || userResumes[0];
        setSelectedResumeId(defaultResume._id);
        if (defaultResume.resumeDocument) {
          setResumeDoc(defaultResume.resumeDocument as any);
        }
        if (defaultResume.extractedData) {
          setAnalysis((prev) => ({
            ...prev,
            extractedData: mapResumeToExtractedData(defaultResume),
          }));
        }
        if (defaultResume.builderConfig) {
          setBuilderConfig(defaultResume.builderConfig);
        } else {
          resumeService.getBuilderConfig(defaultResume._id).then((cfg) => {
            if (cfg) setBuilderConfig(cfg);
          }).catch(() => {});
        }
        await fetchScore(defaultResume._id);
        await fetchAtsIntelligence(defaultResume._id, targetRole);
      } else {
        setResumeDoc(null);
        setScoreResult(null);
      }
    } catch (err: any) {
      console.warn("Could not load candidate resumes", err);
      setResumeDoc(null);
      setScoreResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchScore = async (resumeId: string) => {
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
  };

  const handleSelectResume = useCallback((resumeId: string) => {
    setSelectedResumeId(resumeId);
    setActiveView('overview');
    setCurrentSuggestion(null);
    setScoreDeltaNotice(null);
    
    const resume = resumes.find((r) => r._id === resumeId);
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
  }, [resumes, targetRole, fetchAtsIntelligence]);

  const handleDeleteClick = useCallback((resume?: ResumeRecord) => {
    const target = resume || resumes.find((r) => r._id === selectedResumeId) || null;
    if (target) {
      setResumeToDelete(target);
      setIsDeleteDialogOpen(true);
    }
  }, [resumes, selectedResumeId]);

  const handleConfirmDeleteResume = async () => {
    if (!resumeToDelete) return;
    setIsDeletingResume(true);
    const toastId = toast.loading(`Deleting ${resumeToDelete.title || resumeToDelete.originalFileName || 'resume'}...`);

    try {
      await resumeService.deleteResume(resumeToDelete._id);
      toast.success('Resume deleted successfully!', { id: toastId });

      const updated = await resumeService.getUserResumes();
      setResumes(updated || []);

      if (updated && updated.length > 0) {
        const nextResume = updated.find((r) => r.isDefault) || updated[0];
        handleSelectResume(nextResume._id);
      } else {
        setSelectedResumeId(null);
        setResumeDoc(null);
        setScoreResult(null);
        setAnalysis((prev) => ({
          ...prev,
          atsScore: 0,
          matchScore: 0,
          contentScore: 0,
          keywords: [],
          missingSkills: [],
          recommendations: [],
        }));
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete resume', { id: toastId });
    } finally {
      setIsDeletingResume(false);
      setIsDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const handleTargetRoleChange = async (newRole: string) => {
    setTargetRole(newRole);
    if (selectedResumeId) {
      await fetchAtsIntelligence(selectedResumeId, newRole);
    }
  };

  // Phase 7 Optimization Workflow Handlers
  const handleLaunchOptimization = async (rec: AIResumeRecommendation) => {
    if (!selectedResumeId) return;
    setIsOptimizing(true);
    setOptimizingRecId(rec.id);
    try {
      const draft = await resumeService.proposeOptimization(
        selectedResumeId,
        rec.id,
        targetRole,
        undefined
      );
      if (draft) {
        setSelectedDraft(draft);
        setIsOptimizationModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate optimization proposal.');
    } finally {
      setIsOptimizing(false);
      setOptimizingRecId(null);
    }
  };

  const handleTargetChange = async (targetBulletId: string) => {
    if (!selectedDraft || !selectedResumeId) return;
    setIsSwitchingTarget(true);
    try {
      const newDraft = await resumeService.proposeOptimization(
        selectedResumeId,
        selectedDraft.recommendationId,
        targetRole,
        undefined,
        targetBulletId
      );
      if (newDraft) {
        setSelectedDraft(newDraft);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to optimize selected bullet target.');
    } finally {
      setIsSwitchingTarget(false);
    }
  };

  const handleAcceptOptimization = async (draft: ResumeOptimizationDraft) => {
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
      } else {
        setAnalysis((prev) => ({
          ...prev,
          atsScore: draft.afterScores?.atsScore ?? prev.atsScore + 1,
          matchScore: draft.afterScores?.matchScore ?? (prev.matchScore ?? 78) + 2,
          contentScore: draft.afterScores?.contentScore ?? (prev.contentScore ?? 72) + 6,
        }));
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
  };

  const handleRejectOptimization = async (draft: ResumeOptimizationDraft) => {
    try {
      await resumeService.rejectOptimization(draft);
    } catch {
      // Graceful fallback
    }
    toast.info('Optimization dismissed. Base resume content remains untouched.');
    setIsOptimizationModalOpen(false);
    setSelectedDraft(null);
  };

  const handleBuilderConfigChange = useCallback((newConfig: ResumeBuilderConfig) => {
    setBuilderConfig(newConfig);

    if (!selectedResumeId) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setIsSavingBuilder(true);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await resumeService.saveBuilderConfig(selectedResumeId, newConfig);
      } catch (err) {
        console.error("Failed to persist builder config", err);
      } finally {
        setIsSavingBuilder(false);
      }
    }, 600);
  }, [selectedResumeId]);

  const handleViewModeChange = useCallback((mode: any) => {
    if (mode === 'audit' || mode === 'analysis') {
      setViewMode('audit');
    } else if (mode === 'builder' || mode === 'design') {
      setViewMode('builder');
    } else {
      setViewMode('editor');
    }
    setPreviewHighlightSection(activeSectionKey);
  }, [activeSectionKey]);

  const handleSectionClick = useCallback((secId: string) => {
    setPreviewHighlightSection(secId);
    setActiveSectionKey(secId as any);
    setActiveView('detail');
    setViewMode('editor');
    setMobileEditorView('editor');
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    const docToExport = resumeDoc || SAMPLE_RESUME_DOCUMENT_FIXTURE;
    if (!docToExport) {
      toast.error('No resume document available to download.');
      return;
    }

    setIsDownloadingPdf(true);
    const toastId = toast.loading('Generating high-fidelity vector PDF...');

    try {
      await exportResumeToPdf(docToExport, builderConfig);
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

  // Phase 5: Generate Suggestion Handler
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

  // Phase 5: Approve Suggestion Handler
  const handleApproveSuggestion = async () => {
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
        section: SECTION_CONFIGS.find((s) => s.id === activeSectionKey)?.title || activeSectionKey,
        from: result.previousScore,
        to: result.newScore,
      });
      setCurrentSuggestion(null);

      // Refresh scores from authoritative backend
      await fetchScore(selectedResumeId);
      toast.success("Section changes approved & updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to apply improvement.");
    } finally {
      setIsApplying(false);
    }
  };

  // Phase 5: Reject Suggestion Handler
  const handleRejectSuggestion = () => {
    setCurrentSuggestion(null);
    toast.info("Suggestion dismissed. Original resume content kept unchanged.");
  };

  // Derived Insights
  const overallScore = scoreResult?.overall.overallScore ?? 0;
  const overallTier: ScoreRatingTier = scoreResult?.overall.tier ?? 'Good';

  const { strongestSection, prioritySection } = useMemo(() => {
    if (!scoreResult) return { strongestSection: null, prioritySection: null };

    const sectionEntries = Object.entries(scoreResult.sections).map(([key, sec]) => ({
      id: key as keyof ResumeScoreResult['sections'],
      title: sec.title,
      score: sec.score,
      tier: sec.tier,
      weaknesses: sec.weaknesses,
      strengths: sec.strengths,
      components: sec.components,
    }));

    const sortedDesc = [...sectionEntries].sort((a, b) => b.score - a.score);
    const sortedAsc = [...sectionEntries].sort((a, b) => a.score - b.score);

    return {
      strongestSection: sortedDesc[0],
      prioritySection: sortedAsc[0],
    };
  }, [scoreResult]);

  // Selected Section for Detail View
  const selectedSectionData: SectionScore | undefined = scoreResult?.sections[activeSectionKey];
  const selectedConfig = SECTION_CONFIGS.find((s) => s.id === activeSectionKey);

  const getTierPill = (tier: ScoreRatingTier | 'Needs attention' | 'Good' | 'Strong') => {
    switch (tier) {
      case 'Excellent':
      case 'Strong':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40';
      case 'Good':
        return 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/40';
      case 'Developing':
      case 'Needs Work':
      case 'Needs attention':
      default:
        return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1130] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-pulse font-sans">
        <div className="h-14 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800" />
        <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-40 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
        <div className="h-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  // Error State
  if (error && !scoreResult && resumes.length > 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Resume analysis unavailable</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={() => selectedResumeId && fetchScore(selectedResumeId)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Render Full ATS Diagnostics & Intelligence Dashboard (viewMode === 'analysis')
  const renderAtsDiagnosticsContent = () => (
    <AtsDiagnosticsView
      targetRole={targetRole}
      onTargetRoleChange={handleTargetRoleChange}
      analysis={analysis}
      activePillar={activePillar}
      onSelectPillar={setActivePillar}
      onOpenEditor={() => {
        setViewMode('editor');
        setMobileEditorView('editor');
      }}
      onUploadClick={() => fileInputRef.current?.click()}
      isUploading={isUploading}
      onOptimize={handleLaunchOptimization}
      isOptimizing={isOptimizing}
      optimizingRecId={optimizingRecId}
      scoreResult={scoreResult}
      prioritySection={prioritySection}
      onSectionFixWithAi={(secId) => {
        setActiveSectionKey(secId as any);
        setPreviewHighlightSection(secId);
        setActiveView('detail');
        setViewMode('editor');
        setMobileEditorView('editor');
      }}
      currentResume={resumes.find((r) => r._id === selectedResumeId) || null}
      onDeleteClick={() => handleDeleteClick()}
    />
  );

  // Render Left Analysis Column (Overview or Detail in Split View)
  const renderAnalysisContent = () => (
    <div className="space-y-6">
      {/* Top Action & Control Bar for AI Analysis */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {activeView === 'detail' ? (
            <button
              onClick={() => {
                setActiveView('overview');
                setCurrentSuggestion(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sections</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono truncate">
                Section AI Assistant
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Upload New Resume Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.docx,application/pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Upload New Resume for ATS Analysis"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
            )}
            <span>{isUploading ? 'Analyzing...' : 'Upload Resume'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          
          {/* Section A: Resume Health */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Your Resume
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTierPill(overallTier)}`}>
                {overallTier}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold tracking-tight ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-base font-semibold text-slate-400">
                / 100
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {scoreResult?.overall.summaryReason || "You have a solid foundation. Work Experience is your biggest opportunity to improve."}
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/80">
              {strongestSection && (
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Strongest
                  </span>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span>{strongestSection.title}</span>
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">{strongestSection.score} / 100</span>
                  </div>
                </div>
              )}

              {prioritySection && (
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Needs attention
                  </span>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200">
                    <span>{prioritySection.title}</span>
                    <span className="font-mono text-xs text-amber-600 dark:text-amber-400 font-bold">{prioritySection.score} / 100</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Needs Attention (Main Actionable Priority) */}
          {prioritySection && prioritySection.score < 85 && (
            <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Needs Attention
                  </span>
                </div>
                <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                  {prioritySection.score} / 100
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {prioritySection.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  Your {prioritySection.title.toLowerCase()} section has the biggest opportunity for improvement.
                </p>
              </div>

              {prioritySection.weaknesses && prioritySection.weaknesses.length > 0 && (
                <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {prioritySection.weaknesses.slice(0, 2).map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setActiveSectionKey(prioritySection.id);
                    setPreviewHighlightSection(prioritySection.id);
                    setActiveView('detail');
                    setShowScoringDetails(false);
                    setCurrentSuggestion(null);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <span>Review {prioritySection.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setPreviewHighlightSection(prioritySection.id);
                    setViewMode('visual');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview on Resume</span>
                </button>
              </div>
            </div>
          )}

          {/* Section C: Resume Sections (Compact List) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Resume Sections
              </h2>
              <span className="text-xs text-slate-400">Select to review</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {SECTION_CONFIGS.map((sec) => {
                const Icon = sec.icon;
                const secScore = scoreResult?.sections[sec.id]?.score ?? 100;
                const isWeakest = prioritySection?.id === sec.id && secScore < 85;

                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionKey(sec.id);
                      setPreviewHighlightSection(sec.id);
                      setActiveView('detail');
                      setShowScoringDetails(false);
                      setCurrentSuggestion(null);
                    }}
                    className="w-full flex items-center justify-between py-3.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {sec.title}
                        </span>
                        {isWeakest && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Attention
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono font-bold ${getScoreColor(secScore)}`}>
                        {secScore}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: SECTION DETAIL & AI EDITOR (Isolated memoized workspace) */}
      {activeView === 'detail' && selectedSectionData && selectedConfig && (
        <SectionAiWorkspace
          sectionData={selectedSectionData}
          icon={selectedConfig.icon}
          isGenerating={isGenerating}
          isApplying={isApplying}
          currentSuggestion={currentSuggestion}
          onGenerate={handleGenerateSuggestion}
          onApply={handleApproveSuggestion}
          onDismissSuggestion={() => setCurrentSuggestion(null)}
          onBack={() => {
            setActiveView('overview');
            setCurrentSuggestion(null);
          }}
          onPreviewOnResume={() => {
            setPreviewHighlightSection(activeSectionKey);
            setViewMode('visual');
          }}
        />
      )}
    </div>
  );

  // Render Visual Resume Preview with section jump navigation
  const renderVisualResumeContent = () => (
    <div className="space-y-6">
      {/* Section Jump Quick Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium px-1">Jump to section:</span>
          {SECTION_CONFIGS.map((s) => {
            const isSelected = previewHighlightSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setPreviewHighlightSection(s.id);
                  setActiveSectionKey(s.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {s.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            setActiveSectionKey((previewHighlightSection as any) || 'experience');
            setActiveView('detail');
            setViewMode('analysis');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors cursor-pointer"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Improve Section in AI</span>
        </button>
      </div>

      {/* Render Canonical Resume Document */}
      <div className="py-2">
        <ResumeRenderer
          document={resumeDoc || SAMPLE_RESUME_DOCUMENT_FIXTURE}
          highlightSectionId={previewHighlightSection || (activeView === 'detail' ? activeSectionKey : null)}
          onSectionClick={(sectionId) => {
            setPreviewHighlightSection(sectionId);
            setActiveSectionKey(sectionId as any);
          }}
          interactive={true}
          config={builderConfig}
        />
      </div>
    </div>
  );

  // Destination 2 & 3: Unified Edit & Design Workspace (Combines Section AI Editor, Full Builder Controls & Live Canvas)
  const renderEditAndDesignContent = () => (
    <div className="space-y-6">
      {/* Integrated Mode Switcher & Summary Bar */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Sub-Switch: Edit Content vs Design & Layout Settings */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => {
                setViewMode('editor');
                setMobileEditorView('editor');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode !== 'builder'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Section Content & AI</span>
            </button>

            <button
              onClick={() => {
                setViewMode('builder');
                setMobileEditorView('editor');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'builder'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Design & Layout Settings</span>
            </button>
          </div>

          {/* Active Template & Font summary badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>{builderConfig.templateId} Template</span>
            </span>
            <span>•</span>
            <span className="font-mono text-[11px] capitalize">{builderConfig.fontFamily}</span>
          </div>
        </div>
      </div>

      {/* Responsive Work Area: Side-by-Side on Desktop (lg+), Toggleable on Mobile (<lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Either Full Resume Builder Controls OR Section AI Copilot */}
        <div className={`lg:col-span-6 space-y-6 ${mobileEditorView === 'editor' ? 'block' : 'hidden lg:block'}`}>
          {viewMode === 'builder' ? (
            <ResumeBuilderControls
              config={builderConfig}
              onChange={handleBuilderConfigChange}
              isSaving={isSavingBuilder}
            />
          ) : (
            renderAnalysisContent()
          )}
        </div>

        {/* Right Column: Live A4 Resume Canvas (Concurrently deferred rendering for 60-120 FPS) */}
        <LiveResumeCanvas
          document={resumeDoc}
          config={builderConfig}
          highlightSectionId={activeView === 'detail' ? activeSectionKey : previewHighlightSection}
          onSectionClick={(secId) => {
            setActiveSectionKey(secId as any);
            setActiveView('detail');
            setViewMode('editor');
            setMobileEditorView('editor');
          }}
          isVisibleOnMobile={mobileEditorView === 'preview'}
        />
      </div>

      {/* Floating Bottom Pill for Mobile (< lg) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center p-1 rounded-full bg-slate-900/90 dark:bg-slate-800/90 text-white shadow-2xl backdrop-blur-md border border-slate-700/80">
        <button
          onClick={() => setMobileEditorView('editor')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            mobileEditorView === 'editor'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          {viewMode === 'builder' ? (
            <>
              <Sliders className="w-3.5 h-3.5" />
              <span>Layout Settings</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Edit Content</span>
            </>
          )}
        </button>
        <button
          onClick={() => setMobileEditorView('preview')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            mobileEditorView === 'preview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Paper</span>
        </button>
      </div>
    </div>
  );

  const isLocked = !loading && resumes.length === 0;

  return (
    <div className="relative min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1130] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 overflow-x-hidden">
      
      {/* Background Dashboard & Studio Workspace (Blurred & non-interactive when locked) */}
      <div className={`flex flex-col lg:flex-row flex-1 min-w-0 transition-all duration-500 ${
        isLocked ? 'filter blur-[7px] opacity-40 dark:opacity-30 pointer-events-none select-none scale-[0.995] origin-top' : ''
      }`}>
        {/* 1. Extreme-Left Docked Studio Sidebar (Desktop + Mobile Slide-Over) */}
        <ResumeStudioSidebar
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          activeSectionKey={previewHighlightSection || (activeView === 'detail' ? activeSectionKey : undefined)}
          onSectionClick={handleSectionClick}
          overallScore={scoreResult?.overall.overallScore}
          scoreTier={scoreResult?.overall.tier}
          templateId={builderConfig.templateId}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* 2. Main Studio Workspace Area (Edge-to-edge, zero useless outer dead space) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
          
          {/* Top Studio Action & Status Bar */}
          <header className="h-16 shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Mobile Hamburger to toggle sidebar */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Open Workspace Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Current Active Mode Title */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAudit
                    ? 'ATS Audit & Score'
                    : viewMode === 'builder'
                    ? 'Design & Layout Settings'
                    : 'Section Content & AI'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              {resumes.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedResumeId || ''}
                    onChange={(e) => handleSelectResume(e.target.value)}
                    className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 max-w-[130px] sm:max-w-[200px] truncate"
                  >
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title || r.originalFileName || 'Resume'} {r.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {selectedResumeId && (
                <>
                  <button
                    onClick={() => fetchScore(selectedResumeId)}
                    disabled={refreshing}
                    title="Refresh score"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleDeleteClick()}
                    disabled={isDeletingResume}
                    title="Delete this resume"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Download Button in Header */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-all cursor-pointer shadow-xs shrink-0 disabled:opacity-60"
                title="Download High-Fidelity Vector PDF"
              >
                {isDownloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">
                  {isDownloadingPdf ? 'Generating...' : 'Download'}
                </span>
              </button>
            </div>
          </header>

          {/* Studio Workspace Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Score Delta Notification Banner (After Approval) */}
            {scoreDeltaNotice && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">{scoreDeltaNotice.section} score updated: </span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{scoreDeltaNotice.from} → </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{scoreDeltaNotice.to} / 100</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-2">Re-analyzed from updated resume.</span>
                  </div>
                </div>
                <button
                  onClick={() => setScoreDeltaNotice(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 1. Destination 1: ATS Audit & Score */}
            {isAudit && renderAtsDiagnosticsContent()}

            {/* 2. Destination 2: Edit & Design */}
            {!isAudit && renderEditAndDesignContent()}
          </main>
        </div>
      </div>

      {/* Centered Glassmorphism Lock Screen Overlay when candidate has no uploaded resume */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/25 dark:bg-[#070b1e]/55 backdrop-blur-[4px] animate-in fade-in duration-300">
          {/* Ambient radial blur glowing backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Frosted Glass Card */}
          <div className="relative max-w-lg w-full rounded-3xl p-8 sm:p-10 bg-white/75 dark:bg-[#0c1236]/85 backdrop-blur-2xl border border-white/60 dark:border-indigo-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] text-center space-y-6 overflow-hidden">
            {/* Internal ambient corner glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 dark:bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 dark:bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Lock Icon with Glowing Ring */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-indigo-600/20 dark:from-indigo-900/50 dark:via-purple-900/30 dark:to-indigo-800/50 border border-indigo-500/30 dark:border-indigo-400/40 flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Resume Studio is Locked
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
                Upload your resume to unlock real-time ATS scoring, section-by-section AI diagnostics, and the interactive live editor.
              </p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className={`group relative z-10 p-6 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-300/80 dark:border-slate-700/80 hover:border-indigo-500/70 dark:hover:border-indigo-400/70 bg-white/40 dark:bg-slate-900/40 hover:bg-white/70 dark:hover:bg-slate-900/60'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                {isUploading ? (
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isUploading ? 'Analyzing and parsing resume...' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  Supports PDF or DOCX (Max 5MB)
                </p>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".pdf,.docx,application/pdf"
              className="hidden"
            />

            {/* Primary Action Button */}
            <div className="relative z-10">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Resume...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Resume to Unlock</span>
                  </>
                )}
              </button>
            </div>

            {/* Unlocked Capabilities Highlights */}
            <div className="relative z-10 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> ATS Scoring
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> AI Diagnostics
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Live Editor
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Phase 7 Interactive Optimization Review Modal with Target Selector */}
      <OptimizationReviewModal
        draft={selectedDraft}
        isOpen={isOptimizationModalOpen}
        isApplying={isApplyingOptimization}
        isSwitchingTarget={isSwitchingTarget}
        onClose={() => setIsOptimizationModalOpen(false)}
        onAccept={handleAcceptOptimization}
        onReject={handleRejectOptimization}
        onTargetChange={handleTargetChange}
      />

      {/* Delete Resume Confirmation Modal */}
      {isDeleteDialogOpen && resumeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Delete Resume Document?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete <span className="font-semibold text-slate-800 dark:text-slate-200">"{resumeToDelete.title || resumeToDelete.originalFileName || 'Resume'}"</span>?
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
              <p className="font-medium text-slate-700 dark:text-slate-300">This will permanently remove:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500 dark:text-slate-400">
                <li>Parsed resume content & sections</li>
                <li>Calculated ATS scores & role alignment</li>
                <li>AI bullet suggestions & optimization drafts</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setResumeToDelete(null);
                }}
                disabled={isDeletingResume}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteResume}
                disabled={isDeletingResume}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition cursor-pointer disabled:opacity-50"
              >
                {isDeletingResume ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
