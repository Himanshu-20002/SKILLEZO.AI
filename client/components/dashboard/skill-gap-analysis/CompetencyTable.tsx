'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Plus,
  Check,
  ExternalLink,
  Sparkles,
  X,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { CompetencyItem } from '@/types/career-intelligence';

interface CompetencyTableProps {
  competencies: CompetencyItem[];
  roadmapSkills?: string[];
  onAddToRoadmap: (skill: CompetencyItem) => void;
  onQuickVerify?: (skillName: string, level: string) => Promise<void> | void;
}

export const CompetencyTable: React.FC<CompetencyTableProps> = ({
  competencies,
  roadmapSkills = [],
  onAddToRoadmap,
  onQuickVerify,
}) => {
  // Modal state for "I know this" quick verification
  const [verifyModalSkill, setVerifyModalSkill] = useState<CompetencyItem | null>(null);
  const [selectedProficiency, setSelectedProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleConfirmVerify = async () => {
    if (!verifyModalSkill || !onQuickVerify) return;
    setIsVerifying(true);
    try {
      await onQuickVerify(verifyModalSkill.skill, selectedProficiency);
      setVerifyModalSkill(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const isSkillInRoadmap = (skillName: string): boolean => {
    const clean = skillName.toLowerCase();
    return roadmapSkills.some((s) => s.toLowerCase().includes(clean) || clean.includes(s.toLowerCase()));
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-[#3D5AFE] dark:text-[#00D9C0]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Competency Match Breakdown</h2>
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {competencies.length} Key Competencies
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed skill matrix vs industry target role requirements • Add missing skills to roadmap or claim proficiency
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/career-gps"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3D5AFE] dark:text-[#00D9C0] hover:underline self-start sm:self-auto"
        >
          <span>View Career GPS</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="pb-3 px-2">Skill</th>
              <th className="pb-3 px-2">Category</th>
              <th className="pb-3 px-2">Current Level</th>
              <th className="pb-3 px-2">Required Level</th>
              <th className="pb-3 px-2 text-center">Priority</th>
              <th className="pb-3 px-2 text-center">Status</th>
              <th className="pb-3 px-2 text-right">Action / Guidance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {competencies.map((comp) => {
              const inRoadmap = isSkillInRoadmap(comp.skill);
              const isMatched = comp.status === 'Matched';

              return (
                <tr key={comp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-slate-100">
                    {comp.skill}
                  </td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400">{comp.category}</td>
                  <td className="py-3 px-2">
                    {comp.currentLevel === 'Unranked' ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
                        Unranked
                      </span>
                    ) : (
                      <span className="font-semibold text-[#3D5AFE] dark:text-[#00D9C0] text-xs">
                        {comp.currentLevel}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 font-medium text-slate-700 dark:text-slate-300">{comp.requiredLevel}</td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        comp.priority === 'High'
                          ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                          : comp.priority === 'Medium'
                          ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                      }`}
                    >
                      {comp.priority}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {isMatched ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Matched
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <AlertCircle className="w-3 h-3" />
                        Skill Gap
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right">
                    {inRoadmap ? (
                      <div className="flex items-center justify-end">
                        <Link
                          href="/dashboard/career-gps"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/60 text-[#3D5AFE] dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 font-semibold text-[11px] hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs"
                          title="This milestone is in your Career GPS constellation"
                        >
                          <Check className="w-3 h-3 text-[#3D5AFE]" />
                          <span>In Roadmap</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                        </Link>
                      </div>
                    ) : isMatched ? (
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => onAddToRoadmap(comp)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-600 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-300 dark:hover:border-amber-700/60 font-medium text-[11px] transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Unsure or want to refresh? Add a revision milestone to Career GPS"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400 hover:text-amber-500" />
                          <span>Revisit</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end">
                        <div className="inline-flex items-center rounded-lg border border-[#3D5AFE]/30 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs overflow-hidden">
                          <button
                            onClick={() => onAddToRoadmap(comp)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#3D5AFE] hover:bg-[#304FFE] text-white font-semibold text-[11px] transition-colors cursor-pointer"
                            title="Add as an active milestone in Career GPS"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Roadmap</span>
                          </button>
                          <button
                            onClick={() => {
                              setVerifyModalSkill(comp);
                              setSelectedProficiency(
                                comp.requiredLevel === 'Expert' ? 'Advanced' : comp.requiredLevel
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border-l border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                            title="I already have this skill — verify and add to my profile"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>I know this</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Quick-Verify Modal ("I know this") ────────────────────────────── */}
      {verifyModalSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    Claim &amp; Verify Skill
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add <strong className="text-slate-800 dark:text-slate-200">{verifyModalSkill.skill}</strong> directly to your profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVerifyModalSkill(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Your Proficiency Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedProficiency(lvl)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      selectedProficiency === lvl
                        ? 'bg-[#3D5AFE] text-white border-[#3D5AFE] shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                Required level for this role: <strong className="text-slate-800 dark:text-slate-200">{verifyModalSkill.requiredLevel}</strong>. 
                Claiming this skill updates your profile facts and boosts your role match score immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyModalSkill(null)}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                disabled={isVerifying}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#3D5AFE] hover:bg-[#304FFE] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Add to Profile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
