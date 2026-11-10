'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bot,
  BrainCircuit,
  Clock,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldAlert,
  Code,
  Users,
  Compass,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  InterviewTemplate,
  InterviewType,
  InterviewDifficulty,
  InterviewMode,
  InterviewSession,
  InterviewQuestion,
  CreateSessionPayload,
} from '@/types/interview-coach';
import { toast } from 'sonner';

interface InterviewSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: InterviewSession, questions: InterviewQuestion[]) => void;
}

const DEFAULT_ROLES = [
  { role: 'React Developer', category: 'Frontend', desc: 'React 19, Server Components, State & Performance' },
  { role: '.NET Developer', category: 'Backend', desc: 'C#, ASP.NET Core, EF Core & Distributed Microservices' },
  { role: 'MERN Developer', category: 'Full-Stack', desc: 'Node.js, Express, MongoDB & React Architecture' },
  { role: 'Python Developer', category: 'Backend', desc: 'FastAPI, Django, Asyncio & Performance Optimization' },
  { role: 'Java Developer', category: 'Enterprise', desc: 'Spring Boot 3, Microservices, JVM & Kafka' },
  { role: 'Data Analyst', category: 'Data & BI', desc: 'Advanced SQL, Pandas, Statistical Analysis & Dashboards' },
  { role: 'AI/ML Specialist', category: 'Data & AI', desc: 'LLMs, RAG, Transformers, Model Tuning & Evaluation' },
  { role: 'Cloud Engineer', category: 'Cloud', desc: 'AWS/GCP/Azure, VPCs, IAM, Serverless & Terraform' },
  { role: 'DevOps Engineer', category: 'DevOps', desc: 'Kubernetes, Docker, CI/CD, Observability & GitOps' },
  { role: 'Business Analyst', category: 'Agile', desc: 'Requirements, User Stories, Process Mapping & Agile' },
];

const SENIORITY_TIERS = [
  { id: 'entry', label: 'Entry Level', desc: 'College grads & internships' },
  { id: 'junior', label: 'Junior', desc: '1–2 years practical experience' },
  { id: 'mid', label: 'Mid-Level', desc: '3–5 years production ownership' },
  { id: 'senior', label: 'Senior', desc: '6+ years architecture & depth' },
  { id: 'lead', label: 'Tech Lead', desc: 'System design & team leadership' },
];

const INTERVIEW_TYPES: { id: InterviewType; label: string; icon: any; desc: string }[] = [
  {
    id: 'technical',
    label: 'Technical Deep-Dive',
    icon: Code,
    desc: 'Algorithms, system mechanics, architecture trade-offs & edge cases.',
  },
  {
    id: 'behavioral',
    label: 'Behavioral & Leadership',
    icon: Users,
    desc: 'STAR method questions on conflict, ownership, and measurable impact.',
  },
  {
    id: 'hr',
    label: 'HR & Cultural Fit',
    icon: Compass,
    desc: 'Motivation, career goals, cross-functional teamwork & communication.',
  },
  {
    id: 'managerial',
    label: 'Managerial & Strategy',
    icon: Briefcase,
    desc: 'Resource allocation, velocity vs. technical debt, and delivery execution.',
  },
];

const DURATION_OPTIONS = [
  { minutes: 15, questions: 3, label: '15 Mins', badge: 'Fast Sprint' },
  { minutes: 30, questions: 5, label: '30 Mins', badge: 'Standard Loop' },
  { minutes: 45, questions: 7, label: '45 Mins', badge: 'Comprehensive' },
];

