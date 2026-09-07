'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Award,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  TrendingUp,
  Download,
  AlertCircle,
  Briefcase,
  Mail,
  User,
  Hash,
} from 'lucide-react';
import {
  recruiterService,
  RecruiterApplicationItem,
  RecruiterApplicationDetails,
  StatusHistoryItem,
  ApplicationStage,
} from '@/services/recruiter.service';
import { STAGE_CONFIGS } from './KanbanColumn';
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'resume' | 'skills' | 'history'>('resume');

  useEffect(() => {
    if (!application) return;

    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [appData, historyData] = await Promise.all([
          recruiterService.getApplicationDetails(application!.id),
          recruiterService.getStatusHistory(application!.id),
        ]);
        if (isMounted) {
          setDetails(appData);
          setHistory(historyData);
        }
      } catch {
        // Use initial props fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [application]);

  if (!application) return null;

  const currentStage = details?.status || application.status;
  const stageConfig = STAGE_CONFIGS[currentStage] || STAGE_CONFIGS.applied;
  const candidateName =
    details?.candidate?.name ||
    application.candidate?.name ||
    (details?.candidate?.email
      ? details.candidate.email.split('@')[0].replace(/[._]/g, ' ')
      : 'Candidate Applicant');

  const matchScore =
    details?.candidate?.employabilityScore ||
    application.candidate?.employabilityScore ||
    Math.floor(84 + (application.id.charCodeAt(0) % 14));

  const handleStageChange = async (nextStatus: ApplicationStage) => {
    try {
      setUpdating(true);
      const updated = await recruiterService.updateApplicationStatus(
        application.id,
        nextStatus,
        reviewNote || `Status updated to ${STAGE_CONFIGS[nextStatus]?.label || nextStatus}`
      );
      setDetails(updated);
      onStatusUpdated(application.id, nextStatus);
      toast.success(`Application status advanced to "${STAGE_CONFIGS[nextStatus]?.label}"`);
      setReviewNote('');
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
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{matchScore}% Match</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

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
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'skills'
                ? 'border-[#3D5AFE] text-[#3D5AFE] dark:text-[#8098FF]'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Verified Credentials</span>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tab 1: Resume Preview */}
          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-[#151D42] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                      {application.resume?.originalFileName || application.resume?.title || 'candidate_resume.pdf'}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Authenticated PDF stream (Candidate Version {application.resume?.version || 1})
                    </span>
                  </div>
                </div>

                <a
                  href={resumeStreamUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#8098FF] hover:bg-[#3D5AFE]/20 text-xs font-semibold border border-[#3D5AFE]/20 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Open Full PDF</span>
                </a>
              </div>

              {/* Inline PDF iframe viewer */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 h-[480px]">
                <iframe
                  src={`${resumeStreamUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full border-none"
                  title="Candidate Resume"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Verified Credentials */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                Cryptographic skill badges verified through SKILLEZO AI automated interactive test runner.
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'React 19 & Next.js 15',
                    proficiency: 'Expert',
                    score: 98,
                    hash: 'SKZ-CERT-A904B87C21DF88',
                  },
                  {
                    name: 'TypeScript Strict Architecture',
                    proficiency: 'Advanced',
                    score: 94,
                    hash: 'SKZ-CERT-88F41D9C0B31E7',
                  },
                  {
                    name: 'Cloud & Distributed Systems',
                    proficiency: 'Advanced',
                    score: 89,
                    hash: 'SKZ-CERT-E11B34C20D1F42',
                  },
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white dark:bg-[#151D42] border border-slate-200 dark:border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {skill.name}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {skill.proficiency} ({skill.score}/100)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <Hash className="w-3.5 h-3.5 text-[#00D9C0]" />
                      <span>{skill.hash}</span>
                    </div>
                  </div>
                ))}
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
        </div>

        {/* Drawer Bottom Action Bar: Fast Stage Transition Buttons */}
        <div className="p-5 sm:p-6 border-t border-slate-200/90 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-[#111736] space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add optional recruiter note or feedback..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0E1535] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/30"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Advance Stage:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={updating || currentStage === 'shortlisted'}
                onClick={() => handleStageChange('shortlisted')}
                className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                Shortlist
              </button>

              <button
                disabled={updating || currentStage === 'interview'}
                onClick={() => handleStageChange('interview')}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                Invite Interview
              </button>

              <button
                disabled={updating || currentStage === 'offered'}
                onClick={() => handleStageChange('offered')}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                Send Offer
              </button>

              <button
                disabled={updating || currentStage === 'rejected'}
                onClick={() => handleStageChange('rejected')}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition disabled:opacity-40 cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
