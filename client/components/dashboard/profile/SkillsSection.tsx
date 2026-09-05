'use client';

import React from 'react';
import { Award, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { CandidateSkill } from '@/services/profile.service';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

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
    <div className="p-6 sm:p-7 rounded-3xl bg-[#0c1427]/90 dark:bg-slate-900/90 border border-slate-800 text-white backdrop-blur-xl space-y-5 shadow-sm dark:shadow-md relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with + Add Skill button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Technical Skills & Competencies</h2>
            <p className="text-xs text-slate-400">Verified skill badges and proficiency metrics</p>
          </div>
        </div>

        <button
          onClick={onAddSkill}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700/80 transition-all text-xs font-bold shrink-0 cursor-pointer shadow-sm hover:border-slate-600"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Skill</span>
        </button>
      </div>

      {/* 2-Column Skill Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10">
        {skills.map((skill, idx) => {
          const isExpert = skill.proficiency === 'Expert' || (skill.score && skill.score >= 95);
          const isAdvanced = skill.proficiency === 'Advanced' || (skill.score && skill.score >= 90);

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 transition-all group relative overflow-hidden shadow-sm"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white truncate tracking-tight">{skill.name}</span>
                  {skill.verified !== false && (
                    <span title="Verified Competency" className="shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-400 block truncate">
                  {skill.category || 'Technical'}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right space-y-0.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      isExpert
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : isAdvanced
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {skill.proficiency || (isExpert ? 'Expert' : isAdvanced ? 'Advanced' : 'Intermediate')}
                  </span>
                  {skill.score && (
                    <span className="text-xs font-black text-emerald-400 block tracking-tight">
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
