'use client';

import React from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { UserEducation } from '@/types/profile';
import { CardHeader } from '@/components/dashboard/common/CardHeader';

interface EducationSectionProps {
  education: UserEducation[];
  onAddEducation?: () => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onAddEducation
}) => {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/80 backdrop-blur-md space-y-4 shadow-sm">
      <CardHeader
        title="Academic Education"
        subtitle="Degrees & university credentials"
        icon={<GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
        action={
          <button
            onClick={onAddEducation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        }
      />

      <div className="space-y-3">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{edu.institution}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {edu.degree} in {edu.fieldOfStudy}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {edu.startYear} – {edu.endYear}
              </p>
            </div>

            {edu.grade && (
              <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shrink-0">
                {edu.grade}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
