import React from 'react';
import { ResumeExperienceItem } from '@/types/resume-document';

interface ExperienceSectionProps {
  experience?: ResumeExperienceItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  isHighlighted,
  onClick,
}) => {
  if (!experience || experience.length === 0) return null;

  return (
    <section
      id="resume-section-experience"
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
        Work Experience
      </h2>

      <div className="space-y-4">
        {experience.map((item) => {
          const dateRange = [
            item.startDate,
            item.isCurrent ? 'Present' : item.endDate,
          ]
            .filter(Boolean)
            .join(' – ');

          return (
            <div key={item.id} className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {item.jobTitle}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.companyName}
                  </span>
                  {item.location && (
                    <span className="text-slate-500 dark:text-slate-400 text-xs">
                      ({item.location})
                    </span>
                  )}
                </div>

                {dateRange && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                    {dateRange}
                  </span>
                )}
              </div>

              {/* Bullets */}
              {item.bullets && item.bullets.length > 0 && (
                <ul className="list-disc list-outside pl-4 space-y-1 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {item.bullets.map((b) => (
                    <li key={b.id}>
                      <span>{b.text}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Technologies footer if any */}
              {item.technologiesUsed && item.technologiesUsed.length > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-0.5">
                  <span className="font-medium">Technologies: </span>
                  {item.technologiesUsed.join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