const DIFFICULTIES: { id: InterviewDifficulty; label: string; badgeClass: string }[] = [
  { id: 'easy', label: 'Foundational (Easy)', badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { id: 'medium', label: 'Industry Standard (Medium)', badgeClass: 'bg-indigo-500/15 text-[#3D5AFE] dark:text-cyan-300 border-indigo-500/30' },
  { id: 'hard', label: 'Advanced Rigor (Hard)', badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
];

export const InterviewSetupWizard: React.FC<InterviewSetupWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  const [templates, setTemplates] = useState<InterviewTemplate[]>([]);

  // Wizard Selections
  const [selectedRole, setSelectedRole] = useState<string>('React Developer');
  const [selectedTier, setSelectedTier] = useState<string>('mid');
  const [selectedType, setSelectedType] = useState<InterviewType>('technical');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty>('medium');
  const [selectedMode] = useState<InterviewMode>('text');

  // Load backend templates
  useEffect(() => {
    if (!isOpen) return;
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const res = await apiFetch<{ success: boolean; data: InterviewTemplate[] }>(
          '/api/interviews/templates'
        );
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setTemplates(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch remote templates, using local catalog:', err);
      } finally {
        setLoadingTemplates(false);
      }
    };
    fetchTemplates();
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDurationConfig = DURATION_OPTIONS.find((d) => d.minutes === selectedDuration) || DURATION_OPTIONS[1];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payload: CreateSessionPayload = {
        role: selectedRole,
        experienceLevel: selectedTier,
        interviewType: selectedType,
        difficulty: selectedDifficulty,
        mode: selectedMode,
        durationMinutes: selectedDuration,
        totalQuestions: currentDurationConfig.questions,
      };

      const res = await apiFetch<{
        success: boolean;
        data: {
          session: InterviewSession;
          questions: InterviewQuestion[];
        };
      }>('/api/interviews/sessions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res?.data?.session && res?.data?.questions) {
        toast.success('Interview Plan Calibrated!', {
          description: `Generated ${res.data.questions.length} questions for ${selectedRole}.`,
        });
        onSuccess(res.data.session, res.data.questions);
        onClose();
      } else {
        throw new Error('Unexpected response format from interview engine');
      }
    } catch (err: any) {
      toast.error('Failed to create interview session', {
        description: err.message || 'Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3D5AFE]/10 dark:bg-indigo-950/80 text-[#3D5AFE] flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 text-[#3D5AFE]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Configure Mock Interview
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-[#3D5AFE] dark:text-indigo-400 font-extrabold uppercase border border-indigo-200/50 dark:border-indigo-800/50">
                  AI Calibrated
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Step {step} of 3 • {step === 1 ? 'Select Target Role' : step === 2 ? 'Experience & Format' : 'Duration & Difficulty'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-[#3D5AFE] to-[#00D9C0] h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Select Target Role */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">What role are you practicing for?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Questions are dynamically generated to match industry hiring standards for this position.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {(templates.length > 0 ? templates : DEFAULT_ROLES).map((item: any) => {
                  const roleName = item.role;
                  const isSelected = selectedRole === roleName;

                  return (
                    <button
                      key={roleName}
                      type="button"
                      onClick={() => setSelectedRole(roleName)}
                      className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#3D5AFE] bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs ring-2 ring-[#3D5AFE]/30'
                          : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {roleName}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#3D5AFE] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.desc || (item.competencyAreas ? item.competencyAreas.slice(0, 3).join(', ') : 'Calibrated assessment')}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Seniority & Interview Format */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Seniority Tier */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Candidate Seniority Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                  {SENIORITY_TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTier(tier.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3D5AFE] text-white border-[#3D5AFE] shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">{tier.label}</div>
                        <div className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {tier.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interview Type */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Interview Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                  {INTERVIEW_TYPES.map((type) => {
                    const isSelected = selectedType === type.id;
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#3D5AFE] bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-[#3D5AFE]/30'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-[#3D5AFE]' : 'text-slate-500'}`} />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {type.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {type.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Duration & Difficulty */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Duration & Question Count */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Session Duration & Question Count</span>
                  <span className="text-slate-400 font-normal text-[11px]">
                    {currentDurationConfig.questions} Questions calibrated for {selectedDuration} mins
                  </span>
                </label>
                <div className="grid grid-cols-3 gap-2.5 mt-2">
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = selectedDuration === opt.minutes;
                    return (
                      <button
                        key={opt.minutes}
                        type="button"
                        onClick={() => setSelectedDuration(opt.minutes)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#3D5AFE] bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-[#3D5AFE]/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 text-[#3D5AFE] dark:text-indigo-400 font-extrabold text-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{opt.label}</span>
                        </div>
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1">
                          {opt.questions} Questions
                        </div>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Target Rigor & Difficulty
                </label>
                <div className="space-y-2 mt-2">
                  {DIFFICULTIES.map((diff) => {
                    const isSelected = selectedDifficulty === diff.id;
                    return (
                      <button
                        key={diff.id}
                        type="button"
                        onClick={() => setSelectedDifficulty(diff.id)}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#3D5AFE] bg-indigo-50/40 dark:bg-indigo-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {diff.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.badgeClass}`}>
                          {diff.id.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ready Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-900/60 shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                  <BrainCircuit className="w-4 h-4 animate-pulse" />
                  <span>Interview Blueprint Ready to Calibrate</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Targeting <strong className="text-white">{selectedRole}</strong> ({selectedTier.toUpperCase()}) for a{' '}
                  <strong className="text-white">{selectedType}</strong> assessment. Generating {currentDurationConfig.questions} questions via Gemini AI.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-850/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#3D5AFE] hover:bg-[#304FFE] px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-[#3D5AFE] via-indigo-600 to-[#00D9C0] hover:opacity-95 px-5 py-2.5 rounded-xl shadow-md shadow-[#3D5AFE]/25 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Calibrating Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Generate Interview Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

