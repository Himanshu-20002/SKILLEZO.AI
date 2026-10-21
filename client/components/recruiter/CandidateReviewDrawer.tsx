'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Download,
  Briefcase,
  Mail,
  Gift,
  XCircle,
} from 'lucide-react';
import {
  recruiterService,
  RecruiterApplicationItem,
  RecruiterApplicationDetails,
  StatusHistoryItem,
  ApplicationStage,
} from '@/services/recruiter.service';
import { STAGE_CONFIGS } from './KanbanColumn';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';
import { SendOfferModal } from './SendOfferModal';
import { CandidateMessagesTab } from './CandidateMessagesTab';
import {
  previewResumePdf,
  exportResumeToPdf,
  createCandidateResumeDocument,
} from '@/services/pdf-export.service';
import { toast } from 'sonner';

interface CandidateReviewDrawerProps {
  application: RecruiterApplicationItem | null;
  onClose: () => void;
  onStatusUpdated: (updatedAppId: string, nextStatus: ApplicationStage) => void;
}

export const CandidateReviewDrawer: React.FC<CandidateReviewDrawerProps> = ({
  application,
  onClose,
  onStatusUpdated,
}) => {
  const [details, setDetails] = useState<RecruiterApplicationDetails | null>(null);
  const [history, setHistory] = useState<StatusHistoryItem[]>([]);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'messages' | 'history'>('resume');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isConfirmingRevoke, setIsConfirmingRevoke] = useState(false);

  useEffect(() => {
    if (!application) return;

    let isMounted = true;
    async function loadData() {
      try {
        const [appData, historyData] = await Promise.all([
          recruiterService.getApplicationDetails(application!.id),
          recruiterService.getStatusHistory(application!.id),
        ]);
        if (isMounted) {
          setDetails(appData);
          setHistory(historyData);
        }
      } catch {
        // Retain initial application props as fallback
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [application]);

  // Unified, single-pass calculation for verified and self-reported skills
  const { verifiedSkills, claimedSkillsList, uniqueSkills } = useMemo(() => {
    const verified = details?.candidate?.verifiedSkills || [];
    const verifiedSet = new Set(verified.map((v) => v.name.toLowerCase().trim()));
    const rawSkills = [
      ...(details?.candidate?.skills || []),
      ...(application?.candidate?.skills || []),
      ...verified.map((v) => v.name),
    ];
    const unique = Array.from(
      new Set(rawSkills.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean))
    );
    const claimed = unique.filter((s) => !verifiedSet.has(s.toLowerCase()));
    return { verifiedSkills: verified, claimedSkillsList: claimed, uniqueSkills: unique };
  }, [details?.candidate?.verifiedSkills, details?.candidate?.skills, application?.candidate?.skills]);

  if (!application) return null;

  const currentStage = details?.status || application.status;
  const isOfferAccepted = details?.offerDetails?.status === 'accepted';
  const isOfferDeclined = details?.offerDetails?.status === 'declined';
  const isHired = currentStage === 'hired' || isOfferAccepted;
  const isRejected = currentStage === 'rejected' || isOfferDeclined;
  const isOffered = currentStage === 'offered' && !isHired && !isRejected;
  const isInterview = currentStage === 'interview';
  const isApplied = currentStage === 'applied' || (currentStage as string) === 'under_review';

  const effectiveStage: ApplicationStage = isHired
    ? 'hired'
    : isRejected
      ? 'rejected'
      : currentStage;
  const stageConfig = STAGE_CONFIGS[effectiveStage] || STAGE_CONFIGS.applied;

  const handleOfferStatusDetected = (status: 'accepted' | 'declined', offerDetails?: any) => {
    const nextStage: ApplicationStage = status === 'accepted' ? 'hired' : 'rejected';
    if (currentStage !== nextStage) {
      onStatusUpdated(application.id, nextStage);
      if (details) {
        setDetails({
          ...details,
          status: nextStage,
          offerDetails: offerDetails || details.offerDetails,
        });
      }
    }
  };

  const candidateName =
    details?.candidate?.name ||
    application.candidate?.name ||
    (details?.candidate?.email || application.candidate?.email)?.split('@')[0]?.replace(/[._]/g, ' ') ||
    'Candidate Applicant';

  const matchScore =
    details?.candidate?.employabilityScore ??
    application.candidate?.employabilityScore ??
    null;

  const handleStageChange = async (nextStatus: ApplicationStage) => {
    try {
      setUpdating(true);
      const updated = await recruiterService.updateApplicationStatus(
        application.id,
        nextStatus,
        `Status updated to ${STAGE_CONFIGS[nextStatus]?.label || nextStatus}`
      );
      setDetails(updated);
      onStatusUpdated(application.id, nextStatus);
      toast.success(`Application status advanced to "${STAGE_CONFIGS[nextStatus]?.label}"`);
      // Reload status history
      const freshHistory = await recruiterService.getStatusHistory(application.id);
      setHistory(freshHistory);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const resumeStreamUrl = recruiterService.getResumeStreamUrl(application.id);

  const getActiveResumeDocument = () => {
    if (details?.resumeSnapshot?.resumeDocument) {
      return details.resumeSnapshot.resumeDocument;
    }
    return createCandidateResumeDocument({
      candidateName,
      email: details?.candidate?.email || application.candidate?.email,
      phone: details?.candidate?.phone,
      location: details?.candidate?.location,
      headline:
        details?.candidate?.headline ||
        application.candidate?.headline ||
        application.job?.title,
      bio: details?.candidate?.bio,
      skills: uniqueSkills,
    });
  };

  const handleViewPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const doc = getActiveResumeDocument();
      await previewResumePdf(doc, details?.resumeSnapshot?.builderConfig);
    } catch (err: any) {
      console.error('Vector PDF preview failed, falling back to stream:', err);
      window.open(resumeStreamUrl, '_blank');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const doc = getActiveResumeDocument();
      const cleanFileName =
        application.resume?.originalFileName ||
        `${candidateName.replace(/\s+/g, '_')}_resume.pdf`;
      await exportResumeToPdf(doc, details?.resumeSnapshot?.builderConfig, cleanFileName);
      toast.success('Resume downloaded successfully');
    } catch (err: any) {
      console.error('Vector PDF download failed, falling back to stream:', err);
      const link = document.createElement('a');
      link.href = `${resumeStreamUrl}?download=true`;
      link.download =
        application.resume?.originalFileName ||
        `${candidateName.replace(/\s+/g, '_')}_resume.pdf`;
      link.click();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0E1535] border-l border-slate-200 dark:border-slate-800 shadow-2xl h-full flex flex-col justify-between overflow-hidden">
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/90 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-[#111736]">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white capitalize truncate">
                {candidateName}
              </h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${stageConfig.badgeBg} ${stageConfig.badgeText} ${stageConfig.badgeBorder}`}>
                <stageConfig.icon className="w-3.5 h-3.5" />
                {stageConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {details?.job?.title || application.job?.title}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {details?.candidate?.email || 'candidate@example.com'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {matchScore !== null ? (
              <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{matchScore}% Match</span>
              </div>
            ) : (
              <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1">
                <span>Profile Review</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Celebratory Hired Banner */}
        {isHired && (
          <div className="mx-5 sm:mx-6 mt-3.5 mb-1 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3 text-xs shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                  <span>🎉 Candidate Officially Hired</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                    Offer Accepted
                  </span>
                </p>
                <p className="text-emerald-700 dark:text-emerald-400 text-[11px] truncate">
                  {details?.offerDetails?.joiningDate
                    ? `Joining on ${new Date(details.offerDetails.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}`
                    : 'Employment offer confirmed by candidate.'}
                  {details?.offerDetails?.annualCompensation ? ` • Compensation: ${details.offerDetails.annualCompensation}` : ''}
                </p>
              </div>
            </div>
            {activeTab !== 'messages' && (
              <button
                onClick={() => setActiveTab('messages')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition"
              >
                View Offer Chat
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0E1535]">
          <button
            onClick={() => setActiveTab('resume')}
            className={`py-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'resume'
                ? 'border-[#3D5AFE] text-[#3D5AFE] dark:text-[#8098FF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resume Document</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`py-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'messages'
                ? 'border-[#3D5AFE] text-[#3D5AFE] dark:text-[#8098FF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat & Messages</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#3D5AFE] text-[#3D5AFE] dark:text-[#8098FF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit History ({history.length})</span>
          </button>
        </div>

        {/* Drawer Body Area */}
        <div
          className={`flex-1 min-h-0 flex flex-col ${
            activeTab === 'messages' ? 'overflow-hidden p-0' : 'overflow-y-auto p-6 space-y-6'
          }`}
        >
          {/* Tab 1: Candidate Career Dossier & Resume */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono truncate">
                        {application.resume?.originalFileName || application.resume?.title || 'candidate_resume.pdf'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                        ✓ Attached File
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                      Canonical Career Dossier (Version {application.resume?.version || 1}) • Applied Resume
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleViewPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isGeneratingPdf ? 'Rendering PDF...' : 'View Resume PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                    title="Download candidate resume PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Structured Resume Profile Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111736] p-5 space-y-5">
                {/* Candidate Overview */}
                <div className="space-y-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {details?.candidate?.headline || application.candidate?.headline || details?.job?.title || application.job?.title || 'Candidate Profile'}
                  </h3>
                  {details?.candidate?.bio ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {details.candidate.bio}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                      No profile summary provided by candidate.
                    </p>
                  )}
                </div>

                {/* Quick Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1535] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Target Role</span>
                    <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {details?.job?.title || application.job?.title || 'Applied Position'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1535] border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Employability Index</span>
                    <p className={`font-semibold mt-0.5 ${matchScore !== null ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {matchScore !== null ? `${matchScore}/100 Verified Index` : 'Pending Evaluation'}
                    </p>
                  </div>
                </div>

                {/* Skills Breakdown: Authentic Verified Test Badges vs Self-Reported Resume Skills */}
                <div className="space-y-4 pt-1">
                  {/* Section A: Verified Technical Competencies */}
                  {verifiedSkills.length > 0 ? (
                    <div className="space-y-2.5 p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wide">
                            Verified Technical Competencies
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {verifiedSkills.length} Test Verified
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                        Skills authenticated via SKILLEZO interactive test runner and verification ledger.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {verifiedSkills.map((v, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#0E1535] border border-emerald-500/30 shadow-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {v.name}
                                </p>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                  {v.proficiency} • {v.score}%
                                </p>
                              </div>
                            </div>
                            {v.credentialHash && (
                              <span
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0"
                                title={`Credential Hash: ${v.credentialHash}`}
                              >
                                {v.credentialHash.slice(0, 10)}...
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0E1535] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          No Verified Skill Badges Yet
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Candidate has not completed official SKILLEZO assessment tests for verified badge issuance. Self-reported profile skills are listed below.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Section B: Self-Reported Skills (Claimed on Resume) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wide">
                          Self-Reported Skills (Profile & Resume)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {claimedSkillsList.length} Listed
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Self-declared by candidate
                      </span>
                    </div>
                    {claimedSkillsList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {claimedSkillsList.map((sk, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-[#151D42] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic py-1">
                        No additional self-reported skills provided.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Tab 3: History Audit Log */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No stage history entries recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {history.map((item, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#3D5AFE] ring-4 ring-white dark:ring-[#0E1535]" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                          {STAGE_CONFIGS[item.toStatus as ApplicationStage]?.label || item.toStatus}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.changedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.reason || `Advanced to ${item.toStatus}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Two-Way Chat & Messages */}
          {activeTab === 'messages' && (
            <CandidateMessagesTab
              applicationId={application.id}
              initialConversationId={
                (details as any)?.conversationId || (application as any).conversationId
              }
              candidateName={candidateName}
              candidateId={application.candidate?.id || details?.candidate?.id || ''}
              onScheduleInterviewClick={() => setIsScheduleModalOpen(true)}
              onOfferStatusDetected={handleOfferStatusDetected}
              isHired={isHired}
            />
          )}
        </div>

        {/* Drawer Bottom Action Bar: State-Aware Transition Actions */}
        <div
          className={`p-4 sm:p-5 border-t shrink-0 flex flex-wrap items-center justify-between gap-3 ${isHired
              ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:bg-[#0c1f28]'
              : isRejected
                ? 'border-rose-500/20 bg-rose-500/5 dark:bg-[#1f1325]'
                : isOffered
                  ? 'border-amber-500/20 bg-amber-500/5 dark:bg-[#151a38]'
                  : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-[#111736]'
            }`}
        >
          {/* Status Context Pill / Stage Info */}
          <div className="flex items-center gap-2.5">
            {isHired ? (
              <>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                      Candidate Hired
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      Offer Accepted
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {details?.offerDetails?.joiningDate
                      ? `Joining on ${new Date(details.offerDetails.joiningDate).toLocaleDateString(undefined, { dateStyle: 'medium' })} • Onboarding Confirmed`
                      : 'Official job offer accepted by candidate.'}
                  </span>
                </div>
              </>
            ) : isRejected ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                    Application Closed (Rejected)
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {details?.offerDetails?.declineReason
                      ? `Declined: "${details.offerDetails.declineReason}"`
                      : 'Candidate rejected for this position'}
                  </span>
                </div>
              </>
            ) : isOffered ? (
              <>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Gift className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">
                    Offer Extended
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Awaiting candidate decision or manual confirmation
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <stageConfig.icon className="w-3.5 h-3.5 text-[#3D5AFE]" />
                Advance Stage:
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isHired ? (
              <>
                {activeTab !== 'messages' ? (
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="px-3.5 py-2 rounded-xl bg-[#3D5AFE] hover:bg-[#324ad9] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Chat</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('resume')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#182046] dark:hover:bg-[#1f2a5c] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#3D5AFE]" />
                    <span>View Resume</span>
                  </button>
                )}

                {!isConfirmingRevoke ? (
                  <button
                    onClick={() => setIsConfirmingRevoke(true)}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 text-xs font-medium transition cursor-pointer"
                    title="Revoke hire if candidate reneged or failed background check"
                  >
                    Revoke Hire
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl">
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                      Revoke hire?
                    </span>
                    <button
                      disabled={updating}
                      onClick={() => {
                        handleStageChange('rejected');
                        setIsConfirmingRevoke(false);
                      }}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      Yes, Revoke
                    </button>
                    <button
                      onClick={() => setIsConfirmingRevoke(false)}
                      className="px-2 py-1 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-[10px] font-medium transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            ) : isRejected ? (
              <button
                disabled={updating}
                onClick={() => handleStageChange('under_review')}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold transition cursor-pointer"
              >
                Reopen Review
              </button>
            ) : (
              <>
                {/* Shortlist - only on new applications */}
                {isApplied && (
                  <button
                    disabled={updating}
                    onClick={() => {
                      handleStageChange('shortlisted');
                      setActiveTab('messages');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                  >
                    Shortlist
                  </button>
                )}

                {/* Schedule Interview - for applied, shortlisted, interview */}
                {!isOffered && (
                  <button
                    disabled={updating}
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isInterview ? 'Schedule Next Round' : 'Schedule Interview'}</span>
                  </button>
                )}

                {/* Send/Update Offer */}
                <button
                  disabled={updating}
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{isOffered ? 'Update Offer' : 'Send Offer'}</span>
                </button>

                {/* Mark as Hired - verbal/offline acceptance */}
                {isOffered && (
                  <button
                    disabled={updating}
                    onClick={() => handleStageChange('hired')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Hired</span>
                  </button>
                )}

                {/* Reject / Withdraw */}
                <button
                  disabled={updating}
                  onClick={() => handleStageChange('rejected')}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
                >
                  {isOffered ? 'Withdraw / Reject' : 'Reject'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        applicationId={application.id}
        candidateName={candidateName}
        jobTitle={details?.job?.title || application.job?.title || 'Position'}
        onScheduled={(result) => {
          onStatusUpdated(application.id, 'interview');
          if (details) {
            setDetails({
              ...details,
              status: 'interview',
              interviewSchedule: result.application?.interviewSchedule,
            });
          }
          setActiveTab('messages');
        }}
      />

      {/* Send Official Job Offer Modal */}
      <SendOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        applicationId={application.id}
        candidateName={candidateName}
        jobTitle={details?.job?.title || application.job?.title || 'Position'}
        companyName={details?.job?.companyName || application.job?.companyName || 'SKILLEZO Hiring Team'}
        onOfferSent={(result) => {
          onStatusUpdated(application.id, 'offered');
          if (details) {
            setDetails({
              ...details,
              status: 'offered',
              offerDetails: result.application?.offerDetails,
            });
          }
          setActiveTab('messages');
        }}
      />
    </div>
  );
};
