import React from 'react';
import { ResumeAchievementItem } from '@/types/resume-document';
import { ExternalLink } from 'lucide-react';

interface AchievementsSectionProps {
  achievements?: ResumeAchievementItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  isHighlighted,
  onClick,
}) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <section
      id="resume-section-achievements"
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
        Achievements & Certifications
      </h2>

      <div className="space-y-3">
        {achievements.map((ach) => (
          <div key={ach.id} className="space-y-1 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {ach.title}
                </span>
                {ach.issuer && (
                  <span className="text-slate-600 dark:text-slate-400 text-xs">
                    — {ach.issuer}
                  </span>
                )}
                {ach.url && (
                  <a
                    href={ach.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:underline text-xs ml-1"
                  >
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                )}
              </div>

              {ach.date && (
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                  {ach.date}
                </span>
              )}
            </div>

            {ach.description && (
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {ach.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
