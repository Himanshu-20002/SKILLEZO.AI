'use client';

import React from 'react';
import { Award, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { CandidateSkill } from '@/services/profile.service';

interface SkillsSectionProps {
  skills: CandidateSkill[];
  onAddSkill?: () => void;
  onDeleteSkill?: (skillName: string) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  skills = [],
  onAddSkill,
  onDeleteSkill,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white space-y-6 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-all">
      {/* Subtle Refraction Glow in Dark Mode */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with + Add Skill button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Technical Skills & Competencies</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified skill badges and proficiency metrics</p>
          </div>
        </div>

        <button
          onClick={onAddSkill}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/40 transition-all text-xs font-bold shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* 2-Column Skill Cards Grid with Light & Dark Theme Adaptation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        {skills.map((skill, idx) => {
          const isExpert = skill.proficiency === 'Expert' || (skill.score && skill.score >= 95);
          const isAdvanced = skill.proficiency === 'Advanced' || (skill.score && skill.score >= 90);

          return (
            <div
              key={idx}
              className="p-4 sm:p-4.5 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700/90 flex items-center justify-between gap-4 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate tracking-tight">
                    {skill.name}
                  </span>
                  {skill.verified !== false && (
                    <span title="Verified Skill" className="shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                  {skill.category || 'Technical'}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right space-y-1">
                  <span
                    className={`inline-block px-3.5 py-0.5 rounded-full text-[11px] font-bold text-center border ${
                      isExpert
                        ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-[#3b1e54] dark:text-[#d8b4fe] dark:border-[#6b21a8]/60'
                        : isAdvanced
                        ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-[#172554] dark:text-[#93c5fd] dark:border-[#1e40af]/60'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-[#064e3b] dark:text-[#6ee7b7] dark:border-[#047857]/60'
                    }`}
                  >
                    {skill.proficiency || (isExpert ? 'Expert' : isAdvanced ? 'Advanced' : 'Intermediate')}
                  </span>
                  {skill.score && (
                    <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 block tracking-tight">
                      {skill.score}/100
                    </span>
                  )}
                </div>

                {onDeleteSkill && (
                  <button
                    onClick={() => onDeleteSkill(skill.name)}
                    title="Remove Skill"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
