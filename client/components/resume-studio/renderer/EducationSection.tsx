import React, { useCallback } from 'react';
import { ResumeEducationItem } from '@/types/resume-document';
import { ResumeBuilderConfig } from '@/types/resume-builder.types';
import { resolveConfigClasses } from './templates';
import { InlineText } from './InlineText';

interface EducationSectionProps {
  education?: ResumeEducationItem[];
  isHighlighted?: boolean;
  onClick?: () => void;
  config?: ResumeBuilderConfig | null;
  onUpdateEducation?: (updatedEducation: ResumeEducationItem[]) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = React.memo(({
  education,
  isHighlighted,
  onClick,
  config,
  onUpdateEducation,
}) => {
  if (!education || education.length === 0) return null;

  const { template, sectionSpacingClass } = resolveConfigClasses(config);
  const isCompact = config?.templateId === 'compact';

  const handleInstitutionChange = useCallback((id: string, newInst: string) => {
    if (!onUpdateEducation) return;
    const updated = education.map((e) =>
      e.id === id ? { ...e, institution: newInst } : e
    );
    onUpdateEducation(updated);
  }, [education, onUpdateEducation]);

  const handleDegreeChange = useCallback((id: string, newDegree: string) => {
    if (!onUpdateEducation) return;
    const updated = education.map((e) =>
      e.id === id ? { ...e, degree: newDegree } : e
    );
    onUpdateEducation(updated);
  }, [education, onUpdateEducation]);

  return (
    <section
      id="resume-section-education"
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
        Education
      </h2>

      <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
        {education.map((edu) => {
          const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');

          return (
            <div
              key={edu.id}
              className={`space-y-1 break-inside-avoid print:break-inside-avoid ${
                isCompact ? 'text-xs' : 'text-xs sm:text-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-0.5">
                {onUpdateEducation ? (
                  <InlineText
                    value={edu.institution}
                    onChange={(val) => handleInstitutionChange(edu.id, val)}
                    placeholder="Institution Name"
                    className="font-bold text-slate-900 dark:text-slate-100"
                  />
                ) : (
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {edu.institution}
                  </span>
                )}

                {dateRange && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                    {dateRange}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600 dark:text-slate-400">
                {onUpdateEducation ? (
                  <InlineText
                    value={edu.degree || edu.fieldOfStudy || ''}
                    onChange={(val) => handleDegreeChange(edu.id, val)}
                    placeholder="Degree or Field of Study"
                    className="font-medium text-slate-700 dark:text-slate-300"
                  />
                ) : (
                  edu.degree && (
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {[edu.degree, edu.fieldOfStudy].filter(Boolean).join(' in ')}
                    </span>
                  )
                )}

                {edu.gradeOrGpa && (
                  <span>
                    GPA / Score: <strong className="text-slate-700 dark:text-slate-300">{edu.gradeOrGpa}</strong>
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
});

EducationSection.displayName = 'EducationSection';
