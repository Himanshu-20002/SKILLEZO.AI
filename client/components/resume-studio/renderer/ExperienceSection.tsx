import React, { useCallback } from 'react';
import { ResumeExperienceItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { resolveConfigClasses } from './templates';
import { InlineText } from './InlineText';

interface ExperienceSectionProps {
  experience?: ResumeExperienceItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
  onUpdateExperience?: (updatedExperience: ResumeExperienceItem[]) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = React.memo(({
  experience,
  isHighlighted,
  onClick,
  config,
  onUpdateExperience,
}) => {
  if (!experience || experience.length === 0) return null;

  const { template, sectionSpacingClass, lineHeightClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

  const handleJobTitleChange = useCallback((itemId: string, newTitle: string) => {
    if (!onUpdateExperience) return;
    const updated = experience.map((item) =>
      item.id === itemId ? { ...item, jobTitle: newTitle } : item
    );
    onUpdateExperience(updated);
  }, [experience, onUpdateExperience]);

  const handleCompanyChange = useCallback((itemId: string, newCompany: string) => {
    if (!onUpdateExperience) return;
    const updated = experience.map((item) =>
      item.id === itemId ? { ...item, companyName: newCompany } : item
    );
    onUpdateExperience(updated);
  }, [experience, onUpdateExperience]);

  const handleBulletChange = useCallback((itemId: string, bulletId: string, newText: string) => {
    if (!onUpdateExperience) return;
    const updated = experience.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        bullets: item.bullets.map((b) =>
          b.id === bulletId ? { ...b, text: newText } : b
        ),
      };
    });
    onUpdateExperience(updated);
  }, [experience, onUpdateExperience]);

  return (
    <section
      id="resume-section-experience"
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
        Work Experience
      </h2>

      <div className={isCompact ? 'space-y-2.5' : 'space-y-3.5'}>
        {experience.map((item) => {
          const dateRange = [
            item.startDate,
            item.isCurrent ? 'Present' : item.endDate,
          ]
            .filter(Boolean)
            .join(' – ');

          return (
            <div
              key={item.id}
              className={`space-y-1 break-inside-avoid print:break-inside-avoid ${
                isCompact ? 'text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  {onUpdateExperience ? (
                    <InlineText
                      value={item.jobTitle}
                      onChange={(val) => handleJobTitleChange(item.id, val)}
                      placeholder="Job Title"
                      className="font-bold text-slate-900 dark:text-slate-100"
                    />
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.jobTitle}
                    </span>
                  )}
                  <span className="text-slate-400 dark:text-slate-500">|</span>
                  {onUpdateExperience ? (
                    <InlineText
                      value={item.companyName}
                      onChange={(val) => handleCompanyChange(item.id, val)}
                      placeholder="Company Name"
                      className="font-semibold text-slate-700 dark:text-slate-300"
                    />
                  ) : (
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.companyName}
                    </span>
                  )}
                  {item.location && (
                    <span className="text-slate-400 dark:text-slate-500 text-xs">
                      ({item.location})
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                  {dateRange}
                </div>
              </div>

              {/* Bullets with metric badges */}
              {item.bullets && item.bullets.length > 0 && (
                <ul className={`list-disc list-outside pl-4 space-y-0.5 text-slate-700 dark:text-slate-300 ${lineHeightClass}`}>
                  {item.bullets.map((b) => (
                    <li key={b.id} className="leading-relaxed">
                      {onUpdateExperience ? (
                        <InlineText
                          as="span"
                          multiline={true}
                          value={b.text}
                          onChange={(val) => handleBulletChange(item.id, b.id, val)}
                          placeholder="Type achievement bullet point..."
                          className="w-full inline-block"
                        />
                      ) : (
                        <span>{b.text}</span>
                      )}
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
});

ExperienceSection.displayName = 'ExperienceSection';
