'use client';

import React from 'react';
import { Award, CheckCircle2, Plus } from 'lucide-react';
import { UserSkill } from '@/types/profile';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface SkillsSectionProps {
  skills: UserSkill[];
  onAddSkill?: () => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onAddSkill }) => {
  return (
    <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md space-y-4">
      <CardHeader
        title="Technical Skills & Competencies"
        subtitle="Verified skill badges and proficiency metrics"
        icon={<Award className="w-5 h-5 text-[#00D9C0]" />}
        action={
          <button
            onClick={onAddSkill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100 truncate">{skill.name}</span>
                {skill.verified && (
                  <span title="Verified Skill">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 block">{skill.category}</span>
            </div>

            <div className="text-right shrink-0">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3D5AFE]/15 text-[#3D5AFE] border border-[#3D5AFE]/30 block mb-1">
                {skill.proficiency}
              </span>
              {skill.score && (
                <span className="text-xs font-bold text-emerald-400">{skill.score}/100</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
