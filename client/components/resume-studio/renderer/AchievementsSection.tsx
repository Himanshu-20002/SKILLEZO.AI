import React from 'react';
import { ResumeAchievementItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { ExternalLink } from 'lucide-react';
import { resolveConfigClasses } from './templates';
import { formatAchievementItem } from '../utils/resume-content.util';

interface AchievementsSectionProps {
  achievements?: ResumeAchievementItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = React.memo(({
  achievements,
  isHighlighted,
  onClick,
  config,
}) => {
  if (!achievements || achievements.length === 0) return null;

  const { template, sectionSpacingClass, lineHeightClass, accentTextClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

  return (
    <section
      id="resume-section-achievements"
      onClick={onClick}
      className={`transition-all duration-200 break-inside-avoid print:break-inside-avoid ${sectionSpacingClass} ${
        isHighlighted
          ? 'ring-2 ring-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-lg p-3 -m-3'
          : onClick
          ? 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-lg p-1 -m-1'
          : ''
      }`}
    >
      <h2 className={template.sectionHeaderStyle}>
        Achievements & Certifications
      </h2>

      <ul className={`${template.bulletStyle} text-slate-700 dark:text-slate-300 ${lineHeightClass}`}>
        {achievements.map((ach) => {
          const formatted = formatAchievementItem(ach);

          return (
            <li
              key={ach.id}
              className={`break-inside-avoid print:break-inside-avoid ${
                isCompact ? 'text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div className="flex flex-wrap items-baseline gap-1.5">
                  {formatted.boldPrefix && (
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatted.boldPrefix}
                    </span>
                  )}

                  {formatted.normalText && (
                    <span className="font-normal text-slate-700 dark:text-slate-300">
                      {formatted.normalText}
                    </span>
                  )}

                  {ach.url && (
                    <a
                      href={ach.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-0.5 text-xs hover:underline ${accentTextClass}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Credential</span>
                    </a>
                  )}
                </div>

                {formatted.formattedDate && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    {formatted.formattedDate}
                  </span>
                )}
              </div>

              {ach.description && (
                <p className={`text-slate-600 dark:text-slate-400 text-xs mt-0.5 ${lineHeightClass}`}>
                  {ach.description}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
});

AchievementsSection.displayName = 'AchievementsSection';
