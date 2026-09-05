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
    <div className="p-6 sm:p-8 rounded-3xl bg-[#131b2e] border border-slate-800/90 text-white space-y-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with + Add Skill button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Technical Skills & Competencies</h2>
            <p className="text-xs text-slate-400 font-medium">Verified skill badges and proficiency metrics</p>
          </div>
        </div>

        <button
          onClick={onAddSkill}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-white border border-slate-700/80 hover:border-emerald-500/40 transition-all text-xs font-bold shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* 2-Column Skill Cards Grid matching the theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
        {skills.map((skill, idx) => {
          const isExpert = skill.proficiency === 'Expert' || (skill.score && skill.score >= 95);
          const isAdvanced = skill.proficiency === 'Advanced' || (skill.score && skill.score >= 90);
          const isIntermediate = !isExpert && !isAdvanced;

          return (
            <div
              key={idx}
              className="p-4 sm:p-4.5 rounded-2xl bg-[#1c263d] border border-slate-800/90 hover:border-slate-700/90 flex items-center justify-between gap-4 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight">
                    {skill.name}
                  </span>
                  {skill.verified !== false && (
                    <span title="Verified Skill" className="shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-400 block truncate">
                  {skill.category || 'Technical'}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right space-y-1">
                  <span
                    className={`inline-block px-3.5 py-0.5 rounded-full text-[11px] font-bold text-center border ${
                      isExpert
                        ? 'bg-[#3b1e54] text-[#d8b4fe] border-[#6b21a8]/60'
                        : isAdvanced
                        ? 'bg-[#172554] text-[#93c5fd] border-[#1e40af]/60'
                        : 'bg-[#064e3b] text-[#6ee7b7] border-[#047857]/60'
                    }`}
                  >
                    {skill.proficiency || (isExpert ? 'Expert' : isAdvanced ? 'Advanced' : 'Intermediate')}
                  </span>
                  {skill.score && (
                    <span className="text-xs sm:text-sm font-black text-emerald-400 block tracking-tight">
                      {skill.score}/100
                    </span>
                  )}
                </div>

                {onDeleteSkill && (
                  <button
                    onClick={() => onDeleteSkill(skill.name)}
                    title="Remove Skill"
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
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
