'use client';

import React from 'react';
import {
  GraduationCap,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { CandidateEducation } from '@/services/profile.service';

interface EducationSectionProps {
  education?: CandidateEducation[];
  onAddEducation: () => void;
  onDeleteEducation?: (index: number) => Promise<void> | void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education = [],
  onAddEducation,
  onDeleteEducation,
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white space-y-6 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06),0_4px_10px_-2px_rgba(15,23,42,0.04)] dark:shadow-xl relative overflow-hidden backdrop-blur-xl transition-all">
      {/* Background Refraction Glow */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-[#3D5AFE]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Academic Background & Education
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#3D5AFE]/10 text-[#3D5AFE] dark:text-[#38BDF8] border border-[#3D5AFE]/20">
                {education.length} {education.length === 1 ? 'Degree' : 'Degrees'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Degrees, institutions, honors, and verified academic history
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddEducation}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/40 transition-all text-xs font-bold shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Add Education</span>
        </button>
      </div>

      {/* Education Content: Empty State or Cards Grid */}
      {education.length === 0 ? (
        <div className="relative z-10 p-8 rounded-2xl bg-slate-50/60 dark:bg-[#1c263d]/60 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No academic history added yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Upload your resume to automatically extract your degree and university, or click &quot;Add Education&quot; to specify it manually.
            </p>
          </div>
          <button
            type="button"
            onClick={onAddEducation}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your Degree</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {education.map((item, idx) => {
            const displayDegree = item.degree
              ? item.fieldOfStudy
                ? `${item.degree} in ${item.fieldOfStudy}`
                : item.degree
              : item.fieldOfStudy || 'Higher Education Degree';

            const yearLabel =
              item.startYear && item.endYear
                ? `${item.startYear} – ${item.endYear}`
                : item.endYear
                ? `Graduated ${item.endYear}`
                : item.startYear
                ? `Started ${item.startYear}`
                : null;

            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/90 dark:bg-[#1c263d] border border-slate-200/80 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700/90 flex flex-col justify-between gap-4 transition-all group relative overflow-hidden shadow-sm"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white block tracking-tight">
                        {displayDegree}
                      </span>
                      <p className="text-xs font-semibold text-[#3D5AFE] dark:text-[#38BDF8] flex items-center gap-1.5 truncate">
                        <BookOpen className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.institution}</span>
                      </p>
                    </div>

                    {onDeleteEducation && (
                      <button
                        type="button"
                        onClick={() => onDeleteEducation(idx)}
                        title="Remove Education"
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {yearLabel && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{yearLabel}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
