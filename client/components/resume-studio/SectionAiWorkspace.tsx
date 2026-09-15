'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, 
  Eye, 
  ShieldCheck, 
  Wand2, 
  RefreshCw, 
  Check, 
  Sparkles,
  ChevronDown 
} from 'lucide-react';
import { SectionScore, ScoreRatingTier } from '@/types/resume-scoring.types';
import { SectionImprovementSuggestion } from '@/types/resume-editor.types';

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function getTierPill(tier: ScoreRatingTier | 'Needs attention' | 'Good' | 'Strong' | 'Developing' | 'Needs Work' | 'Exceptional'): string {
  switch (tier) {
    case 'Exceptional':
    case 'Strong':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Good':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Developing':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Needs attention':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Needs Work':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  }
}

interface SectionAiWorkspaceProps {
  sectionData: SectionScore;
  icon: React.ComponentType<{ className?: string }>;
  isGenerating: boolean;
  isApplying: boolean;
  currentSuggestion: SectionImprovementSuggestion | null;
  onGenerate: (instruction: string) => void;
  onApply: () => void;
  onDismissSuggestion: () => void;
  onBack: () => void;
  onPreviewOnResume: () => void;
}

export const SectionAiWorkspace: React.FC<SectionAiWorkspaceProps> = React.memo(({
  sectionData,
  icon: Icon,
  isGenerating,
  isApplying,
  currentSuggestion,
  onGenerate,
  onApply,
  onDismissSuggestion,
  onBack,
  onPreviewOnResume,
}) => {
  // Localized state: typing NEVER re-renders parent page or live preview canvas!
  const [instruction, setInstruction] = useState('');
  const [showScoringDetails, setShowScoringDetails] = useState(false);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onGenerate(instruction.trim());
  }, [instruction, onGenerate]);

  const reviewAreas = useMemo(() => {
    if (!sectionData?.components) return [];
    return sectionData.components.map((comp) => {
      const ratio = comp.score / comp.maxScore;
      let status: 'Needs attention' | 'Good' | 'Strong' = 'Good';
      if (ratio < 0.6) {
        status = 'Needs attention';
      } else if (ratio >= 0.9) {
        status = 'Strong';
      }
      return {
        label: comp.label,
        status,
        reason: comp.reason,
      };
    });
  }, [sectionData]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Back Action & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resume Overview</span>
        </button>

        <button
          onClick={onPreviewOnResume}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview on Resume</span>
        </button>
      </div>

      {/* Section Summary Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {sectionData.title}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Section Analysis
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-2xl font-extrabold ${getScoreColor(sectionData.score)}`}>
              {sectionData.score} <span className="text-sm font-semibold text-slate-400">/ 100</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTierPill(sectionData.tier)}`}>
              {sectionData.tier}
            </span>
          </div>
        </div>

        {/* What needs attention */}
        {sectionData.weaknesses && sectionData.weaknesses.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
              What needs attention
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {sectionData.weaknesses.join(' ')}
            </p>
          </div>
        )}
      </div>

      {/* AI IMPROVEMENT WORKSPACE (Phase 5) */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-50/40 to-white dark:from-indigo-950/20 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Evidence-Locked AI
              </span>
              <span className="text-xs text-slate-400">Zero Hallucinations</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Improve {sectionData.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Strengthen wording, action verbs, and structure using only information already present in your resume.
            </p>
          </div>
        </div>

        {/* Instruction input & Trigger Form (Isolated from parent re-renders) */}
        {!currentSuggestion && !isGenerating && (
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Optional candidate instruction (e.g., &ldquo;Focus on action verbs&rdquo; or &ldquo;Make more concise&rdquo;)
              </label>
              <input
                type="text"
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder="Focus on action verbs and leadership outcomes..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer shadow-indigo-500/20"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Improve with AI</span>
              </button>
              <span className="text-[11px] text-slate-400">
                Your original resume remains unchanged until you approve.
              </span>
            </div>
          </form>
        )}

        {/* Generating Loading State */}
        {isGenerating && (
          <div className="p-6 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-200/60 dark:border-indigo-800/60 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Improving your {sectionData.title} section...
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Analyzing existing facts and calibrating power verbs. Zero facts are being invented.
              </p>
            </div>
          </div>
        )}

        {/* Proposed Suggestion Review Panel */}
        {currentSuggestion && (
          <div className="space-y-4 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 animate-fadeIn">
            {/* Evidence Used Badges */}
            {currentSuggestion.evidenceUsed.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Based on your resume facts
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentSuggestion.evidenceUsed.map((fact, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{fact}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Changes Explanation */}
            {currentSuggestion.changes.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Why this is better
                </span>
                <div className="space-y-2">
                  {currentSuggestion.changes.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="text-[11px] text-slate-400 line-through">
                          {ch.before}
                        </div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-indigo-600 dark:text-indigo-400">
                          {ch.after}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span>{ch.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar: Accept vs Dismiss */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onApply}
                disabled={isApplying}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm cursor-pointer shadow-emerald-500/20 disabled:opacity-50"
              >
                {isApplying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isApplying ? 'Applying...' : 'Accept & Apply Improvement'}</span>
              </button>

              <button
                onClick={onDismissSuggestion}
                disabled={isApplying}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Areas */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Review Areas
        </h3>

        <div className="space-y-3">
          {reviewAreas.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.reason}
                </p>
              </div>
              <span className={`self-start sm:self-center px-2 py-0.5 rounded text-[11px] font-bold border shrink-0 ${getTierPill(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* What is working */}
      {sectionData.strengths && sectionData.strengths.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            What is working
          </h3>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {sectionData.strengths.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transparent Scoring Details (Optional Disclosure) */}
      {sectionData.components && sectionData.components.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-xs">
          <button
            onClick={() => setShowScoringDetails(!showScoringDetails)}
            className="w-full flex items-center justify-between text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold cursor-pointer"
          >
            <span>{showScoringDetails ? 'Hide scoring details' : 'View scoring details'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showScoringDetails ? 'rotate-180' : ''}`} />
          </button>

          {showScoringDetails && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 font-mono">
              {sectionData.components.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>{comp.label}</span>
                  <span className="font-bold">{comp.score} / {comp.maxScore} pts ({comp.rule})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

SectionAiWorkspace.displayName = 'SectionAiWorkspace';
