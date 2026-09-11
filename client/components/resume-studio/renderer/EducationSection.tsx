import React from 'react';
import { ResumeEducationItem } from '@/types/resume-document';

interface EducationSectionProps {
  education?: ResumeEducationItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  isHighlighted,
  onClick,
}) => {
  if (!education || education.length === 0) return null;

  return (
    <section
      id="resume-section-education"
      onClick={onClick}
      className={`transition-all duration-200 mb-6 ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 border-b border-slate-300 dark:border-slate-700 pb-1 mb-3 font-mono">
        Education
      </h2>

      <div className="space-y-3">
        {education.map((edu) => {
          const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
          const degreeAndField = [edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ');

          return (
            <div key={edu.id} className="space-y-1 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {edu.institution}
                </span>
                {dateRange && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                    {dateRange}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-baseline gap-x-2 text-slate-700 dark:text-slate-300">
                {degreeAndField && <span>{degreeAndField}</span>}
                {edu.gradeOrGpa && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    ({edu.gradeOrGpa})
                  </span>
                )}
              </div>

              {edu.honors && edu.honors.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Honors: {edu.honors.join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
