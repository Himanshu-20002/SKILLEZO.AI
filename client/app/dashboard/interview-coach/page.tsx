'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Bot,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Loader2,
  Eye,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  InterviewSession,
  InterviewQuestion,
} from '@/types/interview-coach';
import { InterviewSetupWizard } from '@/components/dashboard/interview-coach/InterviewSetupWizard';
import { QuestionPlanModal } from '@/components/dashboard/interview-coach/QuestionPlanModal';
import { toast } from 'sonner';

export default function InterviewCoachPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Selected session for viewing question plan
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<InterviewQuestion[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: {
          data: InterviewSession[];
          total: number;
        };
      }>('/api/interviews/sessions');

      if (res?.data?.data) {
        setSessions(res.data.data);
      }
    } catch (err: any) {
      console.warn('Failed to fetch interview sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleWizardSuccess = (newSession: InterviewSession, newQuestions: InterviewQuestion[]) => {
    setSessions((prev) => [newSession, ...prev]);
    setActiveSession(newSession);
    setActiveQuestions(newQuestions);
    setIsPlanModalOpen(true);
  };

  const handleViewSessionQuestions = async (session: InterviewSession) => {
    setActiveSession(session);
    setLoadingQuestions(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        data: InterviewQuestion[];
      }>(`/api/interviews/sessions/${session._id}/questions`);

      if (res?.data && Array.isArray(res.data)) {
        setActiveQuestions(res.data);
        setIsPlanModalOpen(true);
      } else {
        toast.info('No questions found for this session');
      }
    } catch (err: any) {
      toast.error('Failed to load session questions', {
        description: err.message,
      });
    } finally {
      setLoadingQuestions(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* ── Top Hero Banner ─────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c1333] via-[#111a47] to-[#1c1447] text-white p-6 sm:p-8 border border-indigo-900/60 shadow-xl shadow-indigo-950/30">
        {/* Ambient celestial lights */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3D5AFE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#00D9C0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#00D9C0]" />
              <span>AI Mock Interview Coach • Phase 2 Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Master Technical & Behavioral Interviews with{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent">
                Adaptive AI Rehearsals
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Calibrate role-specific questions for .NET, React, Python, Java, DevOps & Cloud. Practice with structured rubrics before high-stakes hiring loops.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#3D5AFE] via-indigo-600 to-[#00D9C0] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-[#3D5AFE]/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-cyan-200" />
              <span>Start New Mock Interview</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Pill Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Practiced Sessions</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {sessions.length}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Target Roles</div>
            <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-1">
              10+ Tracks
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Evaluation Model</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              Gemini AI
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-xs text-slate-400 font-medium">Format Modes</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-1">
              Text & Voice
            </div>
          </div>
        </div>
      </div>

      {/* ── Sessions History & Itinerary ────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Your Interview Sessions</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {sessions.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review calibrated question plans and track readiness across each target position.
            </p>
          </div>

          {sessions.length > 0 && (
            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D5AFE] dark:text-cyan-300 hover:underline self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Another Session</span>
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#3D5AFE] animate-spin" />
            <p className="text-xs text-slate-500">Loading interview sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-[#3D5AFE] flex items-center justify-center border border-indigo-100 dark:border-indigo-900/40">
              <Bot className="w-8 h-8 text-[#3D5AFE]" />
            </div>

            <div className="space-y-1 max-w-md">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No interview sessions created yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Launch your first mock interview to generate role-specific questions and practice under realistic industry hiring conditions.
              </p>
            </div>

            <button
              onClick={() => setIsWizardOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#3D5AFE] hover:bg-[#304FFE] text-white font-bold text-xs shadow-md shadow-[#3D5AFE]/20 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Your First Session</span>
            </button>
          </div>
        ) : (
          /* Sessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess._id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#3D5AFE] dark:text-cyan-300 border border-indigo-200/50 dark:border-indigo-800/50 uppercase tracking-wider">
                      {sess.interviewType}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        sess.status === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200'
                          : sess.status === 'in_progress'
                          ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-300 border-cyan-200 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200'
                      }`}
                    >
                      {sess.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {sess.role}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                      {sess.experienceLevel} Tier • {sess.difficulty} Difficulty
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {sess.durationMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {sess.totalQuestions} Questions
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleViewSessionQuestions(sess)}
                    disabled={loadingQuestions}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-[#3D5AFE] dark:hover:text-cyan-300 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Question Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <InterviewSetupWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={handleWizardSuccess}
      />

      <QuestionPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        session={activeSession}
        questions={activeQuestions}
      />
    </div>
  );
}

